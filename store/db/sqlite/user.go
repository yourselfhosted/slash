package sqlite

import (
	"context"
	"errors"
	"strings"

	"github.com/yourselfhosted/slash/store"
)

func (d *DB) CreateUser(ctx context.Context, create *store.User) (*store.User, error) {
	stmt := `
		INSERT INTO user (
			email,
			nickname,
			password_hash,
			role
		)
		VALUES (?, ?, ?, ?)
		RETURNING id, created_ts, updated_ts, row_status
	`
	if err := d.db.QueryRowContext(ctx, stmt,
		create.Email,
		create.Nickname,
		create.PasswordHash,
		create.Role,
	).Scan(
		&create.ID,
		&create.CreatedTs,
		&create.UpdatedTs,
		&create.RowStatus,
	); err != nil {
		return nil, err
	}

	user := create
	return user, nil
}

func (d *DB) UpdateUser(ctx context.Context, update *store.UpdateUser) (*store.User, error) {
	set, args := []string{}, []any{}
	if v := update.RowStatus; v != nil {
		set, args = append(set, "row_status = ?"), append(args, *v)
	}
	if v := update.Email; v != nil {
		set, args = append(set, "email = ?"), append(args, *v)
	}
	if v := update.Nickname; v != nil {
		set, args = append(set, "nickname = ?"), append(args, *v)
	}
	if v := update.PasswordHash; v != nil {
		set, args = append(set, "password_hash = ?"), append(args, *v)
	}
	if v := update.Role; v != nil {
		set, args = append(set, "role = ?"), append(args, *v)
	}

	if len(set) == 0 {
		return nil, errors.New("no fields to update")
	}

	stmt := `
		UPDATE user
		SET ` + strings.Join(set, ", ") + `
		WHERE id = ?
		RETURNING id, created_ts, updated_ts, row_status, email, nickname, password_hash, role
	`
	args = append(args, update.ID)
	user := &store.User{}
	if err := d.db.QueryRowContext(ctx, stmt, args...).Scan(
		&user.ID,
		&user.CreatedTs,
		&user.UpdatedTs,
		&user.RowStatus,
		&user.Email,
		&user.Nickname,
		&user.PasswordHash,
		&user.Role,
	); err != nil {
		return nil, err
	}

	return user, nil
}

func (d *DB) ListUsers(ctx context.Context, find *store.FindUser) ([]*store.User, error) {
	where, args := []string{"1 = 1"}, []any{}

	if v := find.ID; v != nil {
		where, args = append(where, "id = ?"), append(args, *v)
	}
	if v := find.RowStatus; v != nil {
		where, args = append(where, "row_status = ?"), append(args, v.String())
	}
	if v := find.Email; v != nil {
		where, args = append(where, "email = ?"), append(args, *v)
	}
	if v := find.Nickname; v != nil {
		where, args = append(where, "nickname = ?"), append(args, *v)
	}
	if v := find.Role; v != nil {
		where, args = append(where, "role = ?"), append(args, *v)
	}

	query := `
		SELECT 
			id,
			created_ts,
			updated_ts,
			row_status,
			email,
			nickname,
			password_hash,
			role
		FROM user
		WHERE ` + strings.Join(where, " AND ") + `
		ORDER BY updated_ts DESC, created_ts DESC
	`
	rows, err := d.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := make([]*store.User, 0)
	for rows.Next() {
		user := &store.User{}
		if err := rows.Scan(
			&user.ID,
			&user.CreatedTs,
			&user.UpdatedTs,
			&user.RowStatus,
			&user.Email,
			&user.Nickname,
			&user.PasswordHash,
			&user.Role,
		); err != nil {
			return nil, err
		}
		list = append(list, user)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return list, nil
}

func (d *DB) DeleteUser(ctx context.Context, delete *store.DeleteUser) error {
	tx, err := d.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if _, err := tx.ExecContext(ctx, `
		DELETE FROM user WHERE id = ?
	`, delete.ID); err != nil {
		return err
	}

	if err := vacuumUserSetting(ctx, tx); err != nil {
		return err
	}
	if err := vacuumShortcut(ctx, tx); err != nil {
		return err
	}
	if err := vacuumCollection(ctx, tx); err != nil {
		return err
	}

	return tx.Commit()
}
