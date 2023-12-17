package teststore

import (
	"context"
	"fmt"
	"testing"

	// sqlite driver.
	_ "modernc.org/sqlite"

	"github.com/yourselfhosted/slash/store"
	"github.com/yourselfhosted/slash/store/db"
	test "github.com/yourselfhosted/slash/test"
)

func NewTestingStore(ctx context.Context, t *testing.T) *store.Store {
	profile := test.GetTestingProfile(t)
	dbDriver, err := db.NewDBDriver(profile)
	if err != nil {
		fmt.Printf("failed to create db driver, error: %+v\n", err)
	}
	if err := dbDriver.Migrate(ctx); err != nil {
		fmt.Printf("failed to migrate db, error: %+v\n", err)
	}

	store := store.New(dbDriver, profile)
	return store
}
