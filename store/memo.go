package store

import (
	"context"

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
	return s.driver.CreateMemo(ctx, create)
}

func (s *Store) UpdateMemo(ctx context.Context, update *UpdateMemo) (*storepb.Memo, error) {
	return s.driver.UpdateMemo(ctx, update)
}

func (s *Store) ListMemos(ctx context.Context, find *FindMemo) ([]*storepb.Memo, error) {
	return s.driver.ListMemos(ctx, find)
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
	return s.driver.DeleteMemo(ctx, delete)
}
