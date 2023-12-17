package sqlite

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"github.com/pkg/errors"

	storepb "github.com/yourselfhosted/slash/proto/gen/store"
	"github.com/yourselfhosted/slash/store"
)

func (d *DB) CreateMemo(ctx context.Context, create *storepb.Memo) (*storepb.Memo, error) {
	set := []string{"creator_id", "name", "title", "content", "visibility", "tag"}
	args := []any{create.CreatorId, create.Name, create.Title, create.Content, create.Visibility.String(), strings.Join(create.Tags, " ")}

	stmt := `
		INSERT INTO memo (
			` + strings.Join(set, ", ") + `
		)
		VALUES (` + placeholders(len(args)) + `)
		RETURNING id, created_ts, updated_ts, row_status
	`

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
	memo := create
	return memo, nil
}

func (d *DB) UpdateMemo(ctx context.Context, update *store.UpdateMemo) (*storepb.Memo, error) {
	set, args := []string{}, []any{}
	if update.RowStatus != nil {
		set, args = append(set, "row_status = ?"), append(args, update.RowStatus.String())
	}
	if update.Name != nil {
		set, args = append(set, "name = ?"), append(args, *update.Name)
	}
	if update.Title != nil {
		set, args = append(set, "title = ?"), append(args, *update.Title)
	}
	if update.Content != nil {
		set, args = append(set, "content = ?"), append(args, *update.Content)
	}
	if update.Visibility != nil {
		set, args = append(set, "visibility = ?"), append(args, update.Visibility.String())
	}
	if update.Tag != nil {
		set, args = append(set, "tag = ?"), append(args, *update.Tag)
	}
	if len(set) == 0 {
		return nil, errors.New("no update specified")
	}
	args = append(args, update.ID)

	stmt := `
		UPDATE memo
		SET
			` + strings.Join(set, ", ") + `
		WHERE
			id = ?
		RETURNING id, creator_id, created_ts, updated_ts, row_status, name, title, content, visibility, tag
	`
	memo := &storepb.Memo{}
	var rowStatus, visibility, tags string
	if err := d.db.QueryRowContext(ctx, stmt, args...).Scan(
		&memo.Id,
		&memo.CreatorId,
		&memo.CreatedTs,
		&memo.UpdatedTs,
		&rowStatus,
		&memo.Name,
		&memo.Title,
		&memo.Content,
		&visibility,
		&tags,
	); err != nil {
		return nil, err
	}
	memo.RowStatus = store.ConvertRowStatusStringToStorepb(rowStatus)
	memo.Visibility = convertVisibilityStringToStorepb(visibility)
	memo.Tags = filterTags(strings.Split(tags, " "))
	return memo, nil
}

func (d *DB) ListMemos(ctx context.Context, find *store.FindMemo) ([]*storepb.Memo, error) {
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

	rows, err := d.db.QueryContext(ctx, `
		SELECT
			id,
			creator_id,
			created_ts,
			updated_ts,
			row_status,
			name,
			title,
			content,
			visibility,
			tag
		FROM memo
		WHERE `+strings.Join(where, " AND ")+`
		ORDER BY created_ts DESC`,
		args...,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := make([]*storepb.Memo, 0)
	for rows.Next() {
		memo := &storepb.Memo{}
		var rowStatus, visibility, tags string
		if err := rows.Scan(
			&memo.Id,
			&memo.CreatorId,
			&memo.CreatedTs,
			&memo.UpdatedTs,
			&rowStatus,
			&memo.Name,
			&memo.Title,
			&memo.Content,
			&visibility,
			&tags,
		); err != nil {
			return nil, err
		}
		memo.RowStatus = store.ConvertRowStatusStringToStorepb(rowStatus)
		memo.Visibility = storepb.Visibility(storepb.Visibility_value[visibility])
		memo.Tags = filterTags(strings.Split(tags, " "))
		list = append(list, memo)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}
	return list, nil
}

func (d *DB) DeleteMemo(ctx context.Context, delete *store.DeleteMemo) error {
	if _, err := d.db.ExecContext(ctx, `DELETE FROM memo WHERE id = ?`, delete.ID); err != nil {
		return err
	}
	return nil
}

func vacuumMemo(ctx context.Context, tx *sql.Tx) error {
	stmt := `DELETE FROM memo WHERE creator_id NOT IN (SELECT id FROM user)`
	_, err := tx.ExecContext(ctx, stmt)
	if err != nil {
		return err
	}

	return nil
}

func placeholders(n int) string {
	return strings.Repeat("?,", n-1) + "?"
}
