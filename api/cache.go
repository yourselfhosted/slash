package api

// CacheNamespace is the type of a cache.
type CacheNamespace string

const (
	// UserCache is the cache type of workspaces.
	WorkspaceCache CacheNamespace = "w"
	// UserCache is the cache type of users.
	UserCache CacheNamespace = "u"
	// ShortcutCache is the cache type of shortcuts.
	ShortcutCache CacheNamespace = "s"
)

// CacheService is the service for caches.
type CacheService interface {
	FindCache(namespace CacheNamespace, id int, entry interface{}) (bool, error)
	UpsertCache(namespace CacheNamespace, id int, entry interface{}) error
	DeleteCache(namespace CacheNamespace, id int)
}
