package test

import (
	"fmt"
	"net"
	"os"
	"testing"

	"github.com/joho/godotenv"

	"github.com/yourselfhosted/slash/server/common"
	"github.com/yourselfhosted/slash/server/profile"
)

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

func GetTestingProfile(t *testing.T) *profile.Profile {
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
