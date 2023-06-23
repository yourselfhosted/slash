package v1

import (
	"net/http"

	"github.com/boojack/shortify/server/profile"
	"github.com/boojack/shortify/store"
	"github.com/labstack/echo/v4"
)

type SystemStatus struct {
	Profile        *profile.Profile `json:"profile"`
	DisallowSignUp bool             `json:"disallowSignUp"`
}

func (s *APIV1Service) registerSystemRoutes(g *echo.Group) {
	g.GET("/ping", func(c echo.Context) error {
		return c.JSON(http.StatusOK, s.Profile)
	})

	g.GET("/status", func(c echo.Context) error {
		ctx := c.Request().Context()
		systemStatus := SystemStatus{
			Profile: s.Profile,
		}

		disallowSignUpSetting, err := s.Store.GetWorkspaceSetting(ctx, &store.FindWorkspaceSetting{
			Key: WorkspaceDisallowSignUp.String(),
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to get workspace setting")
		}
		if disallowSignUpSetting != nil {
			systemStatus.DisallowSignUp = disallowSignUpSetting.Value == "true"
		}

		return c.JSON(http.StatusOK, systemStatus)
	})
}
