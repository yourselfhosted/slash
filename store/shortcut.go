package store

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"github.com/boojack/shortify/api"
	"github.com/boojack/shortify/common"
)

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

func (s *Store) ComposeShortcut(ctx context.Context, shortcut *api.Shortcut) error {
	user, err := s.FindUser(ctx, &api.UserFind{
		ID: &shortcut.CreatorID,
	})
	if err != nil {
		return err
	}
	user.OpenID = ""
	user.UserSettingList = nil
	shortcut.Creator = user

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
		return nil, &common.Error{Code: common.NotFound, Err: fmt.Errorf("not found")}
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
	set, args := []string{}, []interface{}{}

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
	where, args := []string{"1 = 1"}, []interface{}{}

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
	where, args := []string{"1 = 1"}, []interface{}{}

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
		return &common.Error{Code: common.NotFound, Err: fmt.Errorf("shortcut ID not found: %d", delete.ID)}
	}

	return nil
}
