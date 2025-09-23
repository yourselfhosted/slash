package profile

import (
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"strings"

	"github.com/pkg/errors"
)

// Profile is the configuration to start main server.
type Profile struct {
	// Mode can be "prod" or "dev".
	Mode string
	// Port is the binding port for server.
	Port int
	// Data is the data directory.
	Data string
	// DSN points to where monotreme stores its own data.
	DSN string
	// Driver is the database driver. Supported drivers are sqlite, postgres.
	Driver string
	// Version is the current version of server.
	Version string
}

func (p *Profile) IsDev() bool {
	return p.Mode != "prod"
}

func checkDataDir(dataDir string) (string, error) {
	// Convert to absolute path if relative path is supplied.
	if !filepath.IsAbs(dataDir) {
		relativeDir := filepath.Join(filepath.Dir(os.Args[0]), dataDir)
		absDir, err := filepath.Abs(relativeDir)
		if err != nil {
			return "", err
		}
		dataDir = absDir
	}

	// Trim trailing \ or / in case user supplies
	dataDir = strings.TrimRight(dataDir, "\\/")

	if _, err := os.Stat(dataDir); err != nil {
		return "", errors.Wrapf(err, "unable to access data folder %s", dataDir)
	}

	return dataDir, nil
}

func (p *Profile) Validate() error {
	if p.Mode != "dev" && p.Mode != "prod" {
		p.Mode = "dev"
	}

	if p.Mode == "prod" && p.Data == "" {
		if runtime.GOOS == "windows" {
			p.Data = filepath.Join(os.Getenv("ProgramData"), "monotreme")
			if _, err := os.Stat(p.Data); os.IsNotExist(err) {
				if err := os.MkdirAll(p.Data, 0770); err != nil {
					fmt.Printf("Failed to create data directory: %s, err: %+v\n", p.Data, err)
					return err
				}
			}
		} else {
			p.Data = "/var/opt/monotreme"
		}
	}

	dataDir, err := checkDataDir(p.Data)
	if err != nil {
		fmt.Printf("Failed to check dsn: %s, err: %+v\n", dataDir, err)
		return err
	}

	p.Data = dataDir
	if p.Driver == "sqlite" && p.DSN == "" {
		dbFile := fmt.Sprintf("monotreme_%s.db", p.Mode)
		p.DSN = filepath.Join(dataDir, dbFile)
	}

	return nil
}
