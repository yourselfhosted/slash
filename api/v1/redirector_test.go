package v1

import "testing"

func TestIsValidURLString(t *testing.T) {
	tests := []struct {
		link     string
		expected bool
	}{
		{
			link:     "https://google.com",
			expected: true,
		},
		{
			link:     "http://google.com",
			expected: true,
		},
		{
			link:     "google.com",
			expected: false,
		},
		{
			link:     "mailto:email@example.com",
			expected: true,
		},
	}

	for _, test := range tests {
		if isValidURLString(test.link) != test.expected {
			t.Errorf("isValidURLString(%s) = %v, expected %v", test.link, !test.expected, test.expected)
		}
	}
}
