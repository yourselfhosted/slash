package teststore

import (
	"context"
	"testing"

	"github.com/stretchr/testify/require"

	storepb "github.com/yourselfhosted/slash/proto/gen/store"
	"github.com/yourselfhosted/slash/store"
)

func TestUserSettingStore(t *testing.T) {
	ctx := context.Background()
	ts := NewTestingStore(ctx, t)
	user, err := createTestingAdminUser(ctx, ts)
	require.NoError(t, err)
	userSettings, err := ts.ListUserSettings(ctx, &store.FindUserSetting{
		UserID: &user.ID,
	})
	require.NoError(t, err)
	require.Equal(t, 0, len(userSettings))

	// Test for access tokens user setting.
	accessTokensUserSetting, err := ts.UpsertUserSetting(ctx, &storepb.UserSetting{
		UserId: user.ID,
		Key:    storepb.UserSettingKey_ACCESS_TOKENS,
		Value: &storepb.UserSetting_AccessTokens{
			AccessTokens: &storepb.AccessTokensUserSetting{
				AccessTokens: []*storepb.AccessTokensUserSetting_AccessToken{
					{
						AccessToken: "test_access_token",
					},
				},
			},
		},
	})
	require.NoError(t, err)
	require.NotNil(t, accessTokensUserSetting)
	require.Equal(t, storepb.UserSettingKey_ACCESS_TOKENS, accessTokensUserSetting.Key)
	require.Equal(t, user.ID, accessTokensUserSetting.UserId)
	require.Equal(t, 1, len(accessTokensUserSetting.GetAccessTokens().AccessTokens))
	userSettings, err = ts.ListUserSettings(ctx, &store.FindUserSetting{
		UserID: &user.ID,
	})
	require.NoError(t, err)
	require.Equal(t, 1, len(userSettings))
	require.Equal(t, accessTokensUserSetting, userSettings[0])
	accessTokensUserSetting, err = ts.GetUserSetting(ctx, &store.FindUserSetting{
		UserID: &user.ID,
		Key:    storepb.UserSettingKey_ACCESS_TOKENS,
	})
	require.NoError(t, err)
	require.NotNil(t, accessTokensUserSetting)
	require.Equal(t, 1, len(accessTokensUserSetting.GetAccessTokens().AccessTokens))
	require.Equal(t, "test_access_token", accessTokensUserSetting.GetAccessTokens().AccessTokens[0].AccessToken)
	accessTokensUserSetting, err = ts.UpsertUserSetting(ctx, &storepb.UserSetting{
		UserId: user.ID,
		Key:    storepb.UserSettingKey_ACCESS_TOKENS,
		Value: &storepb.UserSetting_AccessTokens{
			AccessTokens: &storepb.AccessTokensUserSetting{
				AccessTokens: []*storepb.AccessTokensUserSetting_AccessToken{
					{
						AccessToken: "test_access_token",
					},
					{
						AccessToken: "test_access_token2",
					},
				},
			},
		},
	})
	require.NoError(t, err)
	require.NotNil(t, accessTokensUserSetting)
	require.Equal(t, 2, len(accessTokensUserSetting.GetAccessTokens().AccessTokens))

	// Test for locale user setting.
	localeUserSetting, err := ts.UpsertUserSetting(ctx, &storepb.UserSetting{
		UserId: user.ID,
		Key:    storepb.UserSettingKey_LOCALE,
		Value: &storepb.UserSetting_Locale{
			Locale: "ZH",
		},
	})
	require.NoError(t, err)
	require.NotNil(t, localeUserSetting)
	require.Equal(t, storepb.UserSettingKey_LOCALE, localeUserSetting.Key)
	require.Equal(t, "ZH", localeUserSetting.GetLocale())
	localeUserSetting, err = ts.UpsertUserSetting(ctx, &storepb.UserSetting{
		UserId: user.ID,
		Key:    storepb.UserSettingKey_LOCALE,
		Value: &storepb.UserSetting_Locale{
			Locale: "EN",
		},
	})
	require.NoError(t, err)
	require.Equal(t, "EN", localeUserSetting.GetLocale())

	// Test for color theme user setting.
	colorThemeUserSetting, err := ts.UpsertUserSetting(ctx, &storepb.UserSetting{
		UserId: user.ID,
		Key:    storepb.UserSettingKey_COLOR_THEME,
		Value: &storepb.UserSetting_ColorTheme{
			ColorTheme: "LIGHT",
		},
	})
	require.NoError(t, err)
	require.NotNil(t, colorThemeUserSetting)
	require.Equal(t, storepb.UserSettingKey_COLOR_THEME, colorThemeUserSetting.Key)
	require.Equal(t, "LIGHT", colorThemeUserSetting.GetColorTheme())
	colorThemeUserSetting, err = ts.UpsertUserSetting(ctx, &storepb.UserSetting{
		UserId: user.ID,
		Key:    storepb.UserSettingKey_COLOR_THEME,
		Value: &storepb.UserSetting_ColorTheme{
			ColorTheme: "DARK",
		},
	})
	require.NoError(t, err)
	require.Equal(t, "DARK", colorThemeUserSetting.GetColorTheme())
}
