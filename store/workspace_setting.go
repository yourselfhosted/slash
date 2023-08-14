package store

import (
	"context"
	"strings"
)

type WorkspaceSettingKey string

const (
	// WorkspaceSecretSessionName is the key type for secret session name.
	WorkspaceSecretSessionName WorkspaceSettingKey = "secret-session-name"
	// WorkspaceDisallowSignUp is the key type for disallow sign up in workspace level.
	WorkspaceDisallowSignUp WorkspaceSettingKey = "disallow-signup"
	// WorkspaceResourceRelativePath is the key type for resource relative path.
	WorkspaceResourceRelativePath WorkspaceSettingKey = "resource-relative-path"
)

// String returns the string format of WorkspaceSettingKey type.
func (key WorkspaceSettingKey) String() string {
	return string(key)
}

type WorkspaceSetting struct {
	Key   WorkspaceSettingKey
	Value string
}

type FindWorkspaceSetting struct {
	Key WorkspaceSettingKey
}

func (s *Store) UpsertWorkspaceSetting(ctx context.Context, upsert *WorkspaceSetting) (*WorkspaceSetting, error) {
	stmt := `
		INSERT INTO workspace_setting (
			key,
			value
		)
		VALUES (?, ?)
		ON CONFLICT(key) DO UPDATE 
		SET value = EXCLUDED.value
	`
	if _, err := s.db.ExecContext(ctx, stmt, upsert.Key, upsert.Value); err != nil {
		return nil, err
	}

	workspaceSetting := upsert
	s.workspaceSettingCache.Store(workspaceSetting.Key, workspaceSetting)
	return workspaceSetting, nil
}

func (s *Store) ListWorkspaceSettings(ctx context.Context, find *FindWorkspaceSetting) ([]*WorkspaceSetting, error) {
	where, args := []string{"1 = 1"}, []any{}

	if find.Key != "" {
		where, args = append(where, "key = ?"), append(args, find.Key)
	}

	query := `
		SELECT
			key,
			value
		FROM workspace_setting
		WHERE ` + strings.Join(where, " AND ")
	rows, err := s.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	list := []*WorkspaceSetting{}
	for rows.Next() {
		workspaceSetting := &WorkspaceSetting{}
		if err := rows.Scan(
			&workspaceSetting.Key,
			&workspaceSetting.Value,
		); err != nil {
			return nil, err
		}

		list = append(list, workspaceSetting)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	for _, workspaceSetting := range list {
		s.workspaceSettingCache.Store(workspaceSetting.Key, workspaceSetting)
	}

	return list, nil
}

func (s *Store) GetWorkspaceSetting(ctx context.Context, find *FindWorkspaceSetting) (*WorkspaceSetting, error) {
	if find.Key != "" {
		if cache, ok := s.workspaceSettingCache.Load(find.Key); ok {
			return cache.(*WorkspaceSetting), nil
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
