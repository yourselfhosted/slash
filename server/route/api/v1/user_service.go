package v1

import (
	"context"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/pkg/errors"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/exp/slices"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"

	apiv1pb "github.com/yourselfhosted/slash/proto/gen/api/v1"
	storepb "github.com/yourselfhosted/slash/proto/gen/store"
	"github.com/yourselfhosted/slash/server/service/license"
	"github.com/yourselfhosted/slash/store"
)

const (
	// BotID is the id of bot.
	BotID = 0
)

func (s *APIV1Service) ListUsers(ctx context.Context, _ *apiv1pb.ListUsersRequest) (*apiv1pb.ListUsersResponse, error) {
	users, err := s.Store.ListUsers(ctx, &store.FindUser{})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to list users: %v", err)
	}

	userMessages := []*apiv1pb.User{}
	for _, user := range users {
		userMessages = append(userMessages, convertUserFromStore(user))
	}
	response := &apiv1pb.ListUsersResponse{
		Users: userMessages,
	}
	return response, nil
}

func (s *APIV1Service) GetUser(ctx context.Context, request *apiv1pb.GetUserRequest) (*apiv1pb.GetUserResponse, error) {
	user, err := s.Store.GetUser(ctx, &store.FindUser{
		ID: &request.Id,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to find user: %v", err)
	}
	if user == nil {
		return nil, status.Errorf(codes.NotFound, "user not found")
	}

	userMessage := convertUserFromStore(user)
	response := &apiv1pb.GetUserResponse{
		User: userMessage,
	}
	return response, nil
}

func (s *APIV1Service) CreateUser(ctx context.Context, request *apiv1pb.CreateUserRequest) (*apiv1pb.CreateUserResponse, error) {
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(request.User.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to hash password: %v", err)
	}

	if !s.LicenseService.IsFeatureEnabled(license.FeatureTypeUnlimitedAccounts) {
		userList, err := s.Store.ListUsers(ctx, &store.FindUser{})
		if err != nil {
			return nil, status.Errorf(codes.Internal, "failed to list users: %v", err)
		}
		if len(userList) >= 5 {
			return nil, status.Errorf(codes.ResourceExhausted, "maximum number of users reached")
		}
	}

	user, err := s.Store.CreateUser(ctx, &store.User{
		Email:        request.User.Email,
		Nickname:     request.User.Nickname,
		Role:         store.RoleUser,
		PasswordHash: string(passwordHash),
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to create user: %v", err)
	}
	response := &apiv1pb.CreateUserResponse{
		User: convertUserFromStore(user),
	}
	return response, nil
}

func (s *APIV1Service) UpdateUser(ctx context.Context, request *apiv1pb.UpdateUserRequest) (*apiv1pb.UpdateUserResponse, error) {
	user, err := getCurrentUser(ctx, s.Store)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "failed to get current user: %v", err)
	}
	if user.ID != request.User.Id {
		return nil, status.Errorf(codes.PermissionDenied, "Permission denied")
	}
	if request.UpdateMask == nil || len(request.UpdateMask.Paths) == 0 {
		return nil, status.Errorf(codes.InvalidArgument, "UpdateMask is empty")
	}

	userUpdate := &store.UpdateUser{
		ID: request.User.Id,
	}
	for _, path := range request.UpdateMask.Paths {
		if path == "email" {
			userUpdate.Email = &request.User.Email
		} else if path == "nickname" {
			userUpdate.Nickname = &request.User.Nickname
		}
	}
	user, err = s.Store.UpdateUser(ctx, userUpdate)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to update user: %v", err)
	}
	return &apiv1pb.UpdateUserResponse{
		User: convertUserFromStore(user),
	}, nil
}

