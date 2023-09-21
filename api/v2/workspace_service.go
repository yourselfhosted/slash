package v2

import (
	"context"

	apiv2pb "github.com/boojack/slash/proto/gen/api/v2"
	storepb "github.com/boojack/slash/proto/gen/store"
	"github.com/boojack/slash/store"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type WorkspaceService struct {
	apiv2pb.UnimplementedWorkspaceServiceServer

	Store *store.Store
}

// NewWorkspaceService creates a new WorkspaceService.
func NewWorkspaceService(store *store.Store) *WorkspaceService {
	return &WorkspaceService{
		Store: store,
	}
}

func (s *WorkspaceService) GetWorkspaceSetting(ctx context.Context, _ *apiv2pb.GetWorkspaceSettingRequest) (*apiv2pb.GetWorkspaceSettingResponse, error) {
	isAdmin := false
	userID, ok := ctx.Value(userIDContextKey).(int32)
	if ok {
		user, err := s.Store.GetUser(ctx, &store.FindUser{ID: &userID})
		if err != nil {
			return nil, status.Errorf(codes.Internal, "failed to get user: %v", err)
		}
		if user.Role == store.RoleAdmin {
			isAdmin = true
		}
	}
	workspaceSettings, err := s.Store.ListWorkspaceSettings(ctx, &store.FindWorkspaceSetting{})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to list workspace settings: %v", err)
	}
	workspaceSetting := &apiv2pb.WorkspaceSetting{}
	for _, v := range workspaceSettings {
		if v.Key == storepb.WorkspaceSettingKey_WORKSAPCE_SETTING_ENABLE_SIGNUP {
			workspaceSetting.EnableSignup = v.GetEnableSignup()
		} else if v.Key == storepb.WorkspaceSettingKey_WORKSPACE_SETTING_CUSTOM_STYLE {
			workspaceSetting.CustomStyle = v.GetCustomStyle()
		} else if v.Key == storepb.WorkspaceSettingKey_WORKSPACE_SETTING_CUSTOM_SCRIPT {
			workspaceSetting.CustomScript = v.GetCustomScript()
		} else if isAdmin {
			// For some settings, only admin can get the value.
			if v.Key == storepb.WorkspaceSettingKey_WORKSPACE_LICENSE_KEY {
				workspaceSetting.LicenseKey = v.GetLicenseKey()
			} else if v.Key == storepb.WorkspaceSettingKey_WORKSPACE_SETTING_RESOURCE_RELATIVE_PATH {
				workspaceSetting.ResourceRelativePath = v.GetResourceRelativePath()
			}
		}
	}
	return &apiv2pb.GetWorkspaceSettingResponse{
		Setting: workspaceSetting,
	}, nil
}

func (s *WorkspaceService) UpdateWorkspaceSetting(ctx context.Context, request *apiv2pb.UpdateWorkspaceSettingRequest) (*apiv2pb.UpdateWorkspaceSettingResponse, error) {
	if request.UpdateMask == nil || len(request.UpdateMask) == 0 {
		return nil, status.Errorf(codes.InvalidArgument, "update mask is empty")
	}

	for _, path := range request.UpdateMask {
		if path == "license_key" {
			if _, err := s.Store.UpsertWorkspaceSetting(ctx, &storepb.WorkspaceSetting{
				Key: storepb.WorkspaceSettingKey_WORKSPACE_LICENSE_KEY,
				Value: &storepb.WorkspaceSetting_LicenseKey{
					LicenseKey: request.Setting.LicenseKey,
				},
			}); err != nil {
				return nil, status.Errorf(codes.Internal, "failed to update workspace setting: %v", err)
			}
		} else if path == "enable_signup" {
			if _, err := s.Store.UpsertWorkspaceSetting(ctx, &storepb.WorkspaceSetting{
				Key: storepb.WorkspaceSettingKey_WORKSAPCE_SETTING_ENABLE_SIGNUP,
				Value: &storepb.WorkspaceSetting_EnableSignup{
					EnableSignup: request.Setting.EnableSignup,
				},
			}); err != nil {
				return nil, status.Errorf(codes.Internal, "failed to update workspace setting: %v", err)
			}
		} else if path == "resource_relative_path" {
			if _, err := s.Store.UpsertWorkspaceSetting(ctx, &storepb.WorkspaceSetting{
				Key: storepb.WorkspaceSettingKey_WORKSPACE_SETTING_RESOURCE_RELATIVE_PATH,
				Value: &storepb.WorkspaceSetting_ResourceRelativePath{
					ResourceRelativePath: request.Setting.ResourceRelativePath,
				},
			}); err != nil {
				return nil, status.Errorf(codes.Internal, "failed to update workspace setting: %v", err)
			}
		} else if path == "custom_style" {
			if _, err := s.Store.UpsertWorkspaceSetting(ctx, &storepb.WorkspaceSetting{
				Key: storepb.WorkspaceSettingKey_WORKSPACE_SETTING_CUSTOM_STYLE,
				Value: &storepb.WorkspaceSetting_CustomStyle{
					CustomStyle: request.Setting.CustomStyle,
				},
			}); err != nil {
				return nil, status.Errorf(codes.Internal, "failed to update workspace setting: %v", err)
			}
		} else if path == "custom_script" {
			if _, err := s.Store.UpsertWorkspaceSetting(ctx, &storepb.WorkspaceSetting{
				Key: storepb.WorkspaceSettingKey_WORKSPACE_SETTING_CUSTOM_SCRIPT,
				Value: &storepb.WorkspaceSetting_CustomScript{
					CustomScript: request.Setting.CustomScript,
				},
			}); err != nil {
				return nil, status.Errorf(codes.Internal, "failed to update workspace setting: %v", err)
			}
		} else {
			return nil, status.Errorf(codes.InvalidArgument, "invalid path: %s", path)
		}
	}

	getWorkspaceSettingResponse, err := s.GetWorkspaceSetting(ctx, &apiv2pb.GetWorkspaceSettingRequest{})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get workspace setting: %v", err)
	}
	return &apiv2pb.UpdateWorkspaceSettingResponse{
		Setting: getWorkspaceSettingResponse.Setting,
	}, nil
}
