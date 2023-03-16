package server

import (
	"github.com/boojack/shortify/api"
	"github.com/boojack/shortify/common"
	"github.com/labstack/echo/v4"
)

func composeResponse(data interface{}) interface{} {
	type R struct {
		Data interface{} `json:"data"`
	}

	return R{
		Data: data,
	}
}

func defaultAPIRequestSkipper(c echo.Context) bool {
	path := c.Path()
	return common.HasPrefixes(path, "/api", "/o")
}

func (server *Server) defaultAuthSkipper(c echo.Context) bool {
	ctx := c.Request().Context()
	path := c.Path()

	// Skip auth.
	if common.HasPrefixes(path, "/api/auth") {
		return true
	}

	// If there is openId in query string and related user is found, then skip auth.
	openID := c.QueryParam("openId")
	if openID != "" {
		userFind := &api.UserFind{
			OpenID: &openID,
		}
		user, err := server.Store.FindUser(ctx, userFind)
		if err != nil && common.ErrorCode(err) != common.NotFound {
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
