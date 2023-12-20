package sqlite

import (
	"context"
	"strings"

	"github.com/yourselfhosted/slash/store"
)

func (d *DB) CreateActivity(ctx context.Context, create *store.Activity) (*store.Activity, error) {
	stmt := `
		INSERT INTO activity (
			creator_id,
			type,
			level,
			payload
		)
		VALUES (?, ?, ?, ?)
		RETURNING id, created_ts
	`
	if err := d.db.QueryRowContext(ctx, stmt,
		create.CreatorID,
		create.Type.String(),
		create.Level.String(),
		create.Payload,
	).Scan(
		&create.ID,
		&create.CreatedTs,
	); err != nil {
		return nil, err
	}

	activity := create
	return activity, nil
}

func (d *DB) ListActivities(ctx context.Context, find *store.FindActivity) ([]*store.Activity, error) {
	where, args := []string{"1 = 1"}, []any{}
	if find.Type != "" {
		where, args = append(where, "type = ?"), append(args, find.Type.String())
	}
	if find.Level != "" {
		where, args = append(where, "level = ?"), append(args, find.Level.String())
	}
	if find.PayloadShortcutID != nil {
		where, args = append(where, "json_extract(payload, '$.shortcutId') = ?"), append(args, *find.PayloadShortcutID)
	}

	query := `
		SELECT
			id,
			creator_id,
			created_ts,
			type,
			level,
			payload
		FROM activity
		WHERE ` + strings.Join(where, " AND ")
	rows, err := d.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := []*store.Activity{}
	for rows.Next() {
		activity := &store.Activity{}
		if err := rows.Scan(
			&activity.ID,
			&activity.CreatorID,
			&activity.CreatedTs,
			&activity.Type,
			&activity.Level,
			&activity.Payload,
		); err != nil {
			return nil, err
		}

		list = append(list, activity)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return list, nil
}
