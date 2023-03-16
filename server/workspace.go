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

func (s *Server) registerWorkspaceRoutes(g *echo.Group) {
	g.POST("/workspace", func(c echo.Context) error {
		ctx := c.Request().Context()
		userID, ok := c.Get(getUserIDContextKey()).(int)
		if !ok {
			return echo.NewHTTPError(http.StatusUnauthorized, "Missing auth session")
		}

		workspaceCreate := &api.WorkspaceCreate{
			CreatorID: userID,
		}
		if err := json.NewDecoder(c.Request().Body).Decode(workspaceCreate); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Malformatted post workspace request").SetInternal(err)
		}
		if len(workspaceCreate.Name) > 20 {
			return echo.NewHTTPError(http.StatusBadRequest, "Workspace name length should be less than 20")
		}

		workspace, err := s.Store.CreateWorkspace(ctx, workspaceCreate)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to create workspace").SetInternal(err)
		}

		_, err = s.Store.UpsertWorkspaceUser(ctx, &api.WorkspaceUserUpsert{
			WorkspaceID: workspace.ID,
			UserID:      userID,
			Role:        api.RoleAdmin,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to create workspace user").SetInternal(err)
		}

		if err := s.Store.ComposeWorkspaceUserListForWorkspace(ctx, workspace); err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to compose workspace user list").SetInternal(err)
		}

		return c.JSON(http.StatusOK, composeResponse(workspace))
	})

	g.GET("/workspace", func(c echo.Context) error {
		ctx := c.Request().Context()
		userID, ok := c.Get(getUserIDContextKey()).(int)
		if !ok {
			return echo.NewHTTPError(http.StatusUnauthorized, "Missing auth session")
		}

		workspaceFind := &api.WorkspaceFind{
			MemberID: &userID,
		}
		workspaceList, err := s.Store.FindWordspaceList(ctx, workspaceFind)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch workspace list").SetInternal(err)
		}

		for _, workspace := range workspaceList {
			if err := s.Store.ComposeWorkspaceUserListForWorkspace(ctx, workspace); err != nil {
				return echo.NewHTTPError(http.StatusInternalServerError, "Failed to compose workspace user list").SetInternal(err)
			}
		}

		return c.JSON(http.StatusOK, composeResponse(workspaceList))
	})

	g.GET("/workspace/:id", func(c echo.Context) error {
		ctx := c.Request().Context()
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Malformatted workspace id").SetInternal(err)
		}

		workspace, err := s.Store.FindWorkspace(ctx, &api.WorkspaceFind{
			ID: &id,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to find workspace").SetInternal(err)
		}

		if err := s.Store.ComposeWorkspaceUserListForWorkspace(ctx, workspace); err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to compose workspace user list").SetInternal(err)
		}

		return c.JSON(http.StatusOK, composeResponse(workspace))
	})

	g.GET("/workspace/:workspaceName/shortcut/:shortcutName", func(c echo.Context) error {
		ctx := c.Request().Context()
		workspaceName := c.Param("workspaceName")
		shortcutName := c.Param("shortcutName")
		if workspaceName == "" || shortcutName == "" {
			return echo.NewHTTPError(http.StatusBadRequest, "Missing workspace name or shortcut name")
		}

		workspace, err := s.Store.FindWorkspace(ctx, &api.WorkspaceFind{
			Name: &workspaceName,
		})
		if err != nil {
			if common.ErrorCode(err) == common.NotFound {
				return echo.NewHTTPError(http.StatusNotFound, fmt.Sprintf("workspace not found by name %s", workspaceName))
			}
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Errorf("failed to find workspace with name %s", workspaceName)).SetInternal(err)
		}

		shortcut, err := s.Store.FindShortcut(ctx, &api.ShortcutFind{
			WorkspaceID: &workspace.ID,
			Name:        &shortcutName,
		})
		if err != nil {
			if common.ErrorCode(err) == common.NotFound {
				return echo.NewHTTPError(http.StatusNotFound, fmt.Sprintf("shortcut not found by name %s", shortcutName))
			}
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Errorf("failed to find shortcut with name %s", shortcutName)).SetInternal(err)
		}

		if shortcut.Visibility != api.VisibilityPublic {
			userID, ok := c.Get(getUserIDContextKey()).(int)
			if !ok {
				return echo.NewHTTPError(http.StatusUnauthorized, "Missing user in session")
			}

			if shortcut.Visibility == api.VisibilityPrivite && shortcut.CreatorID != userID {
				return echo.NewHTTPError(http.StatusUnauthorized, "not shortcut owner")
			}

			workspaceUser, err := s.Store.FindWordspaceUser(ctx, &api.WorkspaceUserFind{
				WorkspaceID: &workspace.ID,
				UserID:      &userID,
			})
			if err != nil {
				if common.ErrorCode(err) == common.NotFound {
					return echo.NewHTTPError(http.StatusNotFound, "workspace user not found")
				}
				return echo.NewHTTPError(http.StatusInternalServerError, "Failed to find workspace user").SetInternal(err)
			}
			if workspaceUser == nil {
				return echo.NewHTTPError(http.StatusUnauthorized, "not workspace user")
			}
		}

		return c.JSON(http.StatusOK, composeResponse(shortcut))
	})

	g.PATCH("/workspace/:id", func(c echo.Context) error {
		ctx := c.Request().Context()
		userID, ok := c.Get(getUserIDContextKey()).(int)
		if !ok {
			return echo.NewHTTPError(http.StatusUnauthorized, "Missing user in session")
		}

		workspaceID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("ID is not a number: %s", c.Param("id"))).SetInternal(err)
		}
		workspaceUser, err := s.Store.FindWordspaceUser(ctx, &api.WorkspaceUserFind{
			WorkspaceID: &workspaceID,
			UserID:      &userID,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to find workspace user").SetInternal(err)
		}
		if workspaceUser == nil {
			return echo.NewHTTPError(http.StatusUnauthorized, "not workspace user")
		}
		if workspaceUser.Role != api.RoleAdmin {
			return echo.NewHTTPError(http.StatusUnauthorized, "not workspace admin")
		}

		patch := &api.WorkspacePatch{
			ID: workspaceID,
		}
		if err := json.NewDecoder(c.Request().Body).Decode(patch); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Malformatted patch workspace request").SetInternal(err)
		}

		workspace, err := s.Store.PatchWorkspace(ctx, patch)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to patch workspace").SetInternal(err)
		}

		if err := s.Store.ComposeWorkspaceUserListForWorkspace(ctx, workspace); err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to compose workspace user list").SetInternal(err)
		}

		return c.JSON(http.StatusOK, composeResponse(workspace))
	})

	g.DELETE("/workspace/:id", func(c echo.Context) error {
		ctx := c.Request().Context()
		userID, ok := c.Get(getUserIDContextKey()).(int)
		if !ok {
			return echo.NewHTTPError(http.StatusUnauthorized, "Missing user in session")
		}
		workspaceID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("ID is not a number: %s", c.Param("id"))).SetInternal(err)
		}
		workspaceUser, err := s.Store.FindWordspaceUser(ctx, &api.WorkspaceUserFind{
			WorkspaceID: &workspaceID,
			UserID:      &userID,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to find workspace user").SetInternal(err)
		}
		if workspaceUser == nil {
			return echo.NewHTTPError(http.StatusUnauthorized, "not workspace user")
		}
		if workspaceUser.Role != api.RoleAdmin {
			return echo.NewHTTPError(http.StatusUnauthorized, "not workspace admin")
		}

		if err := s.Store.DeleteWorkspace(ctx, &api.WorkspaceDelete{
			ID: workspaceID,
		}); err != nil {
			if common.ErrorCode(err) == common.NotFound {
				return echo.NewHTTPError(http.StatusNotFound, fmt.Sprintf("User ID not found: %d", userID))
			}
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to delete user").SetInternal(err)
		}

		return c.JSON(http.StatusOK, true)
	})
}
