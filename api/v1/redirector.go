package v1

import (
	"net/http"

	"github.com/boojack/shortify/store"
	"github.com/labstack/echo/v4"
)

func (s *APIV1Service) registerRedirectorRoutes(g *echo.Group) {
	g.GET("/*", func(c echo.Context) error {
		ctx := c.Request().Context()
		if len(c.ParamValues()) == 0 {
			return echo.NewHTTPError(http.StatusBadRequest, "Invalid shortcut name")
		}
		shortcutName := c.ParamValues()[0]
		shortcut, err := s.Store.GetShortcut(ctx, &store.FindShortcut{
			Name: &shortcutName,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to get shortcut").SetInternal(err)
		}
		if shortcut == nil {
			return echo.NewHTTPError(http.StatusNotFound, "Shortcut not found")
		}
		if shortcut.Visibility != store.VisibilityPublic {
			userID, ok := c.Get(getUserIDContextKey()).(int)
			if !ok {
				return echo.NewHTTPError(http.StatusUnauthorized, "Unauthorized")
			}
			if shortcut.Visibility == store.VisibilityPrivate && shortcut.CreatorID != userID {
				return echo.NewHTTPError(http.StatusUnauthorized, "Unauthorized")
			}
		}
		return c.Redirect(http.StatusSeeOther, shortcut.Link)
	})
}
