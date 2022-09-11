package store

import (
	"database/sql"

	"github.com/boojack/corgi/api"
	"github.com/boojack/corgi/server/profile"
)

// Store provides database access to all raw objects.
type Store struct {
	db      *sql.DB
	profile *profile.Profile
	cache   api.CacheService
}

// New creates a new instance of Store.
func New(db *sql.DB, profile *profile.Profile) *Store {
	cacheService := NewCacheService()

	return &Store{
		db:      db,
		profile: profile,
		cache:   cacheService,
	}
}
