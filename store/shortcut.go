package store

import (
	"context"

	storepb "github.com/bshort/monotreme/proto/gen/store"
)

type UpdateShortcut struct {
	ID int32

	Name              *string
	Link              *string
	Title             *string
	Description       *string
	Visibility        *storepb.Visibility
	Tag               *string
	OpenGraphMetadata *storepb.OpenGraphMetadata
}

type FindShortcut struct {
	ID             *int32
	CreatorID      *int32
	Name           *string
	VisibilityList []storepb.Visibility
	Tag            *string
}

type DeleteShortcut struct {
	ID int32
}

func (s *Store) CreateShortcut(ctx context.Context, create *storepb.Shortcut) (*storepb.Shortcut, error) {
	shortcut, err := s.driver.CreateShortcut(ctx, create)
	if err != nil {
		return nil, err
	}
	s.shortcutCache.Store(shortcut.Id, shortcut)
	return shortcut, nil
}

func (s *Store) UpdateShortcut(ctx context.Context, update *UpdateShortcut) (*storepb.Shortcut, error) {
	shortcut, err := s.driver.UpdateShortcut(ctx, update)
	if err != nil {
		return nil, err
	}
	s.shortcutCache.Store(shortcut.Id, shortcut)
	return shortcut, nil
}

func (s *Store) ListShortcuts(ctx context.Context, find *FindShortcut) ([]*storepb.Shortcut, error) {
	list, err := s.driver.ListShortcuts(ctx, find)
	if err != nil {
		return nil, err
	}
	for _, shortcut := range list {
		s.shortcutCache.Store(shortcut.Id, shortcut)
	}
	return list, nil
}

func (s *Store) GetShortcut(ctx context.Context, find *FindShortcut) (*storepb.Shortcut, error) {
	if find.ID != nil {
		if cache, ok := s.shortcutCache.Load(*find.ID); ok {
			if shortcut, ok := cache.(*storepb.Shortcut); ok {
				return shortcut, nil
			}
		}
	}

	shortcuts, err := s.ListShortcuts(ctx, find)
	if err != nil {
		return nil, err
	}

	if len(shortcuts) == 0 {
		return nil, nil
	}

	shortcut := shortcuts[0]
	s.shortcutCache.Store(shortcut.Id, shortcut)
	return shortcut, nil
}

func (s *Store) DeleteShortcut(ctx context.Context, delete *DeleteShortcut) error {
	if err := s.driver.DeleteShortcut(ctx, delete); err != nil {
		return err
	}

	s.shortcutCache.Delete(delete.ID)
	return nil
}
