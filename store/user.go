package store

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"github.com/boojack/corgi/api"
	"github.com/boojack/corgi/common"
)

// userRaw is the store model for an User.
// Fields have exactly the same meanings as User.
type userRaw struct {
	ID int

	// Standard fields
	CreatedTs int64
	UpdatedTs int64
	RowStatus api.RowStatus

	// Domain specific fields
	Email        string
	DisplayName  string
	PasswordHash string
	OpenID       string
}

func (raw *userRaw) toUser() *api.User {
	return &api.User{
		ID: raw.ID,

		CreatedTs: raw.CreatedTs,
		UpdatedTs: raw.UpdatedTs,
		RowStatus: raw.RowStatus,

		Email:        raw.Email,
		DisplayName:  raw.DisplayName,
		PasswordHash: raw.PasswordHash,
		OpenID:       raw.OpenID,
	}
}

func (s *Store) CreateUser(ctx context.Context, create *api.UserCreate) (*api.User, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	userRaw, err := createUser(ctx, tx, create)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	s.userCache.Store(userRaw.ID, userRaw)
	user := userRaw.toUser()
	return user, nil
}

func (s *Store) PatchUser(ctx context.Context, patch *api.UserPatch) (*api.User, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	userRaw, err := patchUser(ctx, tx, patch)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	s.userCache.Store(userRaw.ID, userRaw)
	user := userRaw.toUser()
	return user, nil
}

func (s *Store) FindUserList(ctx context.Context, find *api.UserFind) ([]*api.User, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	userRawList, err := findUserList(ctx, tx, find)
	if err != nil {
		return nil, err
	}

	list := []*api.User{}
	for _, userRaw := range userRawList {
		s.userCache.Store(userRaw.ID, userRaw)
		list = append(list, userRaw.toUser())
	}

	return list, nil
}

func (s *Store) FindUser(ctx context.Context, find *api.UserFind) (*api.User, error) {
	if find.ID != nil {
		if cache, ok := s.userCache.Load(*find.ID); ok {
			return cache.(*userRaw).toUser(), nil
		}
	}

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	list, err := findUserList(ctx, tx, find)
	if err != nil {
		return nil, err
	}

	if len(list) == 0 {
		return nil, &common.Error{Code: common.NotFound, Err: fmt.Errorf("not found user with filter %+v", find)}
	} else if len(list) > 1 {
		return nil, &common.Error{Code: common.Conflict, Err: fmt.Errorf("found %d users with filter %+v, expect 1", len(list), find)}
	}

	userRaw := list[0]
	s.userCache.Store(userRaw.ID, userRaw)
	user := userRaw.toUser()
	return user, nil
}

func (s *Store) DeleteUser(ctx context.Context, delete *api.UserDelete) error {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	err = deleteUser(ctx, tx, delete)
	if err != nil {
		return err
	}

	if err := tx.Commit(); err != nil {
		return err
	}

	s.userCache.Delete(delete.ID)
	return nil
}

func createUser(ctx context.Context, tx *sql.Tx, create *api.UserCreate) (*userRaw, error) {
	query := `
		INSERT INTO user (
			email,
			display_name,
			password_hash,
			open_id
		)
		VALUES (?, ?, ?, ?)
		RETURNING id, created_ts, updated_ts, row_status, email, display_name, password_hash, open_id
	`
	var userRaw userRaw
	if err := tx.QueryRowContext(ctx, query,
		create.Email,
		create.DisplayName,
		create.PasswordHash,
		create.OpenID,
	).Scan(
		&userRaw.ID,
		&userRaw.CreatedTs,
		&userRaw.UpdatedTs,
		&userRaw.RowStatus,
		&userRaw.Email,
		&userRaw.DisplayName,
		&userRaw.PasswordHash,
		&userRaw.OpenID,
	); err != nil {
		return nil, err
	}

	return &userRaw, nil
}

func patchUser(ctx context.Context, tx *sql.Tx, patch *api.UserPatch) (*userRaw, error) {
	set, args := []string{}, []interface{}{}

	if v := patch.RowStatus; v != nil {
		set, args = append(set, "row_status = ?"), append(args, *v)
	}
	if v := patch.Email; v != nil {
		set, args = append(set, "email = ?"), append(args, *v)
	}
	if v := patch.DisplayName; v != nil {
		set, args = append(set, "display_name = ?"), append(args, *v)
	}
	if v := patch.PasswordHash; v != nil {
		set, args = append(set, "password_hash = ?"), append(args, *v)
	}
	if v := patch.OpenID; v != nil {
		set, args = append(set, "open_id = ?"), append(args, *v)
	}

	args = append(args, patch.ID)

	query := `
		UPDATE user
		SET ` + strings.Join(set, ", ") + `
		WHERE id = ?
		RETURNING id, created_ts, updated_ts, row_status, email, display_name, password_hash, open_id
	`
	row, err := tx.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer row.Close()

	if row.Next() {
		var userRaw userRaw
		if err := row.Scan(
			&userRaw.ID,
			&userRaw.CreatedTs,
			&userRaw.UpdatedTs,
			&userRaw.RowStatus,
			&userRaw.Email,
			&userRaw.DisplayName,
			&userRaw.PasswordHash,
			&userRaw.OpenID,
		); err != nil {
			return nil, err
		}

		if err := row.Err(); err != nil {
			return nil, err
		}

		return &userRaw, nil
	}

	return nil, &common.Error{Code: common.NotFound, Err: fmt.Errorf("user ID not found: %d", patch.ID)}
}

func findUserList(ctx context.Context, tx *sql.Tx, find *api.UserFind) ([]*userRaw, error) {
	where, args := []string{"1 = 1"}, []interface{}{}

	if v := find.ID; v != nil {
		where, args = append(where, "id = ?"), append(args, *v)
	}
	if v := find.Email; v != nil {
		where, args = append(where, "email = ?"), append(args, *v)
	}
	if v := find.OpenID; v != nil {
		where, args = append(where, "open_id = ?"), append(args, *v)
	}

	query := `
		SELECT 
			id,
			created_ts,
			updated_ts,
			row_status,
			email,
			display_name,
			password_hash,
			open_id
		FROM user
		WHERE ` + strings.Join(where, " AND ") + `
		ORDER BY updated_ts DESC, created_ts DESC
	`
	rows, err := tx.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	userRawList := make([]*userRaw, 0)
	for rows.Next() {
		var userRaw userRaw
		if err := rows.Scan(
			&userRaw.ID,
			&userRaw.CreatedTs,
			&userRaw.UpdatedTs,
			&userRaw.RowStatus,
			&userRaw.Email,
			&userRaw.DisplayName,
			&userRaw.PasswordHash,
			&userRaw.OpenID,
		); err != nil {
			return nil, err
		}
		userRawList = append(userRawList, &userRaw)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return userRawList, nil
}

func deleteUser(ctx context.Context, tx *sql.Tx, delete *api.UserDelete) error {
	result, err := tx.ExecContext(ctx, `
		DELETE FROM user WHERE id = ?
	`, delete.ID)
	if err != nil {
		return err
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		return &common.Error{Code: common.NotFound, Err: fmt.Errorf("user ID not found: %d", delete.ID)}
	}

	return nil
}
