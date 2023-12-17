package postgres

import (
	"context"
	"fmt"
	"strings"

	"github.com/pkg/errors"
	"google.golang.org/protobuf/encoding/protojson"

	storepb "github.com/yourselfhosted/slash/proto/gen/store"
	"github.com/yourselfhosted/slash/store"
)

func (d *DB) CreateShortcut(ctx context.Context, create *storepb.Shortcut) (*storepb.Shortcut, error) {
	set := []string{"creator_id", "name", "link", "title", "description", "visibility", "tag"}
	args := []any{create.CreatorId, create.Name, create.Link, create.Title, create.Description, create.Visibility.String(), strings.Join(create.Tags, " ")}
	if create.OgMetadata != nil {
		set = append(set, "og_metadata")
		openGraphMetadataBytes, err := protojson.Marshal(create.OgMetadata)
		if err != nil {
			return nil, err
		}
		args = append(args, string(openGraphMetadataBytes))
	}

	stmt := fmt.Sprintf(`
		INSERT INTO shortcut (%s)
		VALUES (%s)
		RETURNING id, created_ts, updated_ts, row_status
	`, strings.Join(set, ","), placeholders(len(args)))

	var rowStatus string
	if err := d.db.QueryRowContext(ctx, stmt, args...).Scan(
		&create.Id,
		&create.CreatedTs,
		&create.UpdatedTs,
		&rowStatus,
	); err != nil {
		return nil, err
	}
	create.RowStatus = store.ConvertRowStatusStringToStorepb(rowStatus)
	shortcut := create
	return shortcut, nil
}

func (d *DB) UpdateShortcut(ctx context.Context, update *store.UpdateShortcut) (*storepb.Shortcut, error) {
	set, args := []string{}, []any{}
	if update.RowStatus != nil {
		set, args = append(set, fmt.Sprintf("row_status = $%d", len(args)+1)), append(args, update.RowStatus.String())
	}
	if update.Name != nil {
		set, args = append(set, fmt.Sprintf("name = $%d", len(args)+1)), append(args, *update.Name)
	}
	if update.Link != nil {
		set, args = append(set, fmt.Sprintf("link = $%d", len(args)+1)), append(args, *update.Link)
	}
	if update.Title != nil {
		set, args = append(set, fmt.Sprintf("title = $%d", len(args)+1)), append(args, *update.Title)
	}
	if update.Description != nil {
		set, args = append(set, fmt.Sprintf("description = $%d", len(args)+1)), append(args, *update.Description)
	}
	if update.Visibility != nil {
		set, args = append(set, fmt.Sprintf("visibility = $%d", len(args)+1)), append(args, update.Visibility.String())
	}
	if update.Tag != nil {
		set, args = append(set, fmt.Sprintf("tag = $%d", len(args)+1)), append(args, *update.Tag)
	}
	if update.OpenGraphMetadata != nil {
		openGraphMetadataBytes, err := protojson.Marshal(update.OpenGraphMetadata)
		if err != nil {
			return nil, errors.Wrap(err, "Failed to marshal activity payload")
		}
		set, args = append(set, fmt.Sprintf("og_metadata = $%d", len(args)+1)), append(args, string(openGraphMetadataBytes))
	}
	if len(set) == 0 {
		return nil, errors.New("no update specified")
	}
	args = append(args, update.ID)

	stmt := fmt.Sprintf(`
		UPDATE shortcut
		SET %s
		WHERE id = $%d
		RETURNING id, creator_id, created_ts, updated_ts, row_status, name, link, title, description, visibility, tag, og_metadata
	`, strings.Join(set, ","), len(args))

	shortcut := &storepb.Shortcut{}
	var rowStatus, visibility, tags, openGraphMetadataString string
	if err := d.db.QueryRowContext(ctx, stmt, args...).Scan(
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
	shortcut.RowStatus = store.ConvertRowStatusStringToStorepb(rowStatus)
	shortcut.Visibility = convertVisibilityStringToStorepb(visibility)
	shortcut.Tags = filterTags(strings.Split(tags, " "))
	var ogMetadata storepb.OpenGraphMetadata
	if err := protojson.Unmarshal([]byte(openGraphMetadataString), &ogMetadata); err != nil {
		return nil, err
	}
	shortcut.OgMetadata = &ogMetadata
	return shortcut, nil
}

func (d *DB) ListShortcuts(ctx context.Context, find *store.FindShortcut) ([]*storepb.Shortcut, error) {
	where, args := []string{"1 = 1"}, []any{}
	if v := find.ID; v != nil {
		where, args = append(where, fmt.Sprintf("id = $%d", len(args)+1)), append(args, *v)
	}
	if v := find.CreatorID; v != nil {
		where, args = append(where, fmt.Sprintf("creator_id = $%d", len(args)+1)), append(args, *v)
	}
	if v := find.RowStatus; v != nil {
		where, args = append(where, fmt.Sprintf("row_status = $%d", len(args)+1)), append(args, *v)
	}
	if v := find.Name; v != nil {
		where, args = append(where, fmt.Sprintf("name = $%d", len(args)+1)), append(args, *v)
	}
	if v := find.VisibilityList; len(v) != 0 {
		list := []string{}
		for _, visibility := range v {
			list = append(list, fmt.Sprintf("$%d", len(args)+1))
			args = append(args, visibility)
		}
		where = append(where, fmt.Sprintf("visibility IN (%s)", strings.Join(list, ",")))
	}
	if v := find.Tag; v != nil {
		where, args = append(where, fmt.Sprintf("tag LIKE $%d", len(args)+1)), append(args, "%"+*v+"%")
	}

	rows, err := d.db.QueryContext(ctx, fmt.Sprintf(`
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
		WHERE %s
		ORDER BY created_ts DESC
	`, strings.Join(where, " AND ")), args...)
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
		shortcut.RowStatus = store.ConvertRowStatusStringToStorepb(rowStatus)
		shortcut.Visibility = storepb.Visibility(storepb.Visibility_value[visibility])
		shortcut.Tags = filterTags(strings.Split(tags, " "))
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

func (d *DB) DeleteShortcut(ctx context.Context, delete *store.DeleteShortcut) error {
	_, err := d.db.ExecContext(ctx, "DELETE FROM shortcut WHERE id = $1", delete.ID)
	return err
}

func filterTags(tags []string) []string {
	result := []string{}
	for _, tag := range tags {
		if tag != "" {
			result = append(result, tag)
		}
	}
	return result
}

func convertVisibilityStringToStorepb(visibility string) storepb.Visibility {
	return storepb.Visibility(storepb.Visibility_value[visibility])
}
