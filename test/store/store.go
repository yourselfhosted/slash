package teststore

import (
	"context"
	"fmt"
	"testing"

	"github.com/boojack/shortify/store"
	"github.com/boojack/shortify/store/db"
	test "github.com/boojack/shortify/test"

	// sqlite driver.
	_ "modernc.org/sqlite"
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
