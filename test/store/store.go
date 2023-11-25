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
	db := db.NewDB(profile)
	if err := db.Open(ctx); err != nil {
		fmt.Printf("failed to open db, error: %+v\n", err)
	}

	store := store.New(db.DBInstance, profile)
	return store
}
