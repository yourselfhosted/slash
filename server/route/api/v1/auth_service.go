package v1

import (
	"context"
	"fmt"
	"time"

	"golang.org/x/crypto/bcrypt"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"

	apiv1pb "github.com/yourselfhosted/slash/proto/gen/api/v1"
	storepb "github.com/yourselfhosted/slash/proto/gen/store"
	"github.com/yourselfhosted/slash/server/metric"
	"github.com/yourselfhosted/slash/server/service/license"
	"github.com/yourselfhosted/slash/store"
)

func (s *APIV1Service) GetAuthStatus(ctx context.Context, _ *apiv1pb.GetAuthStatusRequest) (*apiv1pb.GetAuthStatusResponse, error) {
	user, err := getCurrentUser(ctx, s.Store)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "failed to get current user: %v", err)
	}
	if user == nil {
		return nil, status.Errorf(codes.Unauthenticated, "user not found")
	}
	return &apiv1pb.GetAuthStatusResponse{
		User: convertUserFromStore(user),
	}, nil
}

func (s *APIV1Service) SignIn(ctx context.Context, request *apiv1pb.SignInRequest) (*apiv1pb.SignInResponse, error) {
	user, err := s.Store.GetUser(ctx, &store.FindUser{
		Email: &request.Email,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, fmt.Sprintf("failed to find user by email %s", request.Email))
	}
	if user == nil {
		return nil, status.Errorf(codes.InvalidArgument, fmt.Sprintf("user not found with email %s", request.Email))
	} else if user.RowStatus == store.Archived {
		return nil, status.Errorf(codes.PermissionDenied, fmt.Sprintf("user has been archived with email %s", request.Email))
	}

	// Compare the stored hashed password, with the hashed version of the password that was received.
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(request.Password)); err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "unmatched email and password")
	}

	accessToken, err := GenerateAccessToken(user.Email, user.ID, time.Now().Add(AccessTokenDuration), []byte(s.Secret))
	if err != nil {
		return nil, status.Errorf(codes.Internal, fmt.Sprintf("failed to generate tokens, err: %s", err))
	}
	if err := s.UpsertAccessTokenToStore(ctx, user, accessToken, "user login"); err != nil {
		return nil, status.Errorf(codes.Internal, fmt.Sprintf("failed to upsert access token to store, err: %s", err))
	}

	if err := grpc.SetHeader(ctx, metadata.New(map[string]string{
		"Set-Cookie": fmt.Sprintf("%s=%s; Path=/; Expires=%s; HttpOnly; SameSite=Strict", AccessTokenCookieName, accessToken, time.Now().Add(AccessTokenDuration).Format(time.RFC1123)),
	})); err != nil {
		return nil, status.Errorf(codes.Internal, "failed to set grpc header, error: %v", err)
	}

	metric.Enqueue("user sign in")
	return &apiv1pb.SignInResponse{
		User: convertUserFromStore(user),
	}, nil
}

func (s *APIV1Service) SignUp(ctx context.Context, request *apiv1pb.SignUpRequest) (*apiv1pb.SignUpResponse, error) {
	enableSignUpSetting, err := s.Store.GetWorkspaceSetting(ctx, &store.FindWorkspaceSetting{
		Key: storepb.WorkspaceSettingKey_WORKSAPCE_SETTING_ENABLE_SIGNUP,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, fmt.Sprintf("failed to get workspace setting, err: %s", err))
	}
	if enableSignUpSetting != nil && !enableSignUpSetting.GetEnableSignup() {
		return nil, status.Errorf(codes.PermissionDenied, "sign up is not allowed")
	}

	if !s.LicenseService.IsFeatureEnabled(license.FeatureTypeUnlimitedAccounts) {
		userList, err := s.Store.ListUsers(ctx, &store.FindUser{})
		if err != nil {
			return nil, status.Errorf(codes.Internal, fmt.Sprintf("failed to list users, err: %s", err))
		}
		if len(userList) >= 5 {
			return nil, status.Errorf(codes.InvalidArgument, "maximum number of users reached")
		}
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(request.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, status.Errorf(codes.Internal, fmt.Sprintf("failed to generate password hash, err: %s", err))
	}

	create := &store.User{
		Email:        request.Email,
		Nickname:     request.Nickname,
		PasswordHash: string(passwordHash),
	}
	existingUsers, err := s.Store.ListUsers(ctx, &store.FindUser{})
	if err != nil {
		return nil, status.Errorf(codes.Internal, fmt.Sprintf("failed to list users, err: %s", err))
	}
	// The first user to sign up is an admin by default.
	if len(existingUsers) == 0 {
		create.Role = store.RoleAdmin
	} else {
		create.Role = store.RoleUser
	}

	user, err := s.Store.CreateUser(ctx, create)
	if err != nil {
		return nil, status.Errorf(codes.Internal, fmt.Sprintf("failed to create user, err: %s", err))
	}

	accessToken, err := GenerateAccessToken(user.Email, user.ID, time.Now().Add(AccessTokenDuration), []byte(s.Secret))
	if err != nil {
		return nil, status.Errorf(codes.Internal, fmt.Sprintf("failed to generate tokens, err: %s", err))
	}
	if err := s.UpsertAccessTokenToStore(ctx, user, accessToken, "user login"); err != nil {
		return nil, status.Errorf(codes.Internal, fmt.Sprintf("failed to upsert access token to store, err: %s", err))
	}

	if err := grpc.SetHeader(ctx, metadata.New(map[string]string{
		"Set-Cookie": fmt.Sprintf("%s=%s; Path=/; Expires=%s; HttpOnly; SameSite=Strict", AccessTokenCookieName, accessToken, time.Now().Add(AccessTokenDuration).Format(time.RFC1123)),
	})); err != nil {
		return nil, status.Errorf(codes.Internal, "failed to set grpc header, error: %v", err)
	}

	metric.Enqueue("user sign up")
	return &apiv1pb.SignUpResponse{
		User: convertUserFromStore(user),
	}, nil
}

func (*APIV1Service) SignOut(ctx context.Context, _ *apiv1pb.SignOutRequest) (*apiv1pb.SignOutResponse, error) {
	// Set the cookie header to expire access token.
	if err := grpc.SetHeader(ctx, metadata.New(map[string]string{
		"Set-Cookie": fmt.Sprintf("%s=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict", AccessTokenCookieName),
	})); err != nil {
		return nil, status.Errorf(codes.Internal, "failed to set grpc header, error: %v", err)
	}

	return &apiv1pb.SignOutResponse{}, nil
}
