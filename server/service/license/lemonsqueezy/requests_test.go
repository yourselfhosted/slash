package lemonsqueezy

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestValidateLicenseKey(t *testing.T) {
	tests := []struct {
		name     string
		key      string
		expected bool
		err      error
	}{
		{
			name:     "Testing license key",
			key:      "26B383EE-95B2-4458-9C58-B376BD6183B1",
			expected: false,
		},
		{
			name:     "invalid key",
			key:      "invalid-key",
			expected: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			response, err := ValidateLicenseKey(tt.key, "test-instance")
			if tt.err != nil {
				require.EqualError(t, err, tt.err.Error())
				return
			}
			require.NoError(t, err)
			require.Equal(t, tt.expected, response.Valid)
		})
	}
}

func TestActiveLicenseKey(t *testing.T) {
	tests := []struct {
		name     string
		key      string
		expected bool
	}{
		{
			name:     "Testing license key",
			key:      "26B383EE-95B2-4458-9C58-B376BD6183B1",
			expected: false,
		},
		{
			name:     "invalid key",
			key:      "invalid-key",
			expected: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			response, err := ActiveLicenseKey(tt.key, "test-instance")
			require.NoError(t, err)
			require.Equal(t, tt.expected, response.Activated)
		})
	}
}
