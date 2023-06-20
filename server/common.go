package server

import (
	"strings"

	"github.com/labstack/echo/v4"
)

// hasPrefixes returns true if the string s has any of the given prefixes.
func hasPrefixes(src string, prefixes ...string) bool {
	for _, prefix := range prefixes {
		if strings.HasPrefix(src, prefix) {
			return true
		}
	}
	return false
}

func defaultAPIRequestSkipper(c echo.Context) bool {
	path := c.Path()
	return hasPrefixes(path, "/api")
}

func (*Server) defaultAuthSkipper(c echo.Context) bool {
	path := c.Path()
	return hasPrefixes(path, "/api/v1/auth")
}
