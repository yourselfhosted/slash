package v1

import (
	"context"
	"fmt"

	"github.com/pkg/errors"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	v1pb "github.com/yourselfhosted/slash/proto/gen/api/v1"
	storepb "github.com/yourselfhosted/slash/proto/gen/store"
	"github.com/yourselfhosted/slash/store"
)

func (s *APIV1Service) GetWorkspaceProfile(ctx context.Context, _ *v1pb.GetWorkspaceProfileRequest) (*v1pb.GetWorkspaceProfileResponse, error) {
	workspaceProfile := &v1pb.WorkspaceProfile{
		Mode:         s.Profile.Mode,
		Version:      s.Profile.Version,
		Plan:         v1pb.PlanType_FREE,
		EnableSignup: s.Profile.Public,
	}

	// Load subscription plan from license service.
	subscription, err := s.LicenseService.GetSubscription(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get subscription: %v", err)
	}
	workspaceProfile.Plan = subscription.Plan

	owner, err := s.GetInstanceOwner(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get instance owner: %v", err)
	}
	if owner != nil {
		workspaceProfile.Owner = fmt.Sprintf("%s%d", UserNamePrefix, owner.Id)
	}

	workspaceSettingGeneral, err := s.Store.GetWorkspaceSetting(ctx, &store.FindWorkspaceSetting{
		Key: storepb.WorkspaceSettingKey_WORKSPACE_SETTING_GENERAL,
	})
	if err != nil {
		return nil, errors.Wrap(err, "failed to get workspace setting")
	}
	generalSetting := workspaceSettingGeneral.GetGeneral()
	if generalSetting != nil {
		workspaceProfile.Branding = generalSetting.GetBranding()
	}

	return &v1pb.GetWorkspaceProfileResponse{
		Profile: workspaceProfile,
	}, nil
}

func (s *APIV1Service) GetWorkspaceSetting(ctx context.Context, _ *v1pb.GetWorkspaceSettingRequest) (*v1pb.GetWorkspaceSettingResponse, error) {
	workspaceSettings, err := s.Store.ListWorkspaceSettings(ctx, &store.FindWorkspaceSetting{})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to list workspace settings: %v", err)
	}
	workspaceSetting := &v1pb.WorkspaceSetting{}
	for _, v := range workspaceSettings {
		if v.Key == storepb.WorkspaceSettingKey_WORKSPACE_SETTING_GENERAL {
			generalSetting := v.GetGeneral()
			workspaceSetting.Branding = generalSetting.GetBranding()
			workspaceSetting.CustomStyle = generalSetting.GetCustomStyle()
		} else if v.Key == storepb.WorkspaceSettingKey_WORKSPACE_SETTING_SHORTCUT_RELATED {
			shortcutRelatedSetting := v.GetShortcutRelated()
			workspaceSetting.DefaultVisibility = v1pb.Visibility(shortcutRelatedSetting.GetDefaultVisibility())
		}
	}
	return &v1pb.GetWorkspaceSettingResponse{
		Setting: workspaceSetting,
	}, nil
}

