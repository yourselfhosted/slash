package store

import (
	"context"
	"database/sql"
	"errors"
	"strings"

	storepb "github.com/boojack/slash/proto/gen/store"
	"google.golang.org/protobuf/encoding/protojson"
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
		valueBytes, err := protojson.Marshal(upsert.GetAccessTokensUserSetting())
		if err != nil {
			return nil, err
		}
		valueString = string(valueBytes)
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
			userSetting.Value = &storepb.UserSetting_AccessTokensUserSetting{
				AccessTokensUserSetting: accessTokensUserSetting,
			}
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
