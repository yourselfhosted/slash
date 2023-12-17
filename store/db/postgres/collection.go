package postgres

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"github.com/lib/pq"
	"github.com/pkg/errors"

	storepb "github.com/yourselfhosted/slash/proto/gen/store"
	"github.com/yourselfhosted/slash/store"
)

func (d *DB) CreateCollection(ctx context.Context, create *storepb.Collection) (*storepb.Collection, error) {
	set := []string{"creator_id", "name", "title", "description", "shortcut_ids", "visibility"}
	args := []any{create.CreatorId, create.Name, create.Title, create.Description, pq.Array(create.ShortcutIds), create.Visibility.String()}

	stmt := `
		INSERT INTO collection (` + strings.Join(set, ", ") + `)
		VALUES (` + placeholders(len(args)) + `)
		RETURNING id, created_ts, updated_ts
	`
	if err := d.db.QueryRowContext(ctx, stmt, args...).Scan(
		&create.Id,
		&create.CreatedTs,
		&create.UpdatedTs,
	); err != nil {
		return nil, err
	}
	collection := create
	return collection, nil
}

func (d *DB) UpdateCollection(ctx context.Context, update *store.UpdateCollection) (*storepb.Collection, error) {
	set, args := []string{}, []any{}
	if update.Name != nil {
		set, args = append(set, "name = "+placeholder(len(args)+1)), append(args, *update.Name)
	}
	if update.Title != nil {
		set, args = append(set, "title = "+placeholder(len(args)+1)), append(args, *update.Title)
	}
	if update.Description != nil {
		set, args = append(set, "description = "+placeholder(len(args)+1)), append(args, *update.Description)
	}
	if update.ShortcutIDs != nil {
		set, args = append(set, "shortcut_ids = "+placeholder(len(args)+1)), append(args, pq.Array(update.ShortcutIDs))
	}
	if update.Visibility != nil {
		set, args = append(set, "visibility = "+placeholder(len(args)+1)), append(args, update.Visibility.String())
	}
	if len(set) == 0 {
		return nil, errors.New("no update specified")
	}

	stmt := `
		UPDATE collection
		SET ` + strings.Join(set, ", ") + `
		WHERE id = ` + placeholder(len(args)+1) + `
		RETURNING id, creator_id, created_ts, updated_ts, name, title, description, shortcut_ids, visibility
	`
	args = append(args, update.ID)
	collection := &storepb.Collection{}
	var shortcutIDs []sql.NullInt32
	var visibility string
	if err := d.db.QueryRowContext(ctx, stmt, args...).Scan(
		&collection.Id,
		&collection.CreatorId,
		&collection.CreatedTs,
		&collection.UpdatedTs,
		&collection.Name,
		&collection.Title,
		&collection.Description,
		pq.Array(&shortcutIDs),
		&visibility,
	); err != nil {
		return nil, err
	}

	collection.ShortcutIds = []int32{}
	for _, id := range shortcutIDs {
		if id.Valid {
			collection.ShortcutIds = append(collection.ShortcutIds, id.Int32)
		}
	}
	collection.Visibility = convertVisibilityStringToStorepb(visibility)
	return collection, nil
}

func (d *DB) ListCollections(ctx context.Context, find *store.FindCollection) ([]*storepb.Collection, error) {
	where, args := []string{"1 = 1"}, []any{}
	if v := find.ID; v != nil {
		where, args = append(where, "id = "+placeholder(len(args)+1)), append(args, *v)
	}
	if v := find.CreatorID; v != nil {
		where, args = append(where, "creator_id = "+placeholder(len(args)+1)), append(args, *v)
	}
	if v := find.Name; v != nil {
		where, args = append(where, "name = "+placeholder(len(args)+1)), append(args, *v)
	}
	if v := find.VisibilityList; len(v) != 0 {
		list := []string{}
		for _, visibility := range v {
			list, args = append(list, placeholder(len(args)+1)), append(args, visibility)
		}
		where = append(where, fmt.Sprintf("visibility IN (%s)", strings.Join(list, ",")))
	}

	rows, err := d.db.QueryContext(ctx, `
		SELECT
			id,
			creator_id,
			created_ts,
			updated_ts,
			name,
			title,
			description,
			shortcut_ids,
			visibility
		FROM collection
		WHERE `+strings.Join(where, " AND ")+`
		ORDER BY created_ts DESC`,
		args...,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := make([]*storepb.Collection, 0)
	for rows.Next() {
		collection := &storepb.Collection{}
		var shortcutIDs []sql.NullInt32
		var visibility string
		if err := rows.Scan(
			&collection.Id,
			&collection.CreatorId,
			&collection.CreatedTs,
			&collection.UpdatedTs,
			&collection.Name,
			&collection.Title,
			&collection.Description,
			pq.Array(&shortcutIDs),
			&visibility,
		); err != nil {
			return nil, err
		}

		collection.ShortcutIds = []int32{}
		for _, id := range shortcutIDs {
			if id.Valid {
				collection.ShortcutIds = append(collection.ShortcutIds, id.Int32)
			}
		}
		collection.Visibility = storepb.Visibility(storepb.Visibility_value[visibility])
		list = append(list, collection)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}
	return list, nil
}

func (d *DB) DeleteCollection(ctx context.Context, delete *store.DeleteCollection) error {
	if _, err := d.db.ExecContext(ctx, `DELETE FROM collection WHERE id = $1`, delete.ID); err != nil {
		return err
	}

	return nil
}
