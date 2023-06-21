package store

import (
	"context"
	"database/sql"
	"strings"
)

type WorkspaceSetting struct {
	Key   string
	Value string
}

type FindWorkspaceSetting struct {
	Key string
}

func (s *Store) UpsertWorkspaceSetting(ctx context.Context, upsert *WorkspaceSetting) (*WorkspaceSetting, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	query := `
		INSERT INTO workspace_setting (
			key,
			value
		)
		VALUES (?, ?)
		ON CONFLICT(key) DO UPDATE 
		SET value = EXCLUDED.value
	`
	if _, err := tx.ExecContext(ctx, query, upsert.Key, upsert.Value); err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	workspaceSetting := upsert
	return workspaceSetting, nil
}

func (s *Store) ListWorkspaceSettings(ctx context.Context, find *FindWorkspaceSetting) ([]*WorkspaceSetting, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	list, err := listWorkspaceSettings(ctx, tx, find)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return list, nil
}

func (s *Store) GetWorkspaceSetting(ctx context.Context, find *FindWorkspaceSetting) (*WorkspaceSetting, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	list, err := listWorkspaceSettings(ctx, tx, find)
	if err != nil {
		return nil, err
	}

	if len(list) == 0 {
		return nil, nil
	}

	workspaceSetting := list[0]
	return workspaceSetting, nil
}

func listWorkspaceSettings(ctx context.Context, tx *sql.Tx, find *FindWorkspaceSetting) ([]*WorkspaceSetting, error) {
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

	rows, err := tx.QueryContext(ctx, query, args...)
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
	return list, nil
}
