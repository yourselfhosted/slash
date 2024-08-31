package store

import (
	"context"

	storepb "github.com/yourselfhosted/slash/proto/gen/store"
)

// Role is the type of a role.
type Role string

const (
	// RoleAdmin is the ADMIN role.
	RoleAdmin Role = "ADMIN"
	// RoleUser is the USER role.
	RoleUser Role = "USER"
)

type User struct {
	ID int32

	// Standard fields
	CreatedTs int64
	UpdatedTs int64
	RowStatus storepb.RowStatus

	// Domain specific fields
	Email        string
	Nickname     string
	PasswordHash string
	Role         Role
}

type UpdateUser struct {
	ID int32

	RowStatus    *storepb.RowStatus
	Email        *string
	Nickname     *string
	PasswordHash *string
	Role         *Role
}

type FindUser struct {
	ID        *int32
	RowStatus *storepb.RowStatus
	Email     *string
	Nickname  *string
	Role      *Role
}

type DeleteUser struct {
	ID int32
}

func (s *Store) CreateUser(ctx context.Context, create *User) (*User, error) {
	user, err := s.driver.CreateUser(ctx, create)
	if err != nil {
		return nil, err
	}
	s.userCache.Store(user.ID, user)
	return user, nil
}

func (s *Store) UpdateUser(ctx context.Context, update *UpdateUser) (*User, error) {
	user, err := s.driver.UpdateUser(ctx, update)
	if err != nil {
		return nil, err
	}
	s.userCache.Store(user.ID, user)
	return user, nil
}

func (s *Store) ListUsers(ctx context.Context, find *FindUser) ([]*User, error) {
	list, err := s.driver.ListUsers(ctx, find)
	if err != nil {
		return nil, err
	}
	for _, user := range list {
		s.userCache.Store(user.ID, user)
	}
	return list, nil
}

func (s *Store) GetUser(ctx context.Context, find *FindUser) (*User, error) {
	if find.ID != nil {
		if cache, ok := s.userCache.Load(*find.ID); ok {
			return cache.(*User), nil
		}
	}

	list, err := s.ListUsers(ctx, find)
	if err != nil {
		return nil, err
	}

	if len(list) == 0 {
		return nil, nil
	}

	return list[0], nil
}

func (s *Store) DeleteUser(ctx context.Context, delete *DeleteUser) error {
	if err := s.driver.DeleteUser(ctx, delete); err != nil {
		return err
	}

	s.userCache.Delete(delete.ID)
	return nil
}
