package store

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"github.com/pkg/errors"

	storepb "github.com/yourselfhosted/slash/proto/gen/store"
)

type UpdateMemo struct {
	ID         int32
	RowStatus  *RowStatus
	Name       *string
	Title      *string
	Content    *string
	Visibility *Visibility
	Tag        *string
}

type FindMemo struct {
	ID             *int32
	CreatorID      *int32
	RowStatus      *RowStatus
	Name           *string
	VisibilityList []Visibility
	Tag            *string
}

type DeleteMemo struct {
	ID int32
}

func (s *Store) CreateMemo(ctx context.Context, create *storepb.Memo) (*storepb.Memo, error) {
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
	if err := s.db.QueryRowContext(ctx, stmt, args...).Scan(
		&create.Id,
		&create.CreatedTs,
		&create.UpdatedTs,
		&rowStatus,
	); err != nil {
		return nil, err
	}
	create.RowStatus = convertRowStatusStringToStorepb(rowStatus)
	memo := create
	return memo, nil
}

func (s *Store) UpdateMemo(ctx context.Context, update *UpdateMemo) (*storepb.Memo, error) {
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
	if err := s.db.QueryRowContext(ctx, stmt, args...).Scan(
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
	memo.RowStatus = convertRowStatusStringToStorepb(rowStatus)
	memo.Visibility = convertVisibilityStringToStorepb(visibility)
	memo.Tags = filterTags(strings.Split(tags, " "))
	return memo, nil
}

func (s *Store) ListMemos(ctx context.Context, find *FindMemo) ([]*storepb.Memo, error) {
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
		memo.RowStatus = convertRowStatusStringToStorepb(rowStatus)
		memo.Visibility = storepb.Visibility(storepb.Visibility_value[visibility])
		memo.Tags = filterTags(strings.Split(tags, " "))
		list = append(list, memo)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}
	return list, nil
}

func (s *Store) GetMemo(ctx context.Context, find *FindMemo) (*storepb.Memo, error) {
	memos, err := s.ListMemos(ctx, find)
	if err != nil {
		return nil, err
	}

	if len(memos) == 0 {
		return nil, nil
	}

	memo := memos[0]
	return memo, nil
}

func (s *Store) DeleteMemo(ctx context.Context, delete *DeleteMemo) error {
	if _, err := s.db.ExecContext(ctx, `DELETE FROM memo WHERE id = ?`, delete.ID); err != nil {
		return err
	}
	return nil
}

func vacuumMemo(ctx context.Context, tx *sql.Tx) error {
	stmt := `
	DELETE FROM 
		memo 
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

func placeholders(n int) string {
	return strings.Repeat("?,", n-1) + "?"
}
