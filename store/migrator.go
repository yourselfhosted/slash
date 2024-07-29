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

	workspaceSettingGeneral, err := s.GetWorkspaceSetting(ctx, &FindWorkspaceSetting{
		Key: storepb.WorkspaceSettingKey_WORKSPACE_SETTING_GENERAL,
	})
	if err != nil {
		return err
	}
	if workspaceSettingGeneral == nil || workspaceSettingGeneral.GetGeneral() == nil {
		workspaceSettingGeneral = &storepb.WorkspaceSetting{
			Key: storepb.WorkspaceSettingKey_WORKSPACE_SETTING_GENERAL,
			Value: &storepb.WorkspaceSetting_General{
				General: &storepb.WorkspaceSetting_GeneralSetting{},
			},
		}
	}
	updateWorkspaceSetting := false
	for _, workspaceSetting := range workspaceSettings {
		if workspaceSetting.Key == storepb.WorkspaceSettingKey_WORKSPACE_SETTING_LICENSE_KEY {
			workspaceSettingGeneral.GetGeneral().LicenseKey = workspaceSetting.Raw
			updateWorkspaceSetting = true
			if err := s.DeleteWorkspaceSetting(ctx, storepb.WorkspaceSettingKey_WORKSPACE_SETTING_LICENSE_KEY); err != nil {
				return err
			}
		} else if workspaceSetting.Key == storepb.WorkspaceSettingKey_WORKSPACE_SETTING_CUSTOM_STYLE {
			workspaceSettingGeneral.GetGeneral().CustomStyle = workspaceSetting.Raw
			updateWorkspaceSetting = true
			if err := s.DeleteWorkspaceSetting(ctx, storepb.WorkspaceSettingKey_WORKSPACE_SETTING_CUSTOM_STYLE); err != nil {
				return err
			}
		} else if workspaceSetting.Key == storepb.WorkspaceSettingKey_WORKSPACE_SETTING_SECRET_SESSION {
			workspaceSettingGeneral.GetGeneral().SecretSession = workspaceSetting.Raw
			updateWorkspaceSetting = true
			if err := s.DeleteWorkspaceSetting(ctx, storepb.WorkspaceSettingKey_WORKSPACE_SETTING_SECRET_SESSION); err != nil {
				return err
			}
		}
	}
	if updateWorkspaceSetting {
		if _, err := s.UpsertWorkspaceSetting(ctx, workspaceSettingGeneral); err != nil {
			return err
		}
	}
	return nil
}
