package postgres

import (
	"context"
	"errors"
	"slices"
	"strings"

	"google.golang.org/protobuf/encoding/protojson"

	storepb "github.com/yourselfhosted/slash/proto/gen/store"
	"github.com/yourselfhosted/slash/store"
)

func (d *DB) UpsertWorkspaceSetting(ctx context.Context, upsert *storepb.WorkspaceSetting) (*storepb.WorkspaceSetting, error) {
	stmt := `
		INSERT INTO workspace_setting (
			key,
			value
		)
		VALUES ($1, $2)
		ON CONFLICT(key) DO UPDATE 
		SET value = EXCLUDED.value
	`
	var valueString string
	if upsert.Key == storepb.WorkspaceSettingKey_WORKSPACE_SETTING_GENERAL {
		valueBytes, err := protojson.Marshal(upsert.GetGeneral())
		if err != nil {
			return nil, err
		}
		valueString = string(valueBytes)
	} else if upsert.Key == storepb.WorkspaceSettingKey_WORKSPACE_SETTING_SHORTCUT_RELATED {
		valueBytes, err := protojson.Marshal(upsert.GetShortcutRelated())
		if err != nil {
			return nil, err
		}
		valueString = string(valueBytes)
	} else {
		return nil, errors.New("invalid workspace setting key")
	}

	if _, err := d.db.ExecContext(ctx, stmt, upsert.Key.String(), valueString); err != nil {
		return nil, err
	}

	workspaceSetting := upsert
	return workspaceSetting, nil
}

func (d *DB) ListWorkspaceSettings(ctx context.Context, find *store.FindWorkspaceSetting) ([]*storepb.WorkspaceSetting, error) {
	where, args := []string{"1 = 1"}, []interface{}{}

	if find.Key != storepb.WorkspaceSettingKey_WORKSPACE_SETTING_KEY_UNSPECIFIED {
		where, args = append(where, "key = "+placeholder(len(args)+1)), append(args, find.Key.String())
	}

	query := `
		SELECT
			key,
			value
		FROM workspace_setting
		WHERE ` + strings.Join(where, " AND ")
	rows, err := d.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	list := []*storepb.WorkspaceSetting{}
	for rows.Next() {
		workspaceSetting := &storepb.WorkspaceSetting{}
		var keyString, valueString string
		if err := rows.Scan(
			&keyString,
			&valueString,
		); err != nil {
			return nil, err
		}
		workspaceSetting.Key = storepb.WorkspaceSettingKey(storepb.WorkspaceSettingKey_value[keyString])
		if workspaceSetting.Key == storepb.WorkspaceSettingKey_WORKSPACE_SETTING_GENERAL {
			workspaceSettingGeneral := &storepb.WorkspaceSetting_GeneralSetting{}
			if err := protojsonUnmarshaler.Unmarshal([]byte(valueString), workspaceSettingGeneral); err != nil {
				return nil, err
			}
			workspaceSetting.Value = &storepb.WorkspaceSetting_General{
				General: workspaceSettingGeneral,
			}
		} else if workspaceSetting.Key == storepb.WorkspaceSettingKey_WORKSPACE_SETTING_SHORTCUT_RELATED {
			workspaceSettingShortcutRelated := &storepb.WorkspaceSetting_ShortcutRelatedSetting{}
			if err := protojsonUnmarshaler.Unmarshal([]byte(valueString), workspaceSettingShortcutRelated); err != nil {
				return nil, err
			}
			workspaceSetting.Value = &storepb.WorkspaceSetting_ShortcutRelated{
				ShortcutRelated: workspaceSettingShortcutRelated,
			}
		} else if slices.Contains([]storepb.WorkspaceSettingKey{
			storepb.WorkspaceSettingKey_WORKSPACE_SETTING_LICENSE_KEY,
			storepb.WorkspaceSettingKey_WORKSPACE_SETTING_SECRET_SESSION,
			storepb.WorkspaceSettingKey_WORKSPACE_SETTING_CUSTOM_STYLE,
			storepb.WorkspaceSettingKey_WORKSPACE_SETTING_DEFAULT_VISIBILITY,
		}, workspaceSetting.Key) {
			workspaceSetting.Raw = valueString
		} else {
			continue
		}
		list = append(list, workspaceSetting)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return list, nil
}

func (d *DB) DeleteWorkspaceSetting(ctx context.Context, key storepb.WorkspaceSettingKey) error {
	stmt := `
		DELETE FROM workspace_setting
		WHERE key = $1
	`
	if _, err := d.db.ExecContext(ctx, stmt, key.String()); err != nil {
		return err
	}
	return nil
}
