package store

import (
	"context"
	"database/sql"
	"strings"
)

// Role is the type of a role.
type Role string

const (
	// RoleAdmin is the ADMIN role.
	RoleAdmin Role = "ADMIN"
	// RoleUser is the USER role.
	RoleUser Role = "USER"
)

type WorkspaceUser struct {
	WorkspaceID int
	UserID      int
	Role        Role
}

type FindWorkspaceUser struct {
	WorkspaceID *int
	UserID      *int
	Role        *Role
}

type DeleteWorkspaceUser struct {
	WorkspaceID int
	UserID      int
}

func (s *Store) UpsertWorkspaceUser(ctx context.Context, upsert *WorkspaceUser) (*WorkspaceUser, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	set := []string{"workspace_id", "user_id", "role"}
	args := []any{upsert.WorkspaceID, upsert.UserID, upsert.Role}
	placeholder := []string{"?", "?", "?"}

	query := `
		INSERT INTO workspace_user (
			` + strings.Join(set, ", ") + `
		)
		VALUES (` + strings.Join(placeholder, ",") + `)
		ON CONFLICT(workspace_id, user_id) DO UPDATE 
		SET
			role = EXCLUDED.role
	`
	if _, err := tx.ExecContext(ctx, query, args...); err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	workspaceUser := upsert
	return workspaceUser, nil
}

func (s *Store) ListWorkspaceUsers(ctx context.Context, find *FindWorkspaceUser) ([]*WorkspaceUser, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	list, err := listWorkspaceUsers(ctx, tx, find)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return list, nil
}

func (s *Store) GetWorkspaceUser(ctx context.Context, find *FindWorkspaceUser) (*WorkspaceUser, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	list, err := listWorkspaceUsers(ctx, tx, find)
	if err != nil {
		return nil, err
	}

	if len(list) == 0 {
		return nil, nil
	}
	workspaceUser := list[0]
	return workspaceUser, nil
}

func (s *Store) DeleteWorkspaceUser(ctx context.Context, delete *DeleteWorkspaceUser) error {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if _, err := tx.ExecContext(ctx, `
		DELETE FROM workspace_user WHERE workspace_id = ? AND user_id = ?
	`, delete.WorkspaceID, delete.UserID); err != nil {
		return err
	}

	if err := tx.Commit(); err != nil {
		// do nothing here to prevent linter warning.
		return err
	}

	return nil
}

func listWorkspaceUsers(ctx context.Context, tx *sql.Tx, find *FindWorkspaceUser) ([]*WorkspaceUser, error) {
	where, args := []string{"1 = 1"}, []any{}

	if v := find.WorkspaceID; v != nil {
		where, args = append(where, "workspace_id = ?"), append(args, *v)
	}
	if v := find.UserID; v != nil {
		where, args = append(where, "user_id = ?"), append(args, *v)
	}
	if v := find.Role; v != nil {
		where, args = append(where, "role = ?"), append(args, *v)
	}

	query := `
		SELECT 
			workspace_id,
			user_id,
			role
		FROM workspace_user
		WHERE ` + strings.Join(where, " AND ")
	rows, err := tx.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := make([]*WorkspaceUser, 0)
	for rows.Next() {
		var workspaceUser WorkspaceUser
		if err := rows.Scan(
			&workspaceUser.WorkspaceID,
			&workspaceUser.UserID,
			&workspaceUser.Role,
		); err != nil {
			return nil, err
		}

		list = append(list, &workspaceUser)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return list, nil
}
