package store

import (
	"context"
	"database/sql"

	storepb "github.com/yourselfhosted/slash/proto/gen/store"
)

// Driver is an interface for store driver.
// It contains all methods that store database driver should implement.
type Driver interface {
	GetDB() *sql.DB
	Close() error

	Migrate(ctx context.Context) error

	// MigrationHistory model related methods.
	UpsertMigrationHistory(ctx context.Context, upsert *UpsertMigrationHistory) (*MigrationHistory, error)
	ListMigrationHistories(ctx context.Context, find *FindMigrationHistory) ([]*MigrationHistory, error)

	// Activity model related methods.
	CreateActivity(ctx context.Context, create *Activity) (*Activity, error)
	ListActivities(ctx context.Context, find *FindActivity) ([]*Activity, error)

	// Collection model related methods.
	CreateCollection(ctx context.Context, create *storepb.Collection) (*storepb.Collection, error)
	UpdateCollection(ctx context.Context, update *UpdateCollection) (*storepb.Collection, error)
	ListCollections(ctx context.Context, find *FindCollection) ([]*storepb.Collection, error)
	DeleteCollection(ctx context.Context, delete *DeleteCollection) error

	// Memo model related methods.
	CreateMemo(ctx context.Context, create *storepb.Memo) (*storepb.Memo, error)
	UpdateMemo(ctx context.Context, update *UpdateMemo) (*storepb.Memo, error)
	ListMemos(ctx context.Context, find *FindMemo) ([]*storepb.Memo, error)
	DeleteMemo(ctx context.Context, delete *DeleteMemo) error

	// Shortcut model related methods.
	CreateShortcut(ctx context.Context, create *storepb.Shortcut) (*storepb.Shortcut, error)
	UpdateShortcut(ctx context.Context, update *UpdateShortcut) (*storepb.Shortcut, error)
	ListShortcuts(ctx context.Context, find *FindShortcut) ([]*storepb.Shortcut, error)
	DeleteShortcut(ctx context.Context, delete *DeleteShortcut) error

	// User model related methods.
	CreateUser(ctx context.Context, create *User) (*User, error)
	UpdateUser(ctx context.Context, update *UpdateUser) (*User, error)
	ListUsers(ctx context.Context, find *FindUser) ([]*User, error)
	DeleteUser(ctx context.Context, delete *DeleteUser) error

	// UserSetting model related methods.
	UpsertUserSetting(ctx context.Context, upsert *storepb.UserSetting) (*storepb.UserSetting, error)
	ListUserSettings(ctx context.Context, find *FindUserSetting) ([]*storepb.UserSetting, error)

	// WorkspaceSetting model related methods.
	UpsertWorkspaceSetting(ctx context.Context, upsert *storepb.WorkspaceSetting) (*storepb.WorkspaceSetting, error)
	ListWorkspaceSettings(ctx context.Context, find *FindWorkspaceSetting) ([]*storepb.WorkspaceSetting, error)
}
