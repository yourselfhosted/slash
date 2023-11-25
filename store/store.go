package store

import (
	"database/sql"
	"sync"

	"github.com/yourselfhosted/slash/server/profile"
)

// Store provides database access to all raw objects.
type Store struct {
	db      *sql.DB
	profile *profile.Profile

	workspaceSettingCache sync.Map // map[string]*WorkspaceSetting
	userCache             sync.Map // map[int]*User
	userSettingCache      sync.Map // map[string]*UserSetting
	shortcutCache         sync.Map // map[int]*Shortcut
}

// New creates a new instance of Store.
func New(db *sql.DB, profile *profile.Profile) *Store {
	return &Store{
		db:      db,
		profile: profile,
	}
}

// Close closes the database connection.
func (s *Store) Close() error {
	return s.db.Close()
}
