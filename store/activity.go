package store

import (
	"context"
)

type ActivityType string

const (
	// ActivityShortcutView is the activity type of shortcut create.
	ActivityShortcutCreate ActivityType = "shortcut.create"
	// ActivityShortcutView is the activity type of shortcut view.
	ActivityShortcutView ActivityType = "shortcut.view"
)

func (t ActivityType) String() string {
	switch t {
	case ActivityShortcutCreate:
		return "shortcut.create"
	case ActivityShortcutView:
		return "shortcut.view"
	}
	return ""
}

type ActivityLevel string

const (
	// ActivityInfo is the activity level of info.
	ActivityInfo ActivityLevel = "INFO"
	// ActivityWarn is the activity level of warn.
	ActivityWarn ActivityLevel = "WARN"
	// ActivityError is the activity level of error.
	ActivityError ActivityLevel = "ERROR"
)

func (l ActivityLevel) String() string {
	switch l {
	case ActivityInfo:
		return "INFO"
	case ActivityWarn:
		return "WARN"
	case ActivityError:
		return "ERROR"
	}
	return ""
}

type Activity struct {
	ID        int32
	CreatorID int32
	CreatedTs int64
	Type      ActivityType
	Level     ActivityLevel
	Payload   string
}

type FindActivity struct {
	Type              ActivityType
	Level             ActivityLevel
	PayloadShortcutID *int32
}

func (s *Store) CreateActivity(ctx context.Context, create *Activity) (*Activity, error) {
	return s.driver.CreateActivity(ctx, create)
}

func (s *Store) ListActivities(ctx context.Context, find *FindActivity) ([]*Activity, error) {
	return s.driver.ListActivities(ctx, find)
}

func (s *Store) GetActivity(ctx context.Context, find *FindActivity) (*Activity, error) {
	list, err := s.ListActivities(ctx, find)
	if err != nil {
		return nil, err
	}

	if len(list) == 0 {
		return nil, nil
	}

	activity := list[0]
	return activity, nil
}
