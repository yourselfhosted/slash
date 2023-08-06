package v2

import (
	"context"

	apiv2pb "github.com/boojack/slash/proto/gen/api/v2"
	"github.com/boojack/slash/store"
	"github.com/golang-jwt/jwt/v4"
	"github.com/pkg/errors"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"
)

type UserService struct {
	apiv2pb.UnimplementedUserServiceServer

	Secret string
	Store  *store.Store
}

// NewUserService creates a new UserService.
func NewUserService(secret string, store *store.Store) *UserService {
	return &UserService{
		Secret: secret,
		Store:  store,
	}
}

func (s *UserService) GetUser(ctx context.Context, request *apiv2pb.GetUserRequest) (*apiv2pb.GetUserResponse, error) {
	user, err := s.Store.GetUser(ctx, &store.FindUser{
		ID: &request.Id,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to list tags: %v", err)
	}
	if user == nil {
		return nil, status.Errorf(codes.NotFound, "user not found")
	}

	userMessage := convertUserFromStore(user)
	response := &apiv2pb.GetUserResponse{
		User: userMessage,
	}
	return response, nil
}

func (s *UserService) GetUserAccessTokens(ctx context.Context, request *apiv2pb.GetUserAccessTokensRequest) (*apiv2pb.GetUserAccessTokensResponse, error) {
	userID := ctx.Value(UserIDContextKey).(int32)
	if userID != request.Id {
		return nil, status.Errorf(codes.PermissionDenied, "Permission denied")
	}

	userAccessTokens, err := s.Store.GetUserAccessTokens(ctx, userID)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to list access tokens: %v", err)
	}

	accessTokens := []*apiv2pb.GetUserAccessTokensResponse_AccessToken{}
	for _, userAccessToken := range userAccessTokens {
		claims := &claimsMessage{}
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

		accessTokens = append(accessTokens, &apiv2pb.GetUserAccessTokensResponse_AccessToken{
			AccessToken: userAccessToken.AccessToken,
			Description: userAccessToken.Description,
			ExpiresTime: timestamppb.New(claims.ExpiresAt.Time),
			CreatedTime: timestamppb.New(claims.IssuedAt.Time),
		})
	}

	response := &apiv2pb.GetUserAccessTokensResponse{
		AccessTokens: accessTokens,
	}
	return response, nil
}

func convertUserFromStore(user *store.User) *apiv2pb.User {
	return &apiv2pb.User{
		Id:        int32(user.ID),
		RowStatus: convertRowStatusFromStore(user.RowStatus),
		CreatedTs: user.CreatedTs,
		UpdatedTs: user.UpdatedTs,
		Role:      convertUserRoleFromStore(user.Role),
		Email:     user.Email,
		Nickname:  user.Nickname,
	}
}

func convertUserRoleFromStore(role store.Role) apiv2pb.Role {
	switch role {
	case store.RoleAdmin:
		return apiv2pb.Role_ADMIN
	case store.RoleUser:
		return apiv2pb.Role_USER
	default:
		return apiv2pb.Role_ROLE_UNSPECIFIED
	}
}