func (s *APIV1Service) UpdateWorkspaceSetting(ctx context.Context, request *v1pb.UpdateWorkspaceSettingRequest) (*v1pb.UpdateWorkspaceSettingResponse, error) {
	if request.UpdateMask == nil || len(request.UpdateMask.Paths) == 0 {
		return nil, status.Errorf(codes.InvalidArgument, "update mask is empty")
	}

	for _, path := range request.UpdateMask.Paths {
		if path == "branding" {
			generalSetting, err := s.Store.GetWorkspaceSetting(ctx, &store.FindWorkspaceSetting{
				Key: storepb.WorkspaceSettingKey_WORKSPACE_SETTING_GENERAL,
			})
			if err != nil {
				return nil, status.Errorf(codes.Internal, "failed to get workspace setting: %v", err)
			}
			if generalSetting == nil {
				generalSetting = &storepb.WorkspaceSetting{
					Key: storepb.WorkspaceSettingKey_WORKSPACE_SETTING_GENERAL,
					Value: &storepb.WorkspaceSetting_General{
						General: &storepb.WorkspaceSetting_GeneralSetting{},
					},
				}
			}
			generalSetting.GetGeneral().Branding = request.Setting.Branding
			if _, err := s.Store.UpsertWorkspaceSetting(ctx, &storepb.WorkspaceSetting{
				Key: storepb.WorkspaceSettingKey_WORKSPACE_SETTING_GENERAL,
				Value: &storepb.WorkspaceSetting_General{
					General: generalSetting.GetGeneral(),
				},
			}); err != nil {
				return nil, status.Errorf(codes.Internal, "failed to update workspace setting: %v", err)
			}
		} else if path == "custom_style" {
			generalSetting, err := s.Store.GetWorkspaceSetting(ctx, &store.FindWorkspaceSetting{
				Key: storepb.WorkspaceSettingKey_WORKSPACE_SETTING_GENERAL,
			})
			if err != nil {
				return nil, status.Errorf(codes.Internal, "failed to get workspace setting: %v", err)
			}
			if generalSetting == nil {
				generalSetting = &storepb.WorkspaceSetting{
					Key: storepb.WorkspaceSettingKey_WORKSPACE_SETTING_GENERAL,
					Value: &storepb.WorkspaceSetting_General{
						General: &storepb.WorkspaceSetting_GeneralSetting{},
					},
				}
			}
			generalSetting.GetGeneral().CustomStyle = request.Setting.CustomStyle
			if _, err := s.Store.UpsertWorkspaceSetting(ctx, &storepb.WorkspaceSetting{
				Key: storepb.WorkspaceSettingKey_WORKSPACE_SETTING_GENERAL,
				Value: &storepb.WorkspaceSetting_General{
					General: generalSetting.GetGeneral(),
				},
			}); err != nil {
				return nil, status.Errorf(codes.Internal, "failed to update workspace setting: %v", err)
			}
		} else if path == "default_visibility" {
			shortcutRelatedSetting, err := s.Store.GetWorkspaceSetting(ctx, &store.FindWorkspaceSetting{
				Key: storepb.WorkspaceSettingKey_WORKSPACE_SETTING_SHORTCUT_RELATED,
			})
			if err != nil {
				return nil, status.Errorf(codes.Internal, "failed to get workspace setting: %v", err)
			}
			if shortcutRelatedSetting == nil {
				shortcutRelatedSetting = &storepb.WorkspaceSetting{
					Key: storepb.WorkspaceSettingKey_WORKSPACE_SETTING_SHORTCUT_RELATED,
					Value: &storepb.WorkspaceSetting_ShortcutRelated{
						ShortcutRelated: &storepb.WorkspaceSetting_ShortcutRelatedSetting{},
					},
				}
			}
			shortcutRelatedSetting.GetShortcutRelated().DefaultVisibility = storepb.Visibility(request.Setting.DefaultVisibility)
			if _, err := s.Store.UpsertWorkspaceSetting(ctx, &storepb.WorkspaceSetting{
				Key: storepb.WorkspaceSettingKey_WORKSPACE_SETTING_SHORTCUT_RELATED,
				Value: &storepb.WorkspaceSetting_ShortcutRelated{
					ShortcutRelated: shortcutRelatedSetting.GetShortcutRelated(),
				},
			}); err != nil {
				return nil, status.Errorf(codes.Internal, "failed to update workspace setting: %v", err)
			}
		} else {
			return nil, status.Errorf(codes.InvalidArgument, "invalid path: %s", path)
		}
	}

	getWorkspaceSettingResponse, err := s.GetWorkspaceSetting(ctx, &v1pb.GetWorkspaceSettingRequest{})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get workspace setting: %v", err)
	}
	return &v1pb.UpdateWorkspaceSettingResponse{
		Setting: getWorkspaceSettingResponse.Setting,
	}, nil
}

var ownerCache *v1pb.User

func (s *APIV1Service) GetInstanceOwner(ctx context.Context) (*v1pb.User, error) {
	if ownerCache != nil {
		return ownerCache, nil
	}

	adminRole := store.RoleAdmin
	user, err := s.Store.GetUser(ctx, &store.FindUser{
		Role: &adminRole,
	})
	if err != nil {
		return nil, errors.Wrapf(err, "failed to find admin")
	}
	if user == nil {
		return nil, nil
	}

	ownerCache = convertUserFromStore(user)
	return ownerCache, nil
}
