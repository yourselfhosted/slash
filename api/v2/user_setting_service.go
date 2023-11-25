package v2

import (
	"context"

	"github.com/pkg/errors"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	apiv2pb "github.com/yourselfhosted/slash/proto/gen/api/v2"
	storepb "github.com/yourselfhosted/slash/proto/gen/store"
	"github.com/yourselfhosted/slash/store"
)

func (s *APIV2Service) GetUserSetting(ctx context.Context, request *apiv2pb.GetUserSettingRequest) (*apiv2pb.GetUserSettingResponse, error) {
	userSetting, err := getUserSetting(ctx, s.Store, request.Id)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get user setting: %v", err)
	}
	return &apiv2pb.GetUserSettingResponse{
		UserSetting: userSetting,
	}, nil
}

func (s *APIV2Service) UpdateUserSetting(ctx context.Context, request *apiv2pb.UpdateUserSettingRequest) (*apiv2pb.UpdateUserSettingResponse, error) {
	if request.UpdateMask == nil || len(request.UpdateMask.Paths) == 0 {
		return nil, status.Errorf(codes.InvalidArgument, "update mask is empty")
	}

	userID := ctx.Value(userIDContextKey).(int32)
	for _, path := range request.UpdateMask.Paths {
		if path == "locale" {
			if _, err := s.Store.UpsertUserSetting(ctx, &storepb.UserSetting{
				UserId: userID,
				Key:    storepb.UserSettingKey_USER_SETTING_LOCALE,
				Value: &storepb.UserSetting_Locale{
					Locale: convertUserSettingLocaleToStore(request.UserSetting.Locale),
				},
			}); err != nil {
				return nil, status.Errorf(codes.Internal, "failed to update user setting: %v", err)
			}
		} else if path == "color_theme" {
			if _, err := s.Store.UpsertUserSetting(ctx, &storepb.UserSetting{
				UserId: userID,
				Key:    storepb.UserSettingKey_USER_SETTING_COLOR_THEME,
				Value: &storepb.UserSetting_ColorTheme{
					ColorTheme: convertUserSettingColorThemeToStore(request.UserSetting.ColorTheme),
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
	return &apiv2pb.UpdateUserSettingResponse{
		UserSetting: userSetting,
	}, nil
}

func getUserSetting(ctx context.Context, s *store.Store, userID int32) (*apiv2pb.UserSetting, error) {
	userSettings, err := s.ListUserSettings(ctx, &store.FindUserSetting{
		UserID: &userID,
	})
	if err != nil {
		return nil, errors.Wrap(err, "failed to find user setting")
	}

	userSetting := &apiv2pb.UserSetting{
		Id:         userID,
		Locale:     apiv2pb.UserSetting_LOCALE_EN,
		ColorTheme: apiv2pb.UserSetting_COLOR_THEME_SYSTEM,
	}
	for _, setting := range userSettings {
		if setting.Key == storepb.UserSettingKey_USER_SETTING_LOCALE {
			userSetting.Locale = convertUserSettingLocaleFromStore(setting.GetLocale())
		} else if setting.Key == storepb.UserSettingKey_USER_SETTING_COLOR_THEME {
			userSetting.ColorTheme = convertUserSettingColorThemeFromStore(setting.GetColorTheme())
		}
	}
	return userSetting, nil
}

func convertUserSettingLocaleToStore(locale apiv2pb.UserSetting_Locale) storepb.LocaleUserSetting {
	switch locale {
	case apiv2pb.UserSetting_LOCALE_EN:
		return storepb.LocaleUserSetting_LOCALE_USER_SETTING_EN
	case apiv2pb.UserSetting_LOCALE_ZH:
		return storepb.LocaleUserSetting_LOCALE_USER_SETTING_ZH
	default:
		return storepb.LocaleUserSetting_LOCALE_USER_SETTING_UNSPECIFIED
	}
}

func convertUserSettingLocaleFromStore(locale storepb.LocaleUserSetting) apiv2pb.UserSetting_Locale {
	switch locale {
	case storepb.LocaleUserSetting_LOCALE_USER_SETTING_EN:
		return apiv2pb.UserSetting_LOCALE_EN
	case storepb.LocaleUserSetting_LOCALE_USER_SETTING_ZH:
		return apiv2pb.UserSetting_LOCALE_ZH
	default:
		return apiv2pb.UserSetting_LOCALE_UNSPECIFIED
	}
}

func convertUserSettingColorThemeToStore(colorTheme apiv2pb.UserSetting_ColorTheme) storepb.ColorThemeUserSetting {
	switch colorTheme {
	case apiv2pb.UserSetting_COLOR_THEME_SYSTEM:
		return storepb.ColorThemeUserSetting_COLOR_THEME_USER_SETTING_SYSTEM
	case apiv2pb.UserSetting_COLOR_THEME_LIGHT:
		return storepb.ColorThemeUserSetting_COLOR_THEME_USER_SETTING_LIGHT
	case apiv2pb.UserSetting_COLOR_THEME_DARK:
		return storepb.ColorThemeUserSetting_COLOR_THEME_USER_SETTING_DARK
	default:
		return storepb.ColorThemeUserSetting_COLOR_THEME_USER_SETTING_UNSPECIFIED
	}
}

func convertUserSettingColorThemeFromStore(colorTheme storepb.ColorThemeUserSetting) apiv2pb.UserSetting_ColorTheme {
	switch colorTheme {
	case storepb.ColorThemeUserSetting_COLOR_THEME_USER_SETTING_SYSTEM:
		return apiv2pb.UserSetting_COLOR_THEME_SYSTEM
	case storepb.ColorThemeUserSetting_COLOR_THEME_USER_SETTING_LIGHT:
		return apiv2pb.UserSetting_COLOR_THEME_LIGHT
	case storepb.ColorThemeUserSetting_COLOR_THEME_USER_SETTING_DARK:
		return apiv2pb.UserSetting_COLOR_THEME_DARK
	default:
		return apiv2pb.UserSetting_COLOR_THEME_UNSPECIFIED
	}
}
