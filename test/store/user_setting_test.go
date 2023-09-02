package teststore

import (
	"context"
	"testing"

	storepb "github.com/boojack/slash/proto/gen/store"
	"github.com/boojack/slash/store"
	"github.com/stretchr/testify/require"
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
		Key:    storepb.UserSettingKey_USER_SETTING_ACCESS_TOKENS,
		Value: &storepb.UserSetting_AccessTokensUserSetting{
			AccessTokensUserSetting: &storepb.AccessTokensUserSetting{
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
	require.Equal(t, storepb.UserSettingKey_USER_SETTING_ACCESS_TOKENS, accessTokensUserSetting.Key)
	require.Equal(t, user.ID, accessTokensUserSetting.UserId)
	require.Equal(t, 1, len(accessTokensUserSetting.GetAccessTokensUserSetting().AccessTokens))
	userSettings, err = ts.ListUserSettings(ctx, &store.FindUserSetting{
		UserID: &user.ID,
	})
	require.NoError(t, err)
	require.Equal(t, 1, len(userSettings))
	require.Equal(t, accessTokensUserSetting, userSettings[0])
	accessTokensUserSetting, err = ts.GetUserSetting(ctx, &store.FindUserSetting{
		UserID: &user.ID,
		Key:    storepb.UserSettingKey_USER_SETTING_ACCESS_TOKENS,
	})
	require.NoError(t, err)
	require.NotNil(t, accessTokensUserSetting)
	require.Equal(t, 1, len(accessTokensUserSetting.GetAccessTokensUserSetting().AccessTokens))
	require.Equal(t, "test_access_token", accessTokensUserSetting.GetAccessTokensUserSetting().AccessTokens[0].AccessToken)
	accessTokensUserSetting, err = ts.UpsertUserSetting(ctx, &storepb.UserSetting{
		UserId: user.ID,
		Key:    storepb.UserSettingKey_USER_SETTING_ACCESS_TOKENS,
		Value: &storepb.UserSetting_AccessTokensUserSetting{
			AccessTokensUserSetting: &storepb.AccessTokensUserSetting{
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
	require.Equal(t, 2, len(accessTokensUserSetting.GetAccessTokensUserSetting().AccessTokens))

	// Test for locale user setting.
	localeUserSetting, err := ts.UpsertUserSetting(ctx, &storepb.UserSetting{
		UserId: user.ID,
		Key:    storepb.UserSettingKey_USER_SETTING_LOCALE,
		Value: &storepb.UserSetting_LocaleUserSetting{
			LocaleUserSetting: storepb.LocaleUserSetting_LOCALE_USER_SETTING_ZH,
		},
	})
	require.NoError(t, err)
	require.NotNil(t, localeUserSetting)
	require.Equal(t, storepb.UserSettingKey_USER_SETTING_LOCALE, localeUserSetting.Key)
	require.Equal(t, storepb.LocaleUserSetting_LOCALE_USER_SETTING_ZH, localeUserSetting.GetLocaleUserSetting())
	localeUserSetting, err = ts.UpsertUserSetting(ctx, &storepb.UserSetting{
		UserId: user.ID,
		Key:    storepb.UserSettingKey_USER_SETTING_LOCALE,
		Value: &storepb.UserSetting_LocaleUserSetting{
			LocaleUserSetting: storepb.LocaleUserSetting_LOCALE_USER_SETTING_EN,
		},
	})
	require.NoError(t, err)
	require.Equal(t, storepb.LocaleUserSetting_LOCALE_USER_SETTING_EN, localeUserSetting.GetLocaleUserSetting())
}
