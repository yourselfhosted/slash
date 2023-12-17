package postgres

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"google.golang.org/protobuf/encoding/protojson"

	storepb "github.com/yourselfhosted/slash/proto/gen/store"
	"github.com/yourselfhosted/slash/store"
)

func (d *DB) UpsertUserSetting(ctx context.Context, upsert *storepb.UserSetting) (*storepb.UserSetting, error) {
	stmt := `
		INSERT INTO user_setting (
			user_id, key, value
		)
		VALUES ($1, $2, $3)
		ON CONFLICT(user_id, key) DO UPDATE 
		SET value = EXCLUDED.value
		RETURNING user_id, key, value
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

	if _, err := d.db.ExecContext(ctx, stmt, upsert.UserId, upsert.Key.String(), valueString); err != nil {
		return nil, err
	}

	userSettingMessage := upsert
	return userSettingMessage, nil
}

func (d *DB) ListUserSettings(ctx context.Context, find *store.FindUserSetting) ([]*storepb.UserSetting, error) {
	where, args := []string{"1 = 1"}, []any{}

	if v := find.Key; v != storepb.UserSettingKey_USER_SETTING_KEY_UNSPECIFIED {
		where, args = append(where, fmt.Sprintf("key = $%d", len(args)+1)), append(args, v.String())
	}
	if v := find.UserID; v != nil {
		where, args = append(where, fmt.Sprintf("user_id = $%d", len(args)+1)), append(args, *find.UserID)
	}

	query := `
		SELECT
			user_id,
			key,
			value
		FROM user_setting
		WHERE ` + strings.Join(where, " AND ")
	rows, err := d.db.QueryContext(ctx, query, args...)
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
				Locale: storepb.LocaleUserSetting(storepb.LocaleUserSetting_value[valueString]),
			}
		} else if userSetting.Key == storepb.UserSettingKey_USER_SETTING_COLOR_THEME {
			userSetting.Value = &storepb.UserSetting_ColorTheme{
				ColorTheme: storepb.ColorThemeUserSetting(storepb.ColorThemeUserSetting_value[valueString]),
			}
		} else {
			return nil, errors.New("invalid user setting key")
		}
		userSettingList = append(userSettingList, userSetting)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return userSettingList, nil
}

func vacuumUserSetting(ctx context.Context, tx *sql.Tx) error {
	stmt := `DELETE FROM user_setting WHERE user_id NOT IN (SELECT id FROM "user")`
	_, err := tx.ExecContext(ctx, stmt)
	if err != nil {
		return err
	}

	return nil
}
