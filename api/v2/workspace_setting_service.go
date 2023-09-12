package v2

import (
	"context"

	apiv2pb "github.com/boojack/slash/proto/gen/api/v2"
	storepb "github.com/boojack/slash/proto/gen/store"
	"github.com/boojack/slash/store"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type WorkspaceSettingService struct {
	apiv2pb.UnimplementedWorkspaceSettingServiceServer

	Store *store.Store
}

// NewWorkspaceSettingService creates a new WorkspaceSettingService.
func NewWorkspaceSettingService(store *store.Store) *WorkspaceSettingService {
	return &WorkspaceSettingService{
		Store: store,
	}
}

func (s *WorkspaceSettingService) GetWorkspaceSetting(ctx context.Context, _ *apiv2pb.GetWorkspaceSettingRequest) (*apiv2pb.GetWorkspaceSettingResponse, error) {
	workspaceSettings, err := s.Store.ListWorkspaceSettingsV1(ctx, &store.FindWorkspaceSettingV1{})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to list workspace settings: %v", err)
	}
	workspaceSetting := &apiv2pb.WorkspaceSetting{}
	for _, v := range workspaceSettings {
		if v.Key == storepb.WorkspaceSettingKey_WORKSAPCE_SETTING_ENABLE_SIGNUP {
			workspaceSetting.EnableSignup = v.GetEnableSignup()
		} else if v.Key == storepb.WorkspaceSettingKey_WORKSPACE_SETTING_RESOURCE_RELATIVE_PATH {
			workspaceSetting.ResourceRelativePath = v.GetResourceRelativePath()
		} else {
			return nil, status.Errorf(codes.Internal, "invalid workspace setting key: %s", v.Key.String())
		}
	}
	return &apiv2pb.GetWorkspaceSettingResponse{
		Setting: workspaceSetting,
	}, nil
}

func (s *WorkspaceSettingService) UpdateWorkspaceSetting(ctx context.Context, request *apiv2pb.UpdateWorkspaceSettingRequest) (*apiv2pb.UpdateWorkspaceSettingResponse, error) {
	if request.UpdateMask == nil || len(request.UpdateMask) == 0 {
		return nil, status.Errorf(codes.InvalidArgument, "update mask is empty")
	}

	for _, path := range request.UpdateMask {
		if path == "enable_signup" {
			if _, err := s.Store.UpsertWorkspaceSettingV1(ctx, &storepb.WorkspaceSetting{
				Key: storepb.WorkspaceSettingKey_WORKSAPCE_SETTING_ENABLE_SIGNUP,
				Value: &storepb.WorkspaceSetting_EnableSignup{
					EnableSignup: request.Setting.EnableSignup,
				},
			}); err != nil {
				return nil, status.Errorf(codes.Internal, "failed to update workspace setting: %v", err)
			}
		} else if path == "resource_relative_path" {
			if _, err := s.Store.UpsertWorkspaceSettingV1(ctx, &storepb.WorkspaceSetting{
				Key: storepb.WorkspaceSettingKey_WORKSPACE_SETTING_RESOURCE_RELATIVE_PATH,
				Value: &storepb.WorkspaceSetting_ResourceRelativePath{
					ResourceRelativePath: request.Setting.ResourceRelativePath,
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
