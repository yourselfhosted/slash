package teststore

import (
	"context"
	"fmt"
	"testing"

	"github.com/yourselfhosted/slash/server/profile"
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
	resetTestingDB(ctx, profile, dbDriver)
	if err := dbDriver.Migrate(ctx); err != nil {
		fmt.Printf("failed to migrate db, error: %+v\n", err)
	}

	store := store.New(dbDriver, profile)
	return store
}

func resetTestingDB(ctx context.Context, profile *profile.Profile, dbDriver store.Driver) {
	if profile.Driver == "postgres" {
		_, err := dbDriver.GetDB().ExecContext(ctx, `
		DROP TABLE IF EXISTS migration_history CASCADE;
		DROP TABLE IF EXISTS workspace_setting CASCADE;
		DROP TABLE IF EXISTS "user" CASCADE;
		DROP TABLE IF EXISTS user_setting CASCADE;
		DROP TABLE IF EXISTS shortcut CASCADE;
		DROP TABLE IF EXISTS activity CASCADE;
		DROP TABLE IF EXISTS collection CASCADE;
		DROP TABLE IF EXISTS memo CASCADE;`)
		if err != nil {
			fmt.Printf("failed to reset testing db, error: %+v\n", err)
			panic(err)
		}
	}
}
