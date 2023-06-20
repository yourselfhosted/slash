package tests

import (
	"fmt"
	"net"
	"testing"

	"github.com/boojack/shortify/server/profile"
	"github.com/boojack/shortify/server/version"
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
	// Get a temporary directory for the test data.
	dir := t.TempDir()
	mode := "dev"
	port := getUnusedPort()
	return &profile.Profile{
		Mode:    mode,
		Port:    port,
		Data:    dir,
		DSN:     fmt.Sprintf("%s/shortify_%s.db", dir, mode),
		Version: version.GetCurrentVersion(mode),
	}
}
