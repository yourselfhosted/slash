package v1

import (
	"encoding/json"
	"net/http"

	"github.com/boojack/shortify/store"
	"github.com/labstack/echo/v4"
	"github.com/pkg/errors"
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

		if err := s.createShortcutViewActivity(c, shortcut); err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to create activity").SetInternal(err)
		}

		return c.Redirect(http.StatusSeeOther, shortcut.Link)
	})
}

func (s *APIV1Service) createShortcutViewActivity(c echo.Context, shortcut *store.Shortcut) error {
	payload := &ActivityShorcutViewPayload{
		ShortcutID: shortcut.ID,
		IP:         c.RealIP(),
		Referer:    c.Request().Referer(),
		UserAgent:  c.Request().UserAgent(),
	}
	payloadStr, err := json.Marshal(payload)
	if err != nil {
		return errors.Wrap(err, "Failed to marshal activity payload")
	}
	activity := &store.Activity{
		CreatorID: BotID,
		Type:      store.ActivityShortcutView,
		Level:     store.ActivityInfo,
		Payload:   string(payloadStr),
	}
	_, err = s.Store.CreateActivity(c.Request().Context(), activity)
	if err != nil {
		return errors.Wrap(err, "Failed to create activity")
	}
	return nil
}
