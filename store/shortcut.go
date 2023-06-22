package store

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
)

// Visibility is the type of a visibility.
type Visibility string

const (
	// VisibilityPublic is the PUBLIC visibility.
	VisibilityPublic Visibility = "PUBLIC"
	// VisibilityWorkspace is the WORKSPACE visibility.
	VisibilityWorkspace Visibility = "WORKSPACE"
	// VisibilityPrivate is the PRIVATE visibility.
	VisibilityPrivate Visibility = "PRIVATE"
)

func (e Visibility) String() string {
	switch e {
	case VisibilityPublic:
		return "PUBLIC"
	case VisibilityWorkspace:
		return "WORKSPACE"
	case VisibilityPrivate:
		return "PRIVATE"
	}
	return "PRIVATE"
}

type Shortcut struct {
	ID int

	// Standard fields
	CreatorID int
	CreatedTs int64
	UpdatedTs int64
	RowStatus RowStatus

	// Domain specific fields
	Name        string
	Link        string
	Description string
	Visibility  Visibility
}

type UpdateShortcut struct {
	ID int

	RowStatus   *RowStatus
	Name        *string
	Link        *string
	Description *string
	Visibility  *Visibility
}

type FindShortcut struct {
	ID             *int
	CreatorID      *int
	RowStatus      *RowStatus
	Name           *string
	VisibilityList []Visibility
}

type DeleteShortcut struct {
	ID int
}

func (s *Store) CreateShortcut(ctx context.Context, create *Shortcut) (*Shortcut, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	set := []string{"creator_id", "name", "link", "description", "visibility"}
	args := []any{create.CreatorID, create.Name, create.Link, create.Description, create.Visibility}
	placeholder := []string{"?", "?", "?", "?", "?"}

	query := `
		INSERT INTO shortcut (
			` + strings.Join(set, ", ") + `
		)
		VALUES (` + strings.Join(placeholder, ",") + `)
		RETURNING id, created_ts, updated_ts, row_status
	`
	if err := tx.QueryRowContext(ctx, query, args...).Scan(
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

	return create, nil
}

func (s *Store) UpdateShortcut(ctx context.Context, update *UpdateShortcut) (*Shortcut, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	set, args := []string{}, []any{}
	if update.RowStatus != nil {
		set, args = append(set, "row_status = ?"), append(args, update.RowStatus.String())
	}
	if update.Name != nil {
		set, args = append(set, "name = ?"), append(args, *update.Name)
	}
	if update.Link != nil {
		set, args = append(set, "link = ?"), append(args, *update.Link)
	}
	if update.Description != nil {
		set, args = append(set, "description = ?"), append(args, *update.Description)
	}
	if update.Visibility != nil {
		set, args = append(set, "visibility = ?"), append(args, update.Visibility.String())
	}
	if len(set) == 0 {
		return nil, fmt.Errorf("no update specified")
	}
	args = append(args, update.ID)

	query := `
		UPDATE shortcut
		SET
			` + strings.Join(set, ", ") + `
		WHERE
			id = ?
		RETURNING id, creator_id, created_ts, updated_ts, row_status, name, link, description, visibility
	`
	shortcut := &Shortcut{}
	if err := tx.QueryRowContext(ctx, query, args...).Scan(
		&shortcut.ID,
		&shortcut.CreatorID,
		&shortcut.CreatedTs,
		&shortcut.UpdatedTs,
		&shortcut.RowStatus,
		&shortcut.Name,
		&shortcut.Link,
		&shortcut.Description,
		&shortcut.Visibility,
	); err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	s.shortcutCache.Store(shortcut.ID, shortcut)
	return shortcut, nil
}

func (s *Store) ListShortcuts(ctx context.Context, find *FindShortcut) ([]*Shortcut, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	list, err := listShortcuts(ctx, tx, find)
	if err != nil {
		return nil, err
	}

	for _, shortcut := range list {
		s.shortcutCache.Store(shortcut.ID, shortcut)
	}
	return list, nil
}

func (s *Store) GetShortcut(ctx context.Context, find *FindShortcut) (*Shortcut, error) {
	if find.ID != nil {
		if cache, ok := s.shortcutCache.Load(*find.ID); ok {
			return cache.(*Shortcut), nil
		}
	}

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	shortcuts, err := listShortcuts(ctx, tx, find)
	if err != nil {
		return nil, err
	}

	if len(shortcuts) == 0 {
		return nil, nil
	}

	shortcut := shortcuts[0]
	s.shortcutCache.Store(shortcut.ID, shortcut)
	return shortcut, nil
}

func (s *Store) DeleteShortcut(ctx context.Context, delete *DeleteShortcut) error {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if _, err := tx.ExecContext(ctx, `DELETE FROM shortcut WHERE id = ?`, delete.ID); err != nil {
		return err
	}

	if err := tx.Commit(); err != nil {
		// do nothing here to prevent linter warning.
		return err
	}

	s.shortcutCache.Delete(delete.ID)
	return nil
}

func listShortcuts(ctx context.Context, tx *sql.Tx, find *FindShortcut) ([]*Shortcut, error) {
	where, args := []string{"1 = 1"}, []any{}

	if v := find.ID; v != nil {
		where, args = append(where, "id = ?"), append(args, *v)
	}
	if v := find.CreatorID; v != nil {
		where, args = append(where, "creator_id = ?"), append(args, *v)
	}
	if v := find.RowStatus; v != nil {
		where, args = append(where, "row_status = ?"), append(args, *v)
	}
	if v := find.Name; v != nil {
		where, args = append(where, "name = ?"), append(args, *v)
	}
	if v := find.VisibilityList; len(v) != 0 {
		list := []string{}
		for _, visibility := range v {
			list = append(list, fmt.Sprintf("$%d", len(args)+1))
			args = append(args, visibility)
		}
		where = append(where, fmt.Sprintf("visibility in (%s)", strings.Join(list, ",")))
	}

	rows, err := tx.QueryContext(ctx, `
		SELECT
			id,
			creator_id,
			created_ts,
			updated_ts,
			row_status,
			name,
			link,
			description,
			visibility
		FROM shortcut
		WHERE `+strings.Join(where, " AND ")+`
		ORDER BY created_ts DESC`,
		args...,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := make([]*Shortcut, 0)
	for rows.Next() {
		shortcut := &Shortcut{}
		if err := rows.Scan(
			&shortcut.ID,
			&shortcut.CreatorID,
			&shortcut.CreatedTs,
			&shortcut.UpdatedTs,
			&shortcut.RowStatus,
			&shortcut.Name,
			&shortcut.Link,
			&shortcut.Description,
			&shortcut.Visibility,
		); err != nil {
			return nil, err
		}
		list = append(list, shortcut)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return list, nil
}
