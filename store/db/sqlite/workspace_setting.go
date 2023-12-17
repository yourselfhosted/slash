package sqlite

import (
	"context"
	"errors"
	"strconv"
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
		VALUES (?, ?)
		ON CONFLICT(key) DO UPDATE 
		SET value = EXCLUDED.value
	`
	var valueString string
	if upsert.Key == storepb.WorkspaceSettingKey_WORKSPACE_SETTING_LICENSE_KEY {
		valueString = upsert.GetLicenseKey()
	} else if upsert.Key == storepb.WorkspaceSettingKey_WORKSPACE_SETTING_SECRET_SESSION {
		valueString = upsert.GetSecretSession()
	} else if upsert.Key == storepb.WorkspaceSettingKey_WORKSAPCE_SETTING_ENABLE_SIGNUP {
		valueString = strconv.FormatBool(upsert.GetEnableSignup())
	} else if upsert.Key == storepb.WorkspaceSettingKey_WORKSPACE_SETTING_CUSTOM_STYLE {
		valueString = upsert.GetCustomStyle()
	} else if upsert.Key == storepb.WorkspaceSettingKey_WORKSPACE_SETTING_CUSTOM_SCRIPT {
		valueString = upsert.GetCustomScript()
	} else if upsert.Key == storepb.WorkspaceSettingKey_WORKSPACE_SETTING_AUTO_BACKUP {
		valueBytes, err := protojson.Marshal(upsert.GetAutoBackup())
		if err != nil {
			return nil, err
		}
		valueString = string(valueBytes)
	} else if upsert.Key == storepb.WorkspaceSettingKey_WORKSPACE_SETTING_INSTANCE_URL {
		valueString = upsert.GetInstanceUrl()
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
	where, args := []string{"1 = 1"}, []any{}

	if find.Key != storepb.WorkspaceSettingKey_WORKSPACE_SETTING_KEY_UNSPECIFIED {
		where, args = append(where, "key = ?"), append(args, find.Key.String())
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
		if workspaceSetting.Key == storepb.WorkspaceSettingKey_WORKSPACE_SETTING_LICENSE_KEY {
			workspaceSetting.Value = &storepb.WorkspaceSetting_LicenseKey{LicenseKey: valueString}
		} else if workspaceSetting.Key == storepb.WorkspaceSettingKey_WORKSPACE_SETTING_SECRET_SESSION {
			workspaceSetting.Value = &storepb.WorkspaceSetting_SecretSession{SecretSession: valueString}
		} else if workspaceSetting.Key == storepb.WorkspaceSettingKey_WORKSAPCE_SETTING_ENABLE_SIGNUP {
			enableSignup, err := strconv.ParseBool(valueString)
			if err != nil {
				return nil, err
			}
			workspaceSetting.Value = &storepb.WorkspaceSetting_EnableSignup{EnableSignup: enableSignup}
		} else if workspaceSetting.Key == storepb.WorkspaceSettingKey_WORKSPACE_SETTING_CUSTOM_STYLE {
			workspaceSetting.Value = &storepb.WorkspaceSetting_CustomStyle{CustomStyle: valueString}
		} else if workspaceSetting.Key == storepb.WorkspaceSettingKey_WORKSPACE_SETTING_CUSTOM_SCRIPT {
			workspaceSetting.Value = &storepb.WorkspaceSetting_CustomScript{CustomScript: valueString}
		} else if workspaceSetting.Key == storepb.WorkspaceSettingKey_WORKSPACE_SETTING_AUTO_BACKUP {
			autoBackupSetting := &storepb.AutoBackupWorkspaceSetting{}
			if err := protojson.Unmarshal([]byte(valueString), autoBackupSetting); err != nil {
				return nil, err
			}
			workspaceSetting.Value = &storepb.WorkspaceSetting_AutoBackup{AutoBackup: autoBackupSetting}
		} else if workspaceSetting.Key == storepb.WorkspaceSettingKey_WORKSPACE_SETTING_INSTANCE_URL {
			workspaceSetting.Value = &storepb.WorkspaceSetting_InstanceUrl{InstanceUrl: valueString}
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
