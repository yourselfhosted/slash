package store

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"github.com/boojack/shortify/api"
	"github.com/boojack/shortify/internal/errorutil"
)

// Visibility is the type of a visibility.
type Visibility string

const (
	// VisibilityPublic is the PUBLIC visibility.
	VisibilityPublic Visibility = "PUBLIC"
	// VisibilityWorkspace is the WORKSPACE visibility.
	VisibilityWorkspace Visibility = "WORKSPACE"
	// VisibilityPrivite is the PRIVATE visibility.
	VisibilityPrivite Visibility = "PRIVATE"
)

func (e Visibility) String() string {
	switch e {
	case VisibilityPublic:
		return "PUBLIC"
	case VisibilityWorkspace:
		return "WORKSPACE"
	case VisibilityPrivite:
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
	WorkspaceID int
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
	WorkspaceID    *int
	Name           *string
	VisibilityList []Visibility
}

type DeleteShortcut struct {
	ID int
}

func (s *Store) CreateShortcutV1(ctx context.Context, create *Shortcut) (*Shortcut, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	set := []string{"creator_id", "workspace_id", "name", "link", "description", "visibility"}
	args := []any{create.CreatorID, create.WorkspaceID, create.Name, create.Link, create.Description, create.Visibility}
	placeholder := []string{"?", "?", "?", "?", "?", "?"}

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

func (s *Store) UpdateShortcutV1(ctx context.Context, update *UpdateShortcut) (*Shortcut, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	set, args := []string{}, []any{}

	if update.RowStatus != nil {
		set, args = append(set, "row_status = ?"), append(args, *update.RowStatus)
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
		set, args = append(set, "visibility = ?"), append(args, *update.Visibility)
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
		RETURNING id, creator_id, created_ts, updated_ts, workspace_id, row_status, name, link, description, visibility
	`
	var shortcut Shortcut
	if err := tx.QueryRowContext(ctx, query, args...).Scan(
		&shortcut.ID,
		&shortcut.CreatorID,
		&shortcut.CreatedTs,
		&shortcut.UpdatedTs,
		&shortcut.WorkspaceID,
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

	return &shortcut, nil
}

func (s *Store) ListShortcuts(ctx context.Context, find *FindShortcut) ([]*Shortcut, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	shortcuts, err := listShortcuts(ctx, tx, find)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return shortcuts, nil
}

func (s *Store) GetShortcut(ctx context.Context, find *FindShortcut) (*Shortcut, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	shortcuts, err := listShortcuts(ctx, tx, find)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	if len(shortcuts) == 0 {
		return nil, nil
	}
	return shortcuts[0], nil
}

func (s *Store) DeleteShortcutV1(ctx context.Context, delete *DeleteShortcut) error {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if _, err := tx.ExecContext(ctx, `
		DELETE FROM shortcut WHERE id = ?
	`, delete.ID); err != nil {
		return err
	}

	if err := tx.Commit(); err != nil {
		// do nothing here to prevent linter warning.
		return err
	}

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
	if v := find.WorkspaceID; v != nil {
		where, args = append(where, "workspace_id = ?"), append(args, *v)
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
			workspace_id,
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
		var shortcut Shortcut
		if err := rows.Scan(
			&shortcut.ID,
			&shortcut.CreatorID,
			&shortcut.CreatedTs,
			&shortcut.UpdatedTs,
			&shortcut.WorkspaceID,
			&shortcut.RowStatus,
			&shortcut.Name,
			&shortcut.Link,
			&shortcut.Description,
			&shortcut.Visibility,
		); err != nil {
			return nil, err
		}

		list = append(list, &shortcut)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return list, nil
}

// shortcutRaw is the store model for an Shortcut.
// Fields have exactly the same meanings as Shortcut.
type shortcutRaw struct {
	ID int

	// Standard fields
	CreatorID   int
	CreatedTs   int64
	UpdatedTs   int64
	WorkspaceID int
	RowStatus   api.RowStatus

	// Domain specific fields
	Name        string
	Link        string
	Description string
	Visibility  api.Visibility
}

func (raw *shortcutRaw) toShortcut() *api.Shortcut {
	return &api.Shortcut{
		ID: raw.ID,

		CreatorID:   raw.CreatorID,
		CreatedTs:   raw.CreatedTs,
		UpdatedTs:   raw.UpdatedTs,
		WorkspaceID: raw.WorkspaceID,
		RowStatus:   raw.RowStatus,

		Name:        raw.Name,
		Link:        raw.Link,
		Description: raw.Description,
		Visibility:  raw.Visibility,
	}
}

func (*Store) ComposeShortcut(_ context.Context, _ *api.Shortcut) error {
	// TODO: implement this.
	return nil
}

func (s *Store) CreateShortcut(ctx context.Context, create *api.ShortcutCreate) (*api.Shortcut, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	shortcutRaw, err := createShortcut(ctx, tx, create)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	s.shortcutCache.Store(shortcutRaw.ID, shortcutRaw)
	shortcut := shortcutRaw.toShortcut()
	return shortcut, nil
}

func (s *Store) PatchShortcut(ctx context.Context, patch *api.ShortcutPatch) (*api.Shortcut, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	shortcutRaw, err := patchShortcut(ctx, tx, patch)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	s.shortcutCache.Store(shortcutRaw.ID, shortcutRaw)
	shortcut := shortcutRaw.toShortcut()
	return shortcut, nil
}

func (s *Store) FindShortcutList(ctx context.Context, find *api.ShortcutFind) ([]*api.Shortcut, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	shortcutRawList, err := findShortcutList(ctx, tx, find)
	if err != nil {
		return nil, err
	}

	list := []*api.Shortcut{}
	for _, shortcutRaw := range shortcutRawList {
		s.shortcutCache.Store(shortcutRaw.ID, shortcutRaw)
		list = append(list, shortcutRaw.toShortcut())
	}

	return list, nil
}

func (s *Store) FindShortcut(ctx context.Context, find *api.ShortcutFind) (*api.Shortcut, error) {
	if find.ID != nil {
		if cache, ok := s.shortcutCache.Load(*find.ID); ok {
			return cache.(*shortcutRaw).toShortcut(), nil
		}
	}

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	list, err := findShortcutList(ctx, tx, find)
	if err != nil {
		return nil, err
	}

	if len(list) == 0 {
		return nil, &errorutil.Error{Code: errorutil.NotFound, Err: fmt.Errorf("not found")}
	}

	shortcutRaw := list[0]
	s.shortcutCache.Store(shortcutRaw.ID, shortcutRaw)
	shortcut := shortcutRaw.toShortcut()
	return shortcut, nil
}

func (s *Store) DeleteShortcut(ctx context.Context, delete *api.ShortcutDelete) error {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	err = deleteShortcut(ctx, tx, delete)
	if err != nil {
		return err
	}

	if err := tx.Commit(); err != nil {
		return err
	}

	if delete.ID != nil {
		s.shortcutCache.Delete(*delete.ID)
	}

	return nil
}

func createShortcut(ctx context.Context, tx *sql.Tx, create *api.ShortcutCreate) (*shortcutRaw, error) {
	query := `
		INSERT INTO shortcut (
			creator_id,
			workspace_id,
			name, 
			link,
			description,
			visibility
		)
		VALUES (?, ?, ?, ?, ?, ?)
		RETURNING id, creator_id, created_ts, updated_ts, workspace_id, row_status, name, link, description, visibility
	`
	var shortcutRaw shortcutRaw
	if err := tx.QueryRowContext(ctx, query, create.CreatorID, create.WorkspaceID, create.Name, create.Link, create.Description, create.Visibility).Scan(
		&shortcutRaw.ID,
		&shortcutRaw.CreatorID,
		&shortcutRaw.CreatedTs,
		&shortcutRaw.UpdatedTs,
		&shortcutRaw.WorkspaceID,
		&shortcutRaw.RowStatus,
		&shortcutRaw.Name,
		&shortcutRaw.Link,
		&shortcutRaw.Description,
		&shortcutRaw.Visibility,
	); err != nil {
		return nil, err
	}

	return &shortcutRaw, nil
}

func patchShortcut(ctx context.Context, tx *sql.Tx, patch *api.ShortcutPatch) (*shortcutRaw, error) {
	set, args := []string{}, []any{}

	if v := patch.Name; v != nil {
		set, args = append(set, "name = ?"), append(args, *v)
	}
	if v := patch.Link; v != nil {
		set, args = append(set, "link = ?"), append(args, *v)
	}
	if v := patch.Description; v != nil {
		set, args = append(set, "description = ?"), append(args, *v)
	}
	if v := patch.Visibility; v != nil {
		set, args = append(set, "visibility = ?"), append(args, *v)
	}

	args = append(args, patch.ID)

	query := `
		UPDATE shortcut
		SET ` + strings.Join(set, ", ") + `
		WHERE id = ?
		RETURNING id, creator_id, created_ts, updated_ts, workspace_id, row_status, name, link, description, visibility
	`
	var shortcutRaw shortcutRaw
	if err := tx.QueryRowContext(ctx, query, args...).Scan(
		&shortcutRaw.ID,
		&shortcutRaw.CreatorID,
		&shortcutRaw.CreatedTs,
		&shortcutRaw.UpdatedTs,
		&shortcutRaw.WorkspaceID,
		&shortcutRaw.RowStatus,
		&shortcutRaw.Name,
		&shortcutRaw.Link,
		&shortcutRaw.Description,
		&shortcutRaw.Visibility,
	); err != nil {
		return nil, err
	}

	return &shortcutRaw, nil
}

func findShortcutList(ctx context.Context, tx *sql.Tx, find *api.ShortcutFind) ([]*shortcutRaw, error) {
	where, args := []string{"1 = 1"}, []any{}

	if v := find.ID; v != nil {
		where, args = append(where, "id = ?"), append(args, *v)
	}
	if v := find.CreatorID; v != nil {
		where, args = append(where, "creator_id = ?"), append(args, *v)
	}
	if v := find.WorkspaceID; v != nil {
		where, args = append(where, "workspace_id = ?"), append(args, *v)
	}
	if v := find.Name; v != nil {
		where, args = append(where, "name = ?"), append(args, *v)
	}
	if v := find.Link; v != nil {
		where, args = append(where, "link = ?"), append(args, *v)
	}
	if v := find.Description; v != nil {
		where, args = append(where, "description = ?"), append(args, *v)
	}
	if v := find.VisibilityList; len(v) != 0 {
		list := []string{}
		for _, visibility := range v {
			list = append(list, fmt.Sprintf("$%d", len(args)+1))
			args = append(args, visibility)
		}
		where = append(where, fmt.Sprintf("visibility in (%s)", strings.Join(list, ",")))
	}
	if v := find.MemberID; v != nil {
		where, args = append(where, "workspace_id IN (SELECT workspace_id FROM workspace_user WHERE user_id = ?)"), append(args, *v)
	}

	rows, err := tx.QueryContext(ctx, `
		SELECT
			id,
			creator_id,
			created_ts,
			updated_ts,
			workspace_id,
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

	shortcutRawList := make([]*shortcutRaw, 0)
	for rows.Next() {
		var shortcutRaw shortcutRaw
		if err := rows.Scan(
			&shortcutRaw.ID,
			&shortcutRaw.CreatorID,
			&shortcutRaw.CreatedTs,
			&shortcutRaw.UpdatedTs,
			&shortcutRaw.WorkspaceID,
			&shortcutRaw.RowStatus,
			&shortcutRaw.Name,
			&shortcutRaw.Link,
			&shortcutRaw.Description,
			&shortcutRaw.Visibility,
		); err != nil {
			return nil, err
		}

		shortcutRawList = append(shortcutRawList, &shortcutRaw)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return shortcutRawList, nil
}

func deleteShortcut(ctx context.Context, tx *sql.Tx, delete *api.ShortcutDelete) error {
	where, args := []string{"1 = 1"}, []any{}

	if v := delete.ID; v != nil {
		where, args = append(where, "id = ?"), append(args, *v)
	}
	if v := delete.CreatorID; v != nil {
		where, args = append(where, "creator_id = ?"), append(args, *v)
	}
	if v := delete.WorkspaceID; v != nil {
		where, args = append(where, "workspace_id = ?"), append(args, *v)
	}

	result, err := tx.ExecContext(ctx, `
		DELETE FROM shortcut WHERE `+strings.Join(where, " AND "), args...)
	if err != nil {
		return err
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		return &errorutil.Error{Code: errorutil.NotFound, Err: fmt.Errorf("not found")}
	}

	return nil
}
