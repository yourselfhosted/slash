package teststore

import (
	"testing"

	"github.com/stretchr/testify/require"
	"github.com/yourselfhosted/slash/server/common"
	"github.com/yourselfhosted/slash/server/profile"
	"github.com/yourselfhosted/slash/store"
)

func TestGetCurrentSchemaVersion(t *testing.T) {
	tests := []struct {
		driver   string
		expected string
	}{
		{
			driver:   "sqlite",
			expected: "1.0.1",
		},
		{
			driver:   "postgres",
			expected: "1.0.1",
		},
	}

	for _, tt := range tests {
		t.Run(tt.driver, func(t *testing.T) {
			ts := newTestingStoreWithConfig(tt.driver)
			currentSchemaVersion, err := ts.GetCurrentSchemaVersion()
			require.NoError(t, err)
			require.Equal(t, tt.expected, currentSchemaVersion)
		})
	}
}

func newTestingStoreWithConfig(driver string) *store.Store {
	profile := &profile.Profile{
		Mode:    "prod",
		Driver:  driver,
		Version: common.GetCurrentVersion("prod"),
	}
	return store.New(nil, profile)
}
