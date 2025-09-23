package teststore

import (
	"context"
	"fmt"
	"net"
	"os"
	"testing"

	"github.com/joho/godotenv"

	"github.com/bshort/monotreme/server/common"
	"github.com/bshort/monotreme/server/profile"
	"github.com/bshort/monotreme/store"
	"github.com/bshort/monotreme/store/db"
)

func NewTestingStore(ctx context.Context, t *testing.T) *store.Store {
	profile := getTestingProfile(t)
	dbDriver, err := db.NewDBDriver(profile)
	if err != nil {
		fmt.Printf("failed to create db driver, error: %+v\n", err)
	}
	resetTestingDB(ctx, profile, dbDriver)
	store := store.New(dbDriver, profile)
	if err := store.Migrate(ctx); err != nil {
		fmt.Printf("failed to migrate db, error: %+v\n", err)
	}
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
		DROP TABLE IF EXISTS collection CASCADE;`)
		if err != nil {
			fmt.Printf("failed to reset testing db, error: %+v\n", err)
			panic(err)
		}
	}
}

func getUnusedPort() int {
	// Get a random unused port
	listener, err := net.Listen("tcp", "localhost:0")
	if err != nil {
		panic(err)
	}
	defer listener.Close()

	// Get the port number
	port := listener.Addr().(*net.TCPAddr).Port
	return port
}

func getTestingProfile(t *testing.T) *profile.Profile {
	if err := godotenv.Load(".env"); err != nil {
		t.Log("failed to load .env file, but it's ok")
	}

	// Get a temporary directory for the test data.
	dir := t.TempDir()
	mode := "prod"
	port := getUnusedPort()
	driver := getDriverFromEnv()
	dsn := os.Getenv("DSN")
	if driver == "sqlite" {
		dsn = fmt.Sprintf("%s/slash_%s.db", dir, mode)
	}
	return &profile.Profile{
		Mode:    mode,
		Port:    port,
		Data:    dir,
		DSN:     dsn,
		Driver:  driver,
		Version: common.GetCurrentVersion(mode),
	}
}

func getDriverFromEnv() string {
	driver := os.Getenv("DRIVER")
	if driver == "" {
		driver = "sqlite"
	}
	return driver
}
