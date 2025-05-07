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
		Key:    storepb.UserSettingKey_USER_SETTING_ACCESS_TOKENS,
		Value: &storepb.UserSetting_AccessTokens{
			AccessTokens: &storepb.UserSetting_AccessTokensSetting{
				AccessTokens: []*storepb.UserSetting_AccessTokensSetting_AccessToken{
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
	require.Equal(t, 1, len(accessTokensUserSetting.GetAccessTokens().AccessTokens))
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
	require.Equal(t, 1, len(accessTokensUserSetting.GetAccessTokens().AccessTokens))
	require.Equal(t, "test_access_token", accessTokensUserSetting.GetAccessTokens().AccessTokens[0].AccessToken)
	accessTokensUserSetting, err = ts.UpsertUserSetting(ctx, &storepb.UserSetting{
		UserId: user.ID,
		Key:    storepb.UserSettingKey_USER_SETTING_ACCESS_TOKENS,
		Value: &storepb.UserSetting_AccessTokens{
			AccessTokens: &storepb.UserSetting_AccessTokensSetting{
				AccessTokens: []*storepb.UserSetting_AccessTokensSetting_AccessToken{
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

	// Test for user setting general.
	userSettingGeneral, err := ts.UpsertUserSetting(ctx, &storepb.UserSetting{
		UserId: user.ID,
		Key:    storepb.UserSettingKey_USER_SETTING_GENERAL,
		Value: &storepb.UserSetting_General{
			General: &storepb.UserSetting_GeneralSetting{
				Locale:     "ZH",
				ColorTheme: "SYSTEM",
			},
		},
	})
	require.NoError(t, err)
	require.NotNil(t, userSettingGeneral)
	require.Equal(t, storepb.UserSettingKey_USER_SETTING_GENERAL, userSettingGeneral.Key)
	require.Equal(t, "ZH", userSettingGeneral.GetGeneral().Locale)
	require.Equal(t, "SYSTEM", userSettingGeneral.GetGeneral().ColorTheme)
	userSettingGeneral, err = ts.UpsertUserSetting(ctx, &storepb.UserSetting{
		UserId: user.ID,
		Key:    storepb.UserSettingKey_USER_SETTING_GENERAL,
		Value: &storepb.UserSetting_General{
			General: &storepb.UserSetting_GeneralSetting{
				Locale:     "EN",
				ColorTheme: "DARK",
			},
		},
	})
	require.NoError(t, err)
	require.Equal(t, "EN", userSettingGeneral.GetGeneral().Locale)
	require.Equal(t, "DARK", userSettingGeneral.GetGeneral().ColorTheme)
}
