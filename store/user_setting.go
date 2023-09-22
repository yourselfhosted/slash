package store

import (
	"context"
	"database/sql"
	"errors"
	"strings"

	"google.golang.org/protobuf/encoding/protojson"

	storepb "github.com/boojack/slash/proto/gen/store"
)

type FindUserSetting struct {
	UserID *int32
	Key    storepb.UserSettingKey
}

func (s *Store) UpsertUserSetting(ctx context.Context, upsert *storepb.UserSetting) (*storepb.UserSetting, error) {
	stmt := `
		INSERT INTO user_setting (
			user_id, key, value
		)
		VALUES (?, ?, ?)
		ON CONFLICT(user_id, key) DO UPDATE 
		SET value = EXCLUDED.value
	`
	var valueString string
	if upsert.Key == storepb.UserSettingKey_USER_SETTING_ACCESS_TOKENS {
		valueBytes, err := protojson.Marshal(upsert.GetAccessTokens())
		if err != nil {
			return nil, err
		}
		valueString = string(valueBytes)
	} else if upsert.Key == storepb.UserSettingKey_USER_SETTING_LOCALE {
		valueString = upsert.GetLocale().String()
	} else if upsert.Key == storepb.UserSettingKey_USER_SETTING_COLOR_THEME {
		valueString = upsert.GetColorTheme().String()
	} else {
		return nil, errors.New("invalid user setting key")
	}

	if _, err := s.db.ExecContext(ctx, stmt, upsert.UserId, upsert.Key.String(), valueString); err != nil {
		return nil, err
	}

	userSettingMessage := upsert
	s.userSettingCache.Store(getUserSettingCacheKey(userSettingMessage.UserId, userSettingMessage.Key.String()), userSettingMessage)
	return userSettingMessage, nil
}

func (s *Store) ListUserSettings(ctx context.Context, find *FindUserSetting) ([]*storepb.UserSetting, error) {
	where, args := []string{"1 = 1"}, []any{}

	if v := find.Key; v != storepb.UserSettingKey_USER_SETTING_KEY_UNSPECIFIED {
		where, args = append(where, "key = ?"), append(args, v.String())
	}
	if v := find.UserID; v != nil {
		where, args = append(where, "user_id = ?"), append(args, *find.UserID)
	}

	query := `
		SELECT
			user_id,
		  key,
			value
		FROM user_setting
		WHERE ` + strings.Join(where, " AND ")
	rows, err := s.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	userSettingList := make([]*storepb.UserSetting, 0)
	for rows.Next() {
		userSetting := &storepb.UserSetting{}
		var keyString, valueString string
		if err := rows.Scan(
			&userSetting.UserId,
			&keyString,
			&valueString,
		); err != nil {
			return nil, err
		}
		userSetting.Key = storepb.UserSettingKey(storepb.UserSettingKey_value[keyString])
		if userSetting.Key == storepb.UserSettingKey_USER_SETTING_ACCESS_TOKENS {
			accessTokensUserSetting := &storepb.AccessTokensUserSetting{}
			if err := protojson.Unmarshal([]byte(valueString), accessTokensUserSetting); err != nil {
				return nil, err
			}
			userSetting.Value = &storepb.UserSetting_AccessTokens{
				AccessTokens: accessTokensUserSetting,
			}
		} else if userSetting.Key == storepb.UserSettingKey_USER_SETTING_LOCALE {
			userSetting.Value = &storepb.UserSetting_Locale{
				Locale: convertUserSettingLocaleFromString(valueString),
			}
		} else if userSetting.Key == storepb.UserSettingKey_USER_SETTING_COLOR_THEME {
			userSetting.Value = &storepb.UserSetting_ColorTheme{
				ColorTheme: convertUserSettingColorThemeFromString(valueString),
			}
		} else {
			return nil, errors.New("invalid user setting key")
		}
		userSettingList = append(userSettingList, userSetting)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	for _, userSetting := range userSettingList {
		s.userSettingCache.Store(getUserSettingCacheKey(userSetting.UserId, userSetting.Key.String()), userSetting)
	}
	return userSettingList, nil
}

func (s *Store) GetUserSetting(ctx context.Context, find *FindUserSetting) (*storepb.UserSetting, error) {
	if find.UserID != nil && find.Key != storepb.UserSettingKey_USER_SETTING_KEY_UNSPECIFIED {
		if cache, ok := s.userSettingCache.Load(getUserSettingCacheKey(*find.UserID, find.Key.String())); ok {
			return cache.(*storepb.UserSetting), nil
		}
	}

	list, err := s.ListUserSettings(ctx, find)
	if err != nil {
		return nil, err
	}

	if len(list) == 0 {
		return nil, nil
	}

	userSetting := list[0]
	s.userSettingCache.Store(getUserSettingCacheKey(userSetting.UserId, userSetting.Key.String()), userSetting)
	return userSetting, nil
}

func vacuumUserSetting(ctx context.Context, tx *sql.Tx) error {
	stmt := `
	DELETE FROM 
		user_setting 
	WHERE 
		user_id NOT IN (
			SELECT 
				id 
			FROM 
				user
		)`
	_, err := tx.ExecContext(ctx, stmt)
	if err != nil {
		return err
	}

	return nil
}

// GetUserAccessTokens returns the access tokens of the user.
func (s *Store) GetUserAccessTokens(ctx context.Context, userID int32) ([]*storepb.AccessTokensUserSetting_AccessToken, error) {
	userSetting, err := s.GetUserSetting(ctx, &FindUserSetting{
		UserID: &userID,
		Key:    storepb.UserSettingKey_USER_SETTING_ACCESS_TOKENS,
	})
	if err != nil {
		return nil, err
	}
	if userSetting == nil {
		return []*storepb.AccessTokensUserSetting_AccessToken{}, nil
	}

	accessTokensUserSetting := userSetting.GetAccessTokens()
	return accessTokensUserSetting.AccessTokens, nil
}

func convertUserSettingLocaleFromString(s string) storepb.LocaleUserSetting {
	switch s {
	case "LOCALE_USER_SETTING_EN":
		return storepb.LocaleUserSetting_LOCALE_USER_SETTING_EN
	case "LOCALE_USER_SETTING_ZH":
		return storepb.LocaleUserSetting_LOCALE_USER_SETTING_ZH
	default:
		return storepb.LocaleUserSetting_LOCALE_USER_SETTING_UNSPECIFIED
	}
}

func convertUserSettingColorThemeFromString(s string) storepb.ColorThemeUserSetting {
	switch s {
	case "COLOR_THEME_USER_SETTING_LIGHT":
		return storepb.ColorThemeUserSetting_COLOR_THEME_USER_SETTING_LIGHT
	case "COLOR_THEME_USER_SETTING_DARK":
		return storepb.ColorThemeUserSetting_COLOR_THEME_USER_SETTING_DARK
	default:
		return storepb.ColorThemeUserSetting_COLOR_THEME_USER_SETTING_UNSPECIFIED
	}
}
