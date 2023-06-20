package store

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"github.com/boojack/shortify/api"
	"github.com/boojack/shortify/internal/errorutil"
)

type User struct {
	ID int

	// Standard fields
	CreatedTs int64
	UpdatedTs int64
	RowStatus RowStatus

	// Domain specific fields
	Username     string
	Nickname     string
	Email        string
	PasswordHash string
	Role         Role
}

type UpdateUser struct {
	ID int

	RowStatus    *RowStatus
	Username     *string
	Nickname     *string
	Email        *string
	PasswordHash *string
	Role         *Role
}

type FindUser struct {
	ID        *int
	RowStatus *RowStatus
	Username  *string
	Nickname  *string
	Email     *string
	Role      *Role
}

type DeleteUser struct {
	ID int
}

func (s *Store) CreateUserV1(ctx context.Context, create *User) (*User, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	query := `
		INSERT INTO user (
			username,
			nickname,
			email,
			password_hash,
			role
		)
		VALUES (?, ?, ?, ?, ?)
		RETURNING id, created_ts, updated_ts, row_status
	`
	if err := tx.QueryRowContext(ctx, query,
		create.Username,
		create.Nickname,
		create.Email,
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

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	user := create
	return user, nil
}

func (s *Store) UpdateUserV1(ctx context.Context, update *UpdateUser) (*User, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	set, args := []string{}, []any{}
	if v := update.RowStatus; v != nil {
		set, args = append(set, "row_status = ?"), append(args, *v)
	}
	if v := update.Username; v != nil {
		set, args = append(set, "username = ?"), append(args, *v)
	}
	if v := update.Nickname; v != nil {
		set, args = append(set, "nickname = ?"), append(args, *v)
	}
	if v := update.Email; v != nil {
		set, args = append(set, "email = ?"), append(args, *v)
	}
	if v := update.PasswordHash; v != nil {
		set, args = append(set, "password_hash = ?"), append(args, *v)
	}
	if v := update.Role; v != nil {
		set, args = append(set, "role = ?"), append(args, *v)
	}

	if len(set) == 0 {
		return nil, fmt.Errorf("no fields to update")
	}

	query := `
		UPDATE user
		SET ` + strings.Join(set, ", ") + `
		WHERE id = ?
		RETURNING id, created_ts, updated_ts, row_status, username, nickname, email, password_hash, role
	`
	args = append(args, update.ID)
	user := &User{}
	if err := tx.QueryRowContext(ctx, query, args...).Scan(
		&user.ID,
		&user.CreatedTs,
		&user.UpdatedTs,
		&user.RowStatus,
		&user.Username,
		&user.Nickname,
		&user.Email,
		&user.PasswordHash,
		&user.Role,
	); err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *Store) ListUsers(ctx context.Context, find *FindUser) ([]*User, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	list, err := listUsers(ctx, tx, find)
	if err != nil {
		return nil, err
	}

	return list, nil
}

func (s *Store) GetUserV1(ctx context.Context, find *FindUser) (*User, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	list, err := listUsers(ctx, tx, find)
	if err != nil {
		return nil, err
	}

	if len(list) == 0 {
		return nil, nil
	}

	return list[0], nil
}

func (s *Store) DeleteUserV1(ctx context.Context, delete *DeleteUser) error {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if _, err := tx.ExecContext(ctx, `
		DELETE FROM user WHERE id = ?
	`, delete.ID); err != nil {
		return err
	}

	if err := tx.Commit(); err != nil {
		// do nothing here to prevent linter warning.
		return err
	}

	return nil
}

func listUsers(ctx context.Context, tx *sql.Tx, find *FindUser) ([]*User, error) {
	where, args := []string{"1 = 1"}, []any{}

	if v := find.ID; v != nil {
		where, args = append(where, "id = ?"), append(args, *v)
	}
	if v := find.RowStatus; v != nil {
		where, args = append(where, "row_status = ?"), append(args, v.String())
	}
	if v := find.Username; v != nil {
		where, args = append(where, "username = ?"), append(args, *v)
	}
	if v := find.Nickname; v != nil {
		where, args = append(where, "nickname = ?"), append(args, *v)
	}
	if v := find.Email; v != nil {
		where, args = append(where, "email = ?"), append(args, *v)
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
			username,
			nickname,
			email,
			password_hash,
			role
		FROM user
		WHERE ` + strings.Join(where, " AND ") + `
		ORDER BY updated_ts DESC, created_ts DESC
	`
	rows, err := tx.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := make([]*User, 0)
	for rows.Next() {
		user := User{}
		if err := rows.Scan(
			&user.ID,
			&user.CreatedTs,
			&user.UpdatedTs,
			&user.RowStatus,
			&user.Username,
			&user.Nickname,
			&user.Email,
			&user.PasswordHash,
			&user.Role,
		); err != nil {
			return nil, err
		}
		list = append(list, &user)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return list, nil
}

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
	Role         api.Role
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
		Role:         raw.Role,
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
		return nil, &errorutil.Error{Code: errorutil.NotFound, Err: fmt.Errorf("not found user with filter %+v", find)}
	} else if len(list) > 1 {
		return nil, &errorutil.Error{Code: errorutil.Conflict, Err: fmt.Errorf("found %d users with filter %+v, expect 1", len(list), find)}
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
			open_id,
			role
		)
		VALUES (?, ?, ?, ?)
		RETURNING id, created_ts, updated_ts, row_status, email, display_name, password_hash, open_id, role
	`
	var userRaw userRaw
	if err := tx.QueryRowContext(ctx, query,
		create.Email,
		create.DisplayName,
		create.PasswordHash,
		create.OpenID,
		create.Role,
	).Scan(
		&userRaw.ID,
		&userRaw.CreatedTs,
		&userRaw.UpdatedTs,
		&userRaw.RowStatus,
		&userRaw.Email,
		&userRaw.DisplayName,
		&userRaw.PasswordHash,
		&userRaw.OpenID,
		&userRaw.Role,
	); err != nil {
		return nil, err
	}

	return &userRaw, nil
}

func patchUser(ctx context.Context, tx *sql.Tx, patch *api.UserPatch) (*userRaw, error) {
	set, args := []string{}, []any{}

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
		RETURNING id, created_ts, updated_ts, row_status, email, display_name, password_hash, open_id, role
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
			&userRaw.Role,
		); err != nil {
			return nil, err
		}

		if err := row.Err(); err != nil {
			return nil, err
		}

		return &userRaw, nil
	}

	return nil, &errorutil.Error{Code: errorutil.NotFound, Err: fmt.Errorf("user ID not found: %d", patch.ID)}
}

func findUserList(ctx context.Context, tx *sql.Tx, find *api.UserFind) ([]*userRaw, error) {
	where, args := []string{"1 = 1"}, []any{}

	if v := find.ID; v != nil {
		where, args = append(where, "id = ?"), append(args, *v)
	}
	if v := find.Email; v != nil {
		where, args = append(where, "email = ?"), append(args, *v)
	}
	if v := find.OpenID; v != nil {
		where, args = append(where, "open_id = ?"), append(args, *v)
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
			display_name,
			password_hash,
			open_id,
			role
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
			&userRaw.Role,
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
		return &errorutil.Error{Code: errorutil.NotFound, Err: fmt.Errorf("user ID not found: %d", delete.ID)}
	}

	return nil
}
