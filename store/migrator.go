package store

import (
	"context"

	storepb "github.com/yourselfhosted/slash/proto/gen/store"
)

func (s *Store) MigrateWorkspaceSettings(ctx context.Context) error {
	workspaceSettings, err := s.driver.ListWorkspaceSettings(ctx, &FindWorkspaceSetting{})
	if err != nil {
		return err
	}

	workspaceGeneralSetting, err := s.GetWorkspaceGeneralSetting(ctx)
	if err != nil {
		return err
	}
	updateWorkspaceSetting := false
	for _, workspaceSetting := range workspaceSettings {
		if workspaceSetting.Key == storepb.WorkspaceSettingKey_WORKSPACE_SETTING_LICENSE_KEY {
			workspaceGeneralSetting.LicenseKey = workspaceSetting.Raw
			updateWorkspaceSetting = true
			if err := s.DeleteWorkspaceSetting(ctx, storepb.WorkspaceSettingKey_WORKSPACE_SETTING_LICENSE_KEY); err != nil {
				return err
			}
		} else if workspaceSetting.Key == storepb.WorkspaceSettingKey_WORKSPACE_SETTING_CUSTOM_STYLE {
			workspaceGeneralSetting.CustomStyle = workspaceSetting.Raw
			updateWorkspaceSetting = true
			if err := s.DeleteWorkspaceSetting(ctx, storepb.WorkspaceSettingKey_WORKSPACE_SETTING_CUSTOM_STYLE); err != nil {
				return err
			}
		} else if workspaceSetting.Key == storepb.WorkspaceSettingKey_WORKSPACE_SETTING_SECRET_SESSION {
			workspaceGeneralSetting.SecretSession = workspaceSetting.Raw
			updateWorkspaceSetting = true
			if err := s.DeleteWorkspaceSetting(ctx, storepb.WorkspaceSettingKey_WORKSPACE_SETTING_SECRET_SESSION); err != nil {
				return err
			}
		}
	}
	if updateWorkspaceSetting {
		if _, err := s.UpsertWorkspaceSetting(ctx, &storepb.WorkspaceSetting{
			Key: storepb.WorkspaceSettingKey_WORKSPACE_SETTING_GENERAL,
			Value: &storepb.WorkspaceSetting_General{
				General: workspaceGeneralSetting,
			},
		}); err != nil {
			return err
		}
	}
	return nil
}
