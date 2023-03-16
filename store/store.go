package store

import (
	"database/sql"
	"sync"

	"github.com/boojack/corgi/server/profile"
)

// Store provides database access to all raw objects.
type Store struct {
	db      *sql.DB
	profile *profile.Profile

	userCache      sync.Map // map[int]*userRaw
	workspaceCache sync.Map // map[int]*workspaceRaw
	shortcutCache  sync.Map // map[int]*shortcutRaw
}

// New creates a new instance of Store.
func New(db *sql.DB, profile *profile.Profile) *Store {
	return &Store{
		db:      db,
		profile: profile,
	}
}
