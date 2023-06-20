package store

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
)

type Workspace struct {
	ID int

	// Standard fields
	CreatedTs int64
	UpdatedTs int64
	RowStatus RowStatus

	// Domain specific fields
	ResourceID  string
	Title       string
	Description string
}

type UpdateWorkspace struct {
	ID int

	// Standard fields
	RowStatus *RowStatus

	// Domain specific fields
	ResourceID  *string
	Title       *string
	Description *string
}

type FindWorkspace struct {
	ID         *int
	RowStatus  *RowStatus
	ResourceID *string
}

type DeleteWorkspace struct {
	ID int
}

func (s *Store) CreateWorkspace(ctx context.Context, create *Workspace) (*Workspace, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	query := `
		INSERT INTO workspace (
			resource_id,
			title,
			description
		)
		VALUES (?, ?, ?)
		RETURNING id, created_ts, updated_ts, row_status
	`
	if err := tx.QueryRowContext(ctx, query,
		create.ResourceID,
		create.Title,
		create.Description,
	).Scan(
		&create.ID,
		&create.CreatedTs,
		&create.UpdatedTs,
		&create.RowStatus,
	); err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	workspace := create
	return workspace, nil
}

func (s *Store) UpdateWorkspace(ctx context.Context, update *UpdateWorkspace) (*Workspace, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	set, args := []string{}, []any{}

	if v := update.RowStatus; v != nil {
		set, args = append(set, "row_status = ?"), append(args, *v)
	}
	if v := update.ResourceID; v != nil {
		set, args = append(set, "resource_id = ?"), append(args, *v)
	}
	if v := update.Title; v != nil {
		set, args = append(set, "title = ?"), append(args, *v)
	}
	if v := update.Description; v != nil {
		set, args = append(set, "description = ?"), append(args, *v)
	}
	args = append(args, update.ID)

	query := `
		UPDATE workspace
		SET ` + strings.Join(set, ", ") + `
		WHERE id = ?
		RETURNING id, created_ts, updated_ts, row_status, resource_id, title, description
	`
	row, err := tx.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer row.Close()

	if !row.Next() {
		return nil, errors.New(fmt.Sprint("workspace ID not found: ", update.ID))
	}
	workspace := &Workspace{}
	if err := row.Scan(
		&workspace.ID,
		&workspace.CreatedTs,
		&workspace.UpdatedTs,
		&workspace.RowStatus,
		&workspace.ResourceID,
		&workspace.Title,
		&workspace.Description,
	); err != nil {
		return nil, err
	}

	if err := row.Err(); err != nil {
		return nil, err
	}
	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return workspace, nil
}

func (s *Store) ListWorkspaces(ctx context.Context, find *FindWorkspace) ([]*Workspace, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	list, err := listWorkspaces(ctx, tx, find)
	if err != nil {
		return nil, err
	}

	return list, nil
}

func (s *Store) GetWorkspace(ctx context.Context, find *FindWorkspace) (*Workspace, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	list, err := listWorkspaces(ctx, tx, find)
	if err != nil {
		return nil, err
	}

	if len(list) == 0 {
		return nil, nil
	}
	return list[0], nil
}

func (s *Store) DeleteWorkspace(ctx context.Context, delete *DeleteWorkspace) error {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if _, err := tx.ExecContext(ctx, `
		DELETE FROM workspace WHERE id = ?
	`, delete.ID); err != nil {
		return err
	}

	if err := tx.Commit(); err != nil {
		// do nothing here to prevent linter warning.
		return err
	}

	return nil
}

func listWorkspaces(ctx context.Context, tx *sql.Tx, find *FindWorkspace) ([]*Workspace, error) {
	where, args := []string{"1 = 1"}, []any{}

	if v := find.ID; v != nil {
		where, args = append(where, "id = ?"), append(args, *v)
	}
	if v := find.RowStatus; v != nil {
		where, args = append(where, "row_status = ?"), append(args, *v)
	}
	if v := find.ResourceID; v != nil {
		where, args = append(where, "resource_id = ?"), append(args, *v)
	}

	query := `
		SELECT 
			id,
			created_ts,
			updated_ts,
			row_status,
			resource_id,
			title,
			description
		FROM workspace
		WHERE ` + strings.Join(where, " AND ") + `
		ORDER BY created_ts DESC, row_status DESC
	`
	rows, err := tx.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := make([]*Workspace, 0)
	for rows.Next() {
		var workspace Workspace
		if err := rows.Scan(
			&workspace.ID,
			&workspace.CreatedTs,
			&workspace.UpdatedTs,
			&workspace.RowStatus,
			&workspace.ResourceID,
			&workspace.Title,
			&workspace.Description,
		); err != nil {
			return nil, err
		}

		list = append(list, &workspace)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return list, nil
}
