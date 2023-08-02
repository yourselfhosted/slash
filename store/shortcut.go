package store

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"

	storepb "github.com/boojack/slash/proto/gen/store"
	"google.golang.org/protobuf/encoding/protojson"
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

type OpenGraphMetadata struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Image       string `json:"image"`
}

type Shortcut struct {
	ID int32

	// Standard fields
	CreatorID int32
	CreatedTs int64
	UpdatedTs int64
	RowStatus RowStatus

	// Domain specific fields
	Name              string
	Link              string
	Title             string
	Description       string
	Visibility        Visibility
	Tag               string
	OpenGraphMetadata *OpenGraphMetadata
}

type UpdateShortcut struct {
	ID int32

	RowStatus         *RowStatus
	Name              *string
	Link              *string
	Title             *string
	Description       *string
	Visibility        *Visibility
	Tag               *string
	OpenGraphMetadata *OpenGraphMetadata
}

type FindShortcut struct {
	ID             *int32
	CreatorID      *int32
	RowStatus      *RowStatus
	Name           *string
	VisibilityList []Visibility
	Tag            *string
}

type DeleteShortcut struct {
	ID int32
}

func (s *Store) CreateShortcut(ctx context.Context, create *Shortcut) (*Shortcut, error) {
	set := []string{"creator_id", "name", "link", "title", "description", "visibility", "tag"}
	args := []any{create.CreatorID, create.Name, create.Link, create.Title, create.Description, create.Visibility, create.Tag}
	placeholder := []string{"?", "?", "?", "?", "?", "?", "?"}
	if create.OpenGraphMetadata != nil {
		set = append(set, "og_metadata")
		openGraphMetadataBytes, err := json.Marshal(create.OpenGraphMetadata)
		if err != nil {
			return nil, err
		}
		args = append(args, string(openGraphMetadataBytes))
		placeholder = append(placeholder, "?")
	}

	stmt := `
		INSERT INTO shortcut (
			` + strings.Join(set, ", ") + `
		)
		VALUES (` + strings.Join(placeholder, ",") + `)
		RETURNING id, created_ts, updated_ts, row_status
	`
	if err := s.db.QueryRowContext(ctx, stmt, args...).Scan(
		&create.ID,
		&create.CreatedTs,
		&create.UpdatedTs,
		&create.RowStatus,
	); err != nil {
		return nil, err
	}

	return create, nil
}

func (s *Store) CreateShortcutV1(ctx context.Context, create *storepb.Shortcut) (*storepb.Shortcut, error) {
	set := []string{"creator_id", "name", "link", "title", "description", "visibility", "tag"}
	args := []any{create.CreatorId, create.Name, create.Link, create.Title, create.Description, create.Visibility.String(), strings.Join(create.Tags, " ")}
	placeholder := []string{"?", "?", "?", "?", "?", "?", "?"}
	if create.OgMetadata != nil {
		set = append(set, "og_metadata")
		openGraphMetadataBytes, err := protojson.Marshal(create.OgMetadata)
		if err != nil {
			return nil, err
		}
		args = append(args, string(openGraphMetadataBytes))
		placeholder = append(placeholder, "?")
	}

	stmt := `
		INSERT INTO shortcut (
			` + strings.Join(set, ", ") + `
		)
		VALUES (` + strings.Join(placeholder, ",") + `)
		RETURNING id, created_ts, updated_ts, row_status
	`
	var rowStatus string
	if err := s.db.QueryRowContext(ctx, stmt, args...).Scan(
		&create.Id,
		&create.CreatedTs,
		&create.UpdatedTs,
		&rowStatus,
	); err != nil {
		return nil, err
	}
	create.RowStatus = convertStorepbRowStatus(rowStatus)

	return create, nil
}

func (s *Store) UpdateShortcut(ctx context.Context, update *UpdateShortcut) (*Shortcut, error) {
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
	if update.Title != nil {
		set, args = append(set, "title = ?"), append(args, *update.Title)
	}
	if update.Description != nil {
		set, args = append(set, "description = ?"), append(args, *update.Description)
	}
	if update.Visibility != nil {
		set, args = append(set, "visibility = ?"), append(args, update.Visibility.String())
	}
	if update.Tag != nil {
		set, args = append(set, "tag = ?"), append(args, *update.Tag)
	}
	if update.OpenGraphMetadata != nil {
		openGraphMetadataBytes, err := json.Marshal(update.OpenGraphMetadata)
		if err != nil {
			return nil, err
		}
		set, args = append(set, "og_metadata = ?"), append(args, string(openGraphMetadataBytes))
	}
	if len(set) == 0 {
		return nil, fmt.Errorf("no update specified")
	}
	args = append(args, update.ID)

	stmt := `
		UPDATE shortcut
		SET
			` + strings.Join(set, ", ") + `
		WHERE
			id = ?
		RETURNING id, creator_id, created_ts, updated_ts, row_status, name, link, title, description, visibility, tag, og_metadata
	`
	shortcut := &Shortcut{}
	openGraphMetadataString := ""
	if err := s.db.QueryRowContext(ctx, stmt, args...).Scan(
		&shortcut.ID,
		&shortcut.CreatorID,
		&shortcut.CreatedTs,
		&shortcut.UpdatedTs,
		&shortcut.RowStatus,
		&shortcut.Name,
		&shortcut.Link,
		&shortcut.Title,
		&shortcut.Description,
		&shortcut.Visibility,
		&shortcut.Tag,
		&openGraphMetadataString,
	); err != nil {
		return nil, err
	}
	if openGraphMetadataString != "" {
		shortcut.OpenGraphMetadata = &OpenGraphMetadata{}
		if err := json.Unmarshal([]byte(openGraphMetadataString), shortcut.OpenGraphMetadata); err != nil {
			return nil, err
		}
	}

	s.shortcutCache.Store(shortcut.ID, shortcut)
	return shortcut, nil
}

