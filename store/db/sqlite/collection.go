package sqlite

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"github.com/pkg/errors"

	"github.com/yourselfhosted/slash/internal/util"
	storepb "github.com/yourselfhosted/slash/proto/gen/store"
	"github.com/yourselfhosted/slash/store"
)

func (d *DB) CreateCollection(ctx context.Context, create *storepb.Collection) (*storepb.Collection, error) {
	set := []string{"creator_id", "name", "title", "description", "shortcut_ids", "visibility"}
	args := []any{create.CreatorId, create.Name, create.Title, create.Description, strings.Trim(strings.Join(strings.Fields(fmt.Sprint(create.ShortcutIds)), ","), "[]"), create.Visibility.String()}
	placeholder := []string{"?", "?", "?", "?", "?", "?"}

	stmt := `
		INSERT INTO collection (
			` + strings.Join(set, ", ") + `
		)
		VALUES (` + strings.Join(placeholder, ",") + `)
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
		set, args = append(set, "name = ?"), append(args, *update.Name)
	}
	if update.Title != nil {
		set, args = append(set, "title = ?"), append(args, *update.Title)
	}
	if update.Description != nil {
		set, args = append(set, "description = ?"), append(args, *update.Description)
	}
	if update.ShortcutIDs != nil {
		set, args = append(set, "shortcut_ids = ?"), append(args, strings.Trim(strings.Join(strings.Fields(fmt.Sprint(update.ShortcutIDs)), ","), "[]"))
	}
	if update.Visibility != nil {
		set, args = append(set, "visibility = ?"), append(args, update.Visibility.String())
	}
	if len(set) == 0 {
		return nil, errors.New("no update specified")
	}
	args = append(args, update.ID)

	stmt := `
		UPDATE collection
		SET
			` + strings.Join(set, ", ") + `
		WHERE
			id = ?
		RETURNING id, creator_id, created_ts, updated_ts, name, title, description, shortcut_ids, visibility
	`
	collection := &storepb.Collection{}
	var shortcutIDs, visibility string
	if err := d.db.QueryRowContext(ctx, stmt, args...).Scan(
		&collection.Id,
		&collection.CreatorId,
		&collection.CreatedTs,
		&collection.UpdatedTs,
		&collection.Name,
		&collection.Title,
		&collection.Description,
		&shortcutIDs,
		&visibility,
	); err != nil {
		return nil, err
	}

	collection.ShortcutIds = []int32{}
	if shortcutIDs != "" {
		for _, idStr := range strings.Split(shortcutIDs, ",") {
			shortcutID, err := util.ConvertStringToInt32(idStr)
			if err != nil {
				return nil, errors.Wrap(err, "failed to convert shortcut id")
			}
			collection.ShortcutIds = append(collection.ShortcutIds, shortcutID)
		}
	}
	collection.Visibility = store.ConvertVisibilityStringToStorepb(visibility)
	return collection, nil
}

func (d *DB) ListCollections(ctx context.Context, find *store.FindCollection) ([]*storepb.Collection, error) {
	where, args := []string{"1 = 1"}, []any{}
	if v := find.ID; v != nil {
		where, args = append(where, "id = ?"), append(args, *v)
	}
	if v := find.CreatorID; v != nil {
		where, args = append(where, "creator_id = ?"), append(args, *v)
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
		var shortcutIDs, visibility string
		if err := rows.Scan(
			&collection.Id,
			&collection.CreatorId,
			&collection.CreatedTs,
			&collection.UpdatedTs,
			&collection.Name,
			&collection.Title,
			&collection.Description,
			&shortcutIDs,
			&visibility,
		); err != nil {
			return nil, err
		}

		collection.ShortcutIds = []int32{}
		if shortcutIDs != "" {
			for _, idStr := range strings.Split(shortcutIDs, ",") {
				shortcutID, err := util.ConvertStringToInt32(idStr)
				if err != nil {
					return nil, errors.Wrap(err, "failed to convert shortcut id")
				}
				collection.ShortcutIds = append(collection.ShortcutIds, shortcutID)
			}
		}
		collection.Visibility = store.ConvertVisibilityStringToStorepb(visibility)
		list = append(list, collection)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}
	return list, nil
}

func (d *DB) DeleteCollection(ctx context.Context, delete *store.DeleteCollection) error {
	if _, err := d.db.ExecContext(ctx, `DELETE FROM collection WHERE id = ?`, delete.ID); err != nil {
		return err
	}

	return nil
}

func vacuumCollection(ctx context.Context, tx *sql.Tx) error {
	stmt := `DELETE FROM collection WHERE creator_id NOT IN (SELECT id FROM user)`
	_, err := tx.ExecContext(ctx, stmt)
	if err != nil {
		return err
	}
	return nil
}
