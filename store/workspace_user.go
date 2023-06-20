package store

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"github.com/boojack/shortify/api"
	"github.com/boojack/shortify/internal/errorutil"
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

func (s *Store) UpsertWorkspaceUserV1(ctx context.Context, upsert *WorkspaceUser) (*WorkspaceUser, error) {
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

func (s *Store) DeleteWorkspaceUserV1(ctx context.Context, delete *DeleteWorkspaceUser) error {
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

// workspaceUserRaw is the store model for WorkspaceUser.
type workspaceUserRaw struct {
	WorkspaceID int
	UserID      int
	Role        api.Role
}

func (raw *workspaceUserRaw) toWorkspaceUser() *api.WorkspaceUser {
	return &api.WorkspaceUser{
		WorkspaceID: raw.WorkspaceID,
		UserID:      raw.UserID,
		Role:        raw.Role,
	}
}

func (s *Store) ComposeWorkspaceUser(ctx context.Context, workspaceUser *api.WorkspaceUser) error {
	user, err := s.FindUser(ctx, &api.UserFind{
		ID: &workspaceUser.UserID,
	})
	if err != nil {
		return err
	}

	workspaceUser.Email = user.Email
	workspaceUser.DisplayName = user.DisplayName

	return nil
}

func (s *Store) ComposeWorkspaceUserListForWorkspace(ctx context.Context, workspace *api.Workspace) error {
	workspaceUserList, err := s.FindWordspaceUserList(ctx, &api.WorkspaceUserFind{
		WorkspaceID: &workspace.ID,
	})
	if err != nil {
		return err
	}

	for _, workspaceUser := range workspaceUserList {
		if err := s.ComposeWorkspaceUser(ctx, workspaceUser); err != nil {
			return err
		}
	}
	workspace.WorkspaceUserList = workspaceUserList

	return nil
}

func (s *Store) UpsertWorkspaceUser(ctx context.Context, upsert *api.WorkspaceUserUpsert) (*api.WorkspaceUser, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	workspaceUserRaw, err := upsertWorkspaceUser(ctx, tx, upsert)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	workspaceUser := workspaceUserRaw.toWorkspaceUser()

	return workspaceUser, nil
}

func (s *Store) FindWordspaceUserList(ctx context.Context, find *api.WorkspaceUserFind) ([]*api.WorkspaceUser, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	workspaceUserRawList, err := findWorkspaceUserList(ctx, tx, find)
	if err != nil {
		return nil, err
	}

	list := []*api.WorkspaceUser{}
	for _, raw := range workspaceUserRawList {
		list = append(list, raw.toWorkspaceUser())
	}

	return list, nil
}

func (s *Store) FindWordspaceUser(ctx context.Context, find *api.WorkspaceUserFind) (*api.WorkspaceUser, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	list, err := findWorkspaceUserList(ctx, tx, find)
	if err != nil {
		return nil, err
	}

	if len(list) == 0 {
		return nil, &errorutil.Error{Code: errorutil.NotFound, Err: fmt.Errorf("not found workspace user with filter %+v", find)}
	} else if len(list) > 1 {
		return nil, &errorutil.Error{Code: errorutil.Conflict, Err: fmt.Errorf("found %d workspaces user with filter %+v, expect 1", len(list), find)}
	}

	workspaceUser := list[0].toWorkspaceUser()
	return workspaceUser, nil
}

func (s *Store) DeleteWorkspaceUser(ctx context.Context, delete *api.WorkspaceUserDelete) error {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	err = deleteWorkspaceUser(ctx, tx, delete)
	if err != nil {
		return err
	}

	err = tx.Commit()
	return err
}

func upsertWorkspaceUser(ctx context.Context, tx *sql.Tx, upsert *api.WorkspaceUserUpsert) (*workspaceUserRaw, error) {
	set := []string{"workspace_id", "user_id", "role"}
	args := []any{upsert.WorkspaceID, upsert.UserID, upsert.Role}
	placeholder := []string{"?", "?", "?"}

	if v := upsert.UpdatedTs; v != nil {
		set, args, placeholder = append(set, "updated_ts"), append(args, *v), append(placeholder, "?")
	}

	query := `
		INSERT INTO workspace_user (
			` + strings.Join(set, ", ") + `
		)
		VALUES (` + strings.Join(placeholder, ",") + `)
		ON CONFLICT(workspace_id, user_id) DO UPDATE 
		SET
			role = EXCLUDED.role
		RETURNING workspace_id, user_id, role
	`
	var workspaceUserRaw workspaceUserRaw
	if err := tx.QueryRowContext(ctx, query, args...).Scan(
		&workspaceUserRaw.WorkspaceID,
		&workspaceUserRaw.UserID,
		&workspaceUserRaw.Role,
	); err != nil {
		return nil, err
	}

	return &workspaceUserRaw, nil
}

func findWorkspaceUserList(ctx context.Context, tx *sql.Tx, find *api.WorkspaceUserFind) ([]*workspaceUserRaw, error) {
	where, args := []string{"1 = 1"}, []any{}

	if v := find.WorkspaceID; v != nil {
		where, args = append(where, "workspace_id = ?"), append(args, *v)
	}
	if v := find.UserID; v != nil {
		where, args = append(where, "user_id = ?"), append(args, *v)
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

	workspaceUserRawList := make([]*workspaceUserRaw, 0)
	for rows.Next() {
		var workspaceUserRaw workspaceUserRaw
		if err := rows.Scan(
			&workspaceUserRaw.WorkspaceID,
			&workspaceUserRaw.UserID,
			&workspaceUserRaw.Role,
		); err != nil {
			return nil, err
		}

		workspaceUserRawList = append(workspaceUserRawList, &workspaceUserRaw)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return workspaceUserRawList, nil
}

func deleteWorkspaceUser(ctx context.Context, tx *sql.Tx, delete *api.WorkspaceUserDelete) error {
	result, err := tx.ExecContext(ctx, `
		DELETE FROM workspace_user WHERE workspace_id = ? AND user_id = ?
	`, delete.WorkspaceID, delete.UserID)
	if err != nil {
		return err
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		return &errorutil.Error{Code: errorutil.NotFound, Err: fmt.Errorf("workspace user not found")}
	}

	return nil
}
