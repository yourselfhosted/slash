package server

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/boojack/shortify/api"
	"github.com/boojack/shortify/common"

	"github.com/labstack/echo/v4"
)

func (s *Server) registerShortcutRoutes(g *echo.Group) {
	g.POST("/shortcut", func(c echo.Context) error {
		ctx := c.Request().Context()
		userID, ok := c.Get(getUserIDContextKey()).(int)
		if !ok {
			return echo.NewHTTPError(http.StatusUnauthorized, "Missing user in session")
		}
		shortcutCreate := &api.ShortcutCreate{
			CreatorID: userID,
		}
		if err := json.NewDecoder(c.Request().Body).Decode(shortcutCreate); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Malformatted post shortcut request").SetInternal(err)
		}

		existingShortcut, err := s.Store.FindShortcut(ctx, &api.ShortcutFind{
			Name:        &shortcutCreate.Name,
			WorkspaceID: &shortcutCreate.WorkspaceID,
		})
		if err != nil && common.ErrorCode(err) != common.NotFound {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to find shortcut").SetInternal(err)
		}
		if existingShortcut != nil {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Shortcut with name %s already exists", shortcutCreate.Name))
		}

		shortcut, err := s.Store.CreateShortcut(ctx, shortcutCreate)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to create shortcut").SetInternal(err)
		}

		if err := s.Store.ComposeShortcut(ctx, shortcut); err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to compose shortcut").SetInternal(err)
		}

		return c.JSON(http.StatusOK, composeResponse(shortcut))
	})

	g.PATCH("/shortcut/:shortcutId", func(c echo.Context) error {
		ctx := c.Request().Context()
		shortcutID, err := strconv.Atoi(c.Param("shortcutId"))
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("ID is not a number: %s", c.Param("shortcutId"))).SetInternal(err)
		}
		userID, ok := c.Get(getUserIDContextKey()).(int)
		if !ok {
			return echo.NewHTTPError(http.StatusUnauthorized, "Missing user in session")
		}

		shortcut, err := s.Store.FindShortcut(ctx, &api.ShortcutFind{
			ID: &shortcutID,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to find shortcut").SetInternal(err)
		}

		workspaceUser, err := s.Store.FindWordspaceUser(ctx, &api.WorkspaceUserFind{
			UserID:      &userID,
			WorkspaceID: &shortcut.WorkspaceID,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to find workspace user").SetInternal(err)
		}

		if shortcut.CreatorID != userID && workspaceUser.Role != api.RoleAdmin {
			return echo.NewHTTPError(http.StatusForbidden, "Forbidden to patch shortcut")
		}

		shortcutPatch := &api.ShortcutPatch{
			ID: shortcutID,
		}
		if err := json.NewDecoder(c.Request().Body).Decode(shortcutPatch); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Malformatted patch shortcut request").SetInternal(err)
		}

		shortcut, err = s.Store.PatchShortcut(ctx, shortcutPatch)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to patch shortcut").SetInternal(err)
		}

		if err := s.Store.ComposeShortcut(ctx, shortcut); err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to compose shortcut").SetInternal(err)
		}

		return c.JSON(http.StatusOK, composeResponse(shortcut))
	})

	g.GET("/shortcut", func(c echo.Context) error {
		ctx := c.Request().Context()
		userID, ok := c.Get(getUserIDContextKey()).(int)
		if !ok {
			return echo.NewHTTPError(http.StatusUnauthorized, "Missing user in session")
		}

		shortcutFind := &api.ShortcutFind{}
		if workspaceID, err := strconv.Atoi(c.QueryParam("workspaceId")); err == nil {
			shortcutFind.WorkspaceID = &workspaceID
		}
		if name := c.QueryParam("name"); name != "" {
			shortcutFind.Name = &name
		}
		if link := c.QueryParam("link"); link != "" {
			shortcutFind.Link = &link
		}

		list := []*api.Shortcut{}

		if shortcutFind.WorkspaceID == nil {
			shortcutFind.MemberID = &userID
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

		for _, shortcut := range list {
			if err := s.Store.ComposeShortcut(ctx, shortcut); err != nil {
				return echo.NewHTTPError(http.StatusInternalServerError, "Failed to compose shortcut").SetInternal(err)
			}
		}

		return c.JSON(http.StatusOK, composeResponse(list))
	})

	g.GET("/shortcut/:id", func(c echo.Context) error {
		ctx := c.Request().Context()
		shortcutID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("ID is not a number: %s", c.Param("id"))).SetInternal(err)
		}

		shortcutFind := &api.ShortcutFind{
			ID: &shortcutID,
		}
		shortcut, err := s.Store.FindShortcut(ctx, shortcutFind)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("Failed to fetch shortcut by ID %d", *shortcutFind.ID)).SetInternal(err)
		}

		if err := s.Store.ComposeShortcut(ctx, shortcut); err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to compose shortcut").SetInternal(err)
		}

		return c.JSON(http.StatusOK, composeResponse(shortcut))
	})

	g.DELETE("/shortcut/:id", func(c echo.Context) error {
		ctx := c.Request().Context()
		shortcutID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("ID is not a number: %s", c.Param("id"))).SetInternal(err)
		}

		shortcutDelete := &api.ShortcutDelete{
			ID: &shortcutID,
		}
		if err := s.Store.DeleteShortcut(ctx, shortcutDelete); err != nil {
			if common.ErrorCode(err) == common.NotFound {
				return echo.NewHTTPError(http.StatusNotFound, fmt.Sprintf("Shortcut ID not found: %d", shortcutID))
			}
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to delete shortcut").SetInternal(err)
		}

		return c.JSON(http.StatusOK, true)
	})
}
