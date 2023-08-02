package util

import (
	"strconv"
	"strings"
)

// ConvertStringToInt32 converts a string to int32.
func ConvertStringToInt32(src string) (int32, error) {
	i, err := strconv.Atoi(src)
	if err != nil {
		return 0, err
	}
	return int32(i), nil
}

// HasPrefixes returns true if the string s has any of the given prefixes.
func HasPrefixes(src string, prefixes ...string) bool {
	for _, prefix := range prefixes {
		if strings.HasPrefix(src, prefix) {
			return true
		}
	}
	return false
}
