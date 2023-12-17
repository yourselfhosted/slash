package store

import (
	"context"

	storepb "github.com/yourselfhosted/slash/proto/gen/store"
)

type UpdateCollection struct {
	ID int32

	RowStatus   *RowStatus
	Name        *string
	Link        *string
	Title       *string
	Description *string
	ShortcutIDs []int32
	Visibility  *Visibility
}

type FindCollection struct {
	ID             *int32
	CreatorID      *int32
	Name           *string
	VisibilityList []Visibility
}

type DeleteCollection struct {
	ID int32
}

func (s *Store) CreateCollection(ctx context.Context, create *storepb.Collection) (*storepb.Collection, error) {
	return s.driver.CreateCollection(ctx, create)
}

func (s *Store) UpdateCollection(ctx context.Context, update *UpdateCollection) (*storepb.Collection, error) {
	return s.driver.UpdateCollection(ctx, update)
}

func (s *Store) ListCollections(ctx context.Context, find *FindCollection) ([]*storepb.Collection, error) {
	return s.driver.ListCollections(ctx, find)
}

func (s *Store) GetCollection(ctx context.Context, find *FindCollection) (*storepb.Collection, error) {
	collections, err := s.ListCollections(ctx, find)
	if err != nil {
		return nil, err
	}

	if len(collections) == 0 {
		return nil, nil
	}

	collection := collections[0]
	return collection, nil
}

func (s *Store) DeleteCollection(ctx context.Context, delete *DeleteCollection) error {
	return s.driver.DeleteCollection(ctx, delete)
}
