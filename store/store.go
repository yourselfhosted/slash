package store

import (
	"database/sql"
	"sync"

	"github.com/boojack/shortify/server/profile"
)

// Store provides database access to all raw objects.
type Store struct {
	db      *sql.DB
	profile *profile.Profile

	userCache      sync.Map // map[int]*userRaw
	workspaceCache sync.Map // map[int]*workspaceRaw
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
