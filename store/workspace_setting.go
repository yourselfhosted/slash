package store

import (
	"context"

	"github.com/pkg/errors"

	storepb "github.com/yourselfhosted/slash/proto/gen/store"
)

type FindWorkspaceSetting struct {
	Key storepb.WorkspaceSettingKey
}

func (s *Store) UpsertWorkspaceSetting(ctx context.Context, upsert *storepb.WorkspaceSetting) (*storepb.WorkspaceSetting, error) {
	workspaceSetting, err := s.driver.UpsertWorkspaceSetting(ctx, upsert)
	if err != nil {
		return nil, err
	}
	s.workspaceSettingCache.Store(workspaceSetting.Key, workspaceSetting)
	return workspaceSetting, nil
}

func (s *Store) ListWorkspaceSettings(ctx context.Context, find *FindWorkspaceSetting) ([]*storepb.WorkspaceSetting, error) {
	list, err := s.driver.ListWorkspaceSettings(ctx, find)
	if err != nil {
		return nil, err
	}
	for _, workspaceSetting := range list {
		s.workspaceSettingCache.Store(workspaceSetting.Key, workspaceSetting)
	}
	return list, nil
}

func (s *Store) GetWorkspaceSetting(ctx context.Context, find *FindWorkspaceSetting) (*storepb.WorkspaceSetting, error) {
	if find.Key != storepb.WorkspaceSettingKey_WORKSPACE_SETTING_KEY_UNSPECIFIED {
		if cache, ok := s.workspaceSettingCache.Load(find.Key); ok {
			return cache.(*storepb.WorkspaceSetting), nil
		}
	}

	list, err := s.ListWorkspaceSettings(ctx, find)
	if err != nil {
		return nil, err
	}
	if len(list) == 0 {
		return nil, nil
	}

	workspaceSetting := list[0]
	s.workspaceSettingCache.Store(workspaceSetting.Key, workspaceSetting)
	return workspaceSetting, nil
}

func (s *Store) DeleteWorkspaceSetting(ctx context.Context, key storepb.WorkspaceSettingKey) error {
	if err := s.driver.DeleteWorkspaceSetting(ctx, key); err != nil {
		return errors.Wrap(err, "failed to delete workspace setting")
	}
	s.workspaceSettingCache.Delete(key)
	return nil
}

func (s *Store) GetWorkspaceGeneralSetting(ctx context.Context) (*storepb.WorkspaceSetting_GeneralSetting, error) {
	setting, err := s.GetWorkspaceSetting(ctx, &FindWorkspaceSetting{
		Key: storepb.WorkspaceSettingKey_WORKSPACE_SETTING_GENERAL,
	})
	if err != nil {
		return nil, err
	}
	generalSetting := &storepb.WorkspaceSetting_GeneralSetting{}
	if setting != nil && setting.GetGeneral() != nil {
		generalSetting = setting.GetGeneral()
	}
	return generalSetting, nil
}

func (s *Store) GetWorkspaceSecuritySetting(ctx context.Context) (*storepb.WorkspaceSetting_SecuritySetting, error) {
	setting, err := s.GetWorkspaceSetting(ctx, &FindWorkspaceSetting{
		Key: storepb.WorkspaceSettingKey_WORKSPACE_SETTING_SECURITY,
	})
	if err != nil {
		return nil, err
	}
	securitySetting := &storepb.WorkspaceSetting_SecuritySetting{
		DisallowUserRegistration: false,
	}
	if setting != nil && setting.GetSecurity() != nil {
		securitySetting = setting.GetSecurity()
	}
	return securitySetting, nil
}
