package server

import (
	"strings"

	"github.com/boojack/shortify/api"
	"github.com/labstack/echo/v4"
)

func composeResponse(data any) any {
	type R struct {
		Data any `json:"data"`
	}

	return R{
		Data: data,
	}
}

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
	return hasPrefixes(path, "/api", "/o")
}

func (server *Server) defaultAuthSkipper(c echo.Context) bool {
	ctx := c.Request().Context()
	path := c.Path()

	// Skip auth.
	if hasPrefixes(path, "/api/auth") {
		return true
	}

	// If there is openId in query string and related user is found, then skip auth.
	openID := c.QueryParam("openId")
	if openID != "" {
		userFind := &api.UserFind{
			OpenID: &openID,
		}
		user, err := server.Store.FindUser(ctx, userFind)
		if err != nil {
			return false
		}
		if user != nil {
			// Stores userID into context.
			c.Set(getUserIDContextKey(), user.ID)
			return true
		}
	}

	return false
}