func (s *Store) ListShortcuts(ctx context.Context, find *FindShortcut) ([]*Shortcut, error) {
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
	if v := find.Tag; v != nil {
		where, args = append(where, "tag LIKE ?"), append(args, "%"+*v+"%")
	}

	rows, err := s.db.QueryContext(ctx, `
		SELECT
			id,
			creator_id,
			created_ts,
			updated_ts,
			row_status,
			name,
			link,
			title,
			description,
			visibility,
			tag,
			og_metadata
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
		openGraphMetadataString := ""
		if err := rows.Scan(
			&shortcut.ID,
			&shortcut.CreatorID,
			&shortcut.CreatedTs,
			&shortcut.UpdatedTs,
			&shortcut.RowStatus,
			&shortcut.Name,
			&shortcut.Link,
			&shortcut.Title,
			&shortcut.Description,
			&shortcut.Visibility,
			&shortcut.Tag,
			&openGraphMetadataString,
		); err != nil {
			return nil, err
		}
		if openGraphMetadataString != "" {
			shortcut.OpenGraphMetadata = &OpenGraphMetadata{}
			if err := json.Unmarshal([]byte(openGraphMetadataString), shortcut.OpenGraphMetadata); err != nil {
				return nil, err
			}
		}
		list = append(list, shortcut)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	for _, shortcut := range list {
		s.shortcutCache.Store(shortcut.ID, shortcut)
	}
	return list, nil
}

func (s *Store) ListShortcutsV1(ctx context.Context, find *FindShortcut) ([]*storepb.Shortcut, error) {
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
	if v := find.Tag; v != nil {
		where, args = append(where, "tag LIKE ?"), append(args, "%"+*v+"%")
	}

	rows, err := s.db.QueryContext(ctx, `
		SELECT
			id,
			creator_id,
			created_ts,
			updated_ts,
			row_status,
			name,
			link,
			title,
			description,
			visibility,
			tag,
			og_metadata
		FROM shortcut
		WHERE `+strings.Join(where, " AND ")+`
		ORDER BY created_ts DESC`,
		args...,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := make([]*storepb.Shortcut, 0)
	for rows.Next() {
		shortcut := &storepb.Shortcut{}
		var rowStatus, visibility, tags, openGraphMetadataString string
		if err := rows.Scan(
			&shortcut.Id,
			&shortcut.CreatorId,
			&shortcut.CreatedTs,
			&shortcut.UpdatedTs,
			&rowStatus,
			&shortcut.Name,
			&shortcut.Link,
			&shortcut.Title,
			&shortcut.Description,
			&visibility,
			&tags,
			&openGraphMetadataString,
		); err != nil {
			return nil, err
		}
		shortcut.RowStatus = convertStorepbRowStatus(rowStatus)
		shortcut.Visibility = storepb.Visibility(storepb.Visibility_value[visibility])
		shortcut.Tags = strings.Split(tags, " ")
		var ogMetadata storepb.OpenGraphMetadata
		if err := protojson.Unmarshal([]byte(openGraphMetadataString), &ogMetadata); err != nil {
			return nil, err
		}
		shortcut.OgMetadata = &ogMetadata
		list = append(list, shortcut)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}
	return list, nil
}

func (s *Store) GetShortcut(ctx context.Context, find *FindShortcut) (*Shortcut, error) {
	if find.ID != nil {
		if cache, ok := s.shortcutCache.Load(*find.ID); ok {
			return cache.(*Shortcut), nil
		}
	}

	shortcuts, err := s.ListShortcuts(ctx, find)
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

func (s *Store) GetShortcutV1(ctx context.Context, find *FindShortcut) (*storepb.Shortcut, error) {
	shortcuts, err := s.ListShortcutsV1(ctx, find)
	if err != nil {
		return nil, err
	}

	if len(shortcuts) == 0 {
		return nil, nil
	}

	shortcut := shortcuts[0]
	return shortcut, nil
}

func (s *Store) DeleteShortcut(ctx context.Context, delete *DeleteShortcut) error {
	if _, err := s.db.ExecContext(ctx, `DELETE FROM shortcut WHERE id = ?`, delete.ID); err != nil {
		return err
	}

	s.shortcutCache.Delete(delete.ID)

	return nil
}

func vacuumShortcut(ctx context.Context, tx *sql.Tx) error {
	stmt := `
	DELETE FROM 
		shortcut 
	WHERE 
		creator_id NOT IN (
			SELECT 
				id 
			FROM 
				user
		)`
	_, err := tx.ExecContext(ctx, stmt)
	if err != nil {
		return err
	}

	return nil
}