func (s *APIV1Service) DeleteUser(ctx context.Context, request *apiv1pb.DeleteUserRequest) (*apiv1pb.DeleteUserResponse, error) {
	user, err := getCurrentUser(ctx, s.Store)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "failed to get current user: %v", err)
	}
	if user.ID == request.Id {
		return nil, status.Errorf(codes.InvalidArgument, "cannot delete yourself")
	}

	if err := s.Store.DeleteUser(ctx, &store.DeleteUser{ID: request.Id}); err != nil {
		return nil, status.Errorf(codes.Internal, "failed to delete user: %v", err)
	}
	response := &apiv1pb.DeleteUserResponse{}
	return response, nil
}

func (s *APIV1Service) ListUserAccessTokens(ctx context.Context, request *apiv1pb.ListUserAccessTokensRequest) (*apiv1pb.ListUserAccessTokensResponse, error) {
	user, err := getCurrentUser(ctx, s.Store)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "failed to get current user: %v", err)
	}
	if user.ID != request.Id {
		return nil, status.Errorf(codes.PermissionDenied, "Permission denied")
	}

	userAccessTokens, err := s.Store.GetUserAccessTokens(ctx, user.ID)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to list access tokens: %v", err)
	}

	accessTokens := []*apiv1pb.UserAccessToken{}
	for _, userAccessToken := range userAccessTokens {
		claims := &ClaimsMessage{}
		_, err := jwt.ParseWithClaims(userAccessToken.AccessToken, claims, func(t *jwt.Token) (any, error) {
			if t.Method.Alg() != jwt.SigningMethodHS256.Name {
				return nil, errors.Errorf("unexpected access token signing method=%v, expect %v", t.Header["alg"], jwt.SigningMethodHS256)
			}
			if kid, ok := t.Header["kid"].(string); ok {
				if kid == "v1" {
					return []byte(s.Secret), nil
				}
			}
			return nil, errors.Errorf("unexpected access token kid=%v", t.Header["kid"])
		})
		if err != nil {
			// If the access token is invalid or expired, just ignore it.
			continue
		}

		userAccessToken := &apiv1pb.UserAccessToken{
			AccessToken: userAccessToken.AccessToken,
			Description: userAccessToken.Description,
			IssuedAt:    timestamppb.New(claims.IssuedAt.Time),
		}
		if claims.ExpiresAt != nil {
			userAccessToken.ExpiresAt = timestamppb.New(claims.ExpiresAt.Time)
		}
		accessTokens = append(accessTokens, userAccessToken)
	}

	// Sort by issued time in descending order.
	slices.SortFunc(accessTokens, func(i, j *apiv1pb.UserAccessToken) int {
		return int(i.IssuedAt.Seconds - j.IssuedAt.Seconds)
	})
	response := &apiv1pb.ListUserAccessTokensResponse{
		AccessTokens: accessTokens,
	}
	return response, nil
}

func (s *APIV1Service) CreateUserAccessToken(ctx context.Context, request *apiv1pb.CreateUserAccessTokenRequest) (*apiv1pb.CreateUserAccessTokenResponse, error) {
	user, err := getCurrentUser(ctx, s.Store)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "failed to get current user: %v", err)
	}
	if user.ID != request.Id {
		return nil, status.Errorf(codes.PermissionDenied, "Permission denied")
	}

	expiresAt := time.Time{}
	if request.ExpiresAt != nil {
		expiresAt = request.ExpiresAt.AsTime()
	}
	accessToken, err := GenerateAccessToken(user.Email, user.ID, expiresAt, []byte(s.Secret))
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to generate access token: %v", err)
	}

	claims := &ClaimsMessage{}
	_, err = jwt.ParseWithClaims(accessToken, claims, func(t *jwt.Token) (any, error) {
		if t.Method.Alg() != jwt.SigningMethodHS256.Name {
			return nil, errors.Errorf("unexpected access token signing method=%v, expect %v", t.Header["alg"], jwt.SigningMethodHS256)
		}
		if kid, ok := t.Header["kid"].(string); ok {
			if kid == "v1" {
				return []byte(s.Secret), nil
			}
		}
		return nil, errors.Errorf("unexpected access token kid=%v", t.Header["kid"])
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to parse access token: %v", err)
	}

	// Upsert the access token to user setting store.
	if err := s.UpsertAccessTokenToStore(ctx, user, accessToken, request.Description); err != nil {
		return nil, status.Errorf(codes.Internal, "failed to upsert access token to store: %v", err)
	}

	userAccessToken := &apiv1pb.UserAccessToken{
		AccessToken: accessToken,
		Description: request.Description,
		IssuedAt:    timestamppb.New(claims.IssuedAt.Time),
	}
	if claims.ExpiresAt != nil {
		userAccessToken.ExpiresAt = timestamppb.New(claims.ExpiresAt.Time)
	}
	response := &apiv1pb.CreateUserAccessTokenResponse{
		AccessToken: userAccessToken,
	}
	return response, nil
}

