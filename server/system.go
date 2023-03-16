package server

import (
	"net/http"

	"github.com/boojack/shortify/api"

	"github.com/labstack/echo/v4"
)

func (s *Server) registerSystemRoutes(g *echo.Group) {
	g.GET("/ping", func(c echo.Context) error {
		return c.JSON(http.StatusOK, composeResponse(s.Profile))
	})

	g.GET("/status", func(c echo.Context) error {
		systemStatus := api.SystemStatus{
			Profile: s.Profile,
		}

		return c.JSON(http.StatusOK, composeResponse(systemStatus))
	})
}
