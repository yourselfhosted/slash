package v1

import (
	"net/http"

	"github.com/boojack/shortify/server/profile"
	"github.com/labstack/echo/v4"
)

type SystemStatus struct {
	Profile *profile.Profile `json:"profile"`
}

func (s *APIV1Service) registerSystemRoutes(g *echo.Group) {
	g.GET("/ping", func(c echo.Context) error {
		return c.JSON(http.StatusOK, s.Profile)
	})

	g.GET("/status", func(c echo.Context) error {
		systemStatus := SystemStatus{
			Profile: s.Profile,
		}

		return c.JSON(http.StatusOK, systemStatus)
	})
}