func (s *APIV1Service) DeleteUserAccessToken(ctx context.Context, request *apiv1pb.DeleteUserAccessTokenRequest) (*apiv1pb.DeleteUserAccessTokenResponse, error) {
	user, err := getCurrentUser(ctx, s.Store)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "failed to get current user: %v", err)
	}
	userAccessTokens, err := s.Store.GetUserAccessTokens(ctx, user.ID)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to list access tokens: %v", err)
	}
	updatedUserAccessTokens := []*storepb.AccessTokensUserSetting_AccessToken{}
	for _, userAccessToken := range userAccessTokens {
		if userAccessToken.AccessToken == request.AccessToken {
			continue
		}
		updatedUserAccessTokens = append(updatedUserAccessTokens, userAccessToken)
	}
	if _, err := s.Store.UpsertUserSetting(ctx, &storepb.UserSetting{
		UserId: user.ID,
		Key:    storepb.UserSettingKey_ACCESS_TOKENS,
		Value: &storepb.UserSetting_AccessTokens{
			AccessTokens: &storepb.AccessTokensUserSetting{
				AccessTokens: updatedUserAccessTokens,
			},
		},
	}); err != nil {
		return nil, status.Errorf(codes.Internal, "failed to upsert user setting: %v", err)
	}

	return &apiv1pb.DeleteUserAccessTokenResponse{}, nil
}

func (s *APIV1Service) UpsertAccessTokenToStore(ctx context.Context, user *store.User, accessToken, description string) error {
	userAccessTokens, err := s.Store.GetUserAccessTokens(ctx, user.ID)
	if err != nil {
		return errors.Wrap(err, "failed to get user access tokens")
	}
	userAccessToken := storepb.AccessTokensUserSetting_AccessToken{
		AccessToken: accessToken,
		Description: description,
	}
	userAccessTokens = append(userAccessTokens, &userAccessToken)
	if _, err := s.Store.UpsertUserSetting(ctx, &storepb.UserSetting{
		UserId: user.ID,
		Key:    storepb.UserSettingKey_ACCESS_TOKENS,
		Value: &storepb.UserSetting_AccessTokens{
			AccessTokens: &storepb.AccessTokensUserSetting{
				AccessTokens: userAccessTokens,
			},
		},
	}); err != nil {
		return errors.Wrap(err, "failed to upsert user setting")
	}
	return nil
}

func convertUserFromStore(user *store.User) *apiv1pb.User {
	return &apiv1pb.User{
		Id:          int32(user.ID),
		RowStatus:   convertRowStatusFromStore(user.RowStatus),
		CreatedTime: timestamppb.New(time.Unix(user.CreatedTs, 0)),
		UpdatedTime: timestamppb.New(time.Unix(user.UpdatedTs, 0)),
		Role:        convertUserRoleFromStore(user.Role),
		Email:       user.Email,
		Nickname:    user.Nickname,
	}
}

func convertUserRoleFromStore(role store.Role) apiv1pb.Role {
	switch role {
	case store.RoleAdmin:
		return apiv1pb.Role_ADMIN
	case store.RoleUser:
		return apiv1pb.Role_USER
	default:
		return apiv1pb.Role_ROLE_UNSPECIFIED
	}
}
