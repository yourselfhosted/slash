package v1

import (
	"context"

	"github.com/pkg/errors"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	v1pb "github.com/bshort/monotreme/proto/gen/api/v1"
	storepb "github.com/bshort/monotreme/proto/gen/store"
	"github.com/bshort/monotreme/store"
)

func (s *APIV1Service) GetUserSetting(ctx context.Context, request *v1pb.GetUserSettingRequest) (*v1pb.UserSetting, error) {
	userSetting, err := getUserSetting(ctx, s.Store, request.Id)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get user setting: %v", err)
	}
	return userSetting, nil
}

func (s *APIV1Service) UpdateUserSetting(ctx context.Context, request *v1pb.UpdateUserSettingRequest) (*v1pb.UserSetting, error) {
	if request.UpdateMask == nil || len(request.UpdateMask.Paths) == 0 {
		return nil, status.Errorf(codes.InvalidArgument, "update mask is empty")
	}

	user, err := getCurrentUser(ctx, s.Store)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get current user: %v", err)
	}
	for _, path := range request.UpdateMask.Paths {
		if path == "general" {
			if _, err := s.Store.UpsertUserSetting(ctx, &storepb.UserSetting{
				UserId: user.ID,
				Key:    storepb.UserSettingKey_USER_SETTING_GENERAL,
				Value: &storepb.UserSetting_General{
					General: &storepb.UserSetting_GeneralSetting{
						Locale:     request.UserSetting.General.Locale,
						ColorTheme: request.UserSetting.General.ColorTheme,
					},
				},
			}); err != nil {
				return nil, status.Errorf(codes.Internal, "failed to update user setting: %v", err)
			}
		} else {
			return nil, status.Errorf(codes.InvalidArgument, "invalid path: %s", path)
		}
	}

	userSetting, err := getUserSetting(ctx, s.Store, request.Id)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get user setting: %v", err)
	}
	return userSetting, nil
}

func getUserSetting(ctx context.Context, s *store.Store, userID int32) (*v1pb.UserSetting, error) {
	userSettings, err := s.ListUserSettings(ctx, &store.FindUserSetting{
		UserID: &userID,
	})
	if err != nil {
		return nil, errors.Wrap(err, "failed to find user setting")
	}

	userSetting := &v1pb.UserSetting{
		UserId: userID,
		General: &v1pb.UserSetting_GeneralSetting{
			Locale:     "EN",
			ColorTheme: "SYSTEM",
		},
	}
	for _, setting := range userSettings {
		if setting.Key == storepb.UserSettingKey_USER_SETTING_GENERAL {
			userSetting.General = &v1pb.UserSetting_GeneralSetting{
				Locale:     setting.GetGeneral().Locale,
				ColorTheme: setting.GetGeneral().ColorTheme,
			}
		}
	}
	return userSetting, nil
}
