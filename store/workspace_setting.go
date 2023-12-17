package store

import (
	"context"

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
