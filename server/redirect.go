package server

import (
	"net/http"

	"github.com/boojack/shortify/api"
	"github.com/labstack/echo/v4"
)

func (s *Server) registerRedirectRoutes(g *echo.Group) {
	g.GET("/:shortcutName", func(c echo.Context) error {
		ctx := c.Request().Context()
		userID, ok := c.Get(getUserIDContextKey()).(int)
		if !ok {
			return echo.NewHTTPError(http.StatusUnauthorized, "Missing user in session")
		}
		shortcutName := c.Param("shortcutName")
		if shortcutName == "" {
			return echo.NewHTTPError(http.StatusBadRequest, "Missing shortcut name")
		}

		list := []*api.Shortcut{}

		shortcutFind := &api.ShortcutFind{
			Name:     &shortcutName,
			MemberID: &userID,
		}
		shortcutFind.VisibilityList = []api.Visibility{api.VisibilityWorkspace, api.VisibilityPublic}
		visibleShortcutList, err := s.Store.FindShortcutList(ctx, shortcutFind)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch shortcut list").SetInternal(err)
		}
		list = append(list, visibleShortcutList...)

		shortcutFind.VisibilityList = []api.Visibility{api.VisibilityPrivite}
		shortcutFind.CreatorID = &userID
		privateShortcutList, err := s.Store.FindShortcutList(ctx, shortcutFind)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch private shortcut list").SetInternal(err)
		}
		list = append(list, privateShortcutList...)

		if len(list) == 0 {
			return echo.NewHTTPError(http.StatusNotFound, "Not found shortcut").SetInternal(err)
		}

		// TODO(steven): improve the matched result later
		matchedShortcut := list[0]
		return c.Redirect(http.StatusPermanentRedirect, matchedShortcut.Link)
	})
}
