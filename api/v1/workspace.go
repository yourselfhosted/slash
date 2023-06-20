package v1

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/boojack/shortify/store"

	"github.com/labstack/echo/v4"
)

type Workspace struct {
	ID int `json:"id"`

	// Standard fields
	CreatorID int       `json:"creatorId"`
	CreatedTs int64     `json:"createdTs"`
	UpdatedTs int64     `json:"updatedTs"`
	RowStatus RowStatus `json:"rowStatus"`

	// Domain specific fields
	Name        string `json:"name"`
	Title       string `json:"title"`
	Description string `json:"description"`
}

type CreateWorkspaceRequest struct {
	Name        string `json:"name"`
	Title       string `json:"title"`
	Description string `json:"description"`
}

type PatchWorkspaceRequest struct {
	RowStatus   *RowStatus `json:"rowStatus"`
	Name        *string    `json:"name"`
	Title       *string    `json:"title"`
	Description *string    `json:"description"`
}

type WorkspaceFind struct {
	ID *int `json:"id"`

	// Standard fields
	RowStatus *RowStatus `json:"rowStatus"`

	// Domain specific fields
	Name *string `json:"name"`

	// Related fields
	MemberID *int
}

type WorkspaceDelete struct {
	ID int
}

func (s *APIV1Service) registerWorkspaceRoutes(g *echo.Group) {
	g.POST("/workspace", func(c echo.Context) error {
		ctx := c.Request().Context()
		userID, ok := c.Get(getUserIDContextKey()).(int)
		if !ok {
			return echo.NewHTTPError(http.StatusUnauthorized, "Missing auth session")
		}

		create := &CreateWorkspaceRequest{}
		if err := json.NewDecoder(c.Request().Body).Decode(create); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Malformatted post workspace request").SetInternal(err)
		}
		if len(create.Name) > 24 {
			return echo.NewHTTPError(http.StatusBadRequest, "Workspace name length should be less than 24")
		}

		workspace, err := s.Store.CreateWorkspace(ctx, &store.Workspace{
			ResourceID:  create.Name,
			Title:       create.Title,
			Description: create.Description,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to create workspace").SetInternal(err)
		}

		_, err = s.Store.UpsertWorkspaceUserV1(ctx, &store.WorkspaceUser{
			WorkspaceID: workspace.ID,
			UserID:      userID,
			Role:        store.RoleAdmin,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to create workspace user").SetInternal(err)
		}

		return c.JSON(http.StatusOK, workspace)
	})

	g.GET("/workspace/:id", func(c echo.Context) error {
		ctx := c.Request().Context()
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Malformatted workspace id").SetInternal(err)
		}

		workspace, err := s.Store.GetWorkspace(ctx, &store.FindWorkspace{
			ID: &id,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to find workspace").SetInternal(err)
		}

		return c.JSON(http.StatusOK, workspace)
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
		workspaceUser, err := s.Store.GetWorkspaceUser(ctx, &store.FindWorkspaceUser{
			WorkspaceID: &workspaceID,
			UserID:      &userID,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to find workspace user").SetInternal(err)
		}
		if workspaceUser == nil {
			return echo.NewHTTPError(http.StatusUnauthorized, "Current user is not a member of the workspace")
		}
		if workspaceUser.Role != store.RoleAdmin {
			return echo.NewHTTPError(http.StatusUnauthorized, "Current user is not an admin of the workspace")
		}

		patch := &PatchWorkspaceRequest{}
		if err := json.NewDecoder(c.Request().Body).Decode(patch); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Malformatted patch workspace request").SetInternal(err)
		}

		workspace, err := s.Store.UpdateWorkspace(ctx, &store.UpdateWorkspace{
			ID:          workspaceID,
			RowStatus:   (*store.RowStatus)(patch.RowStatus),
			ResourceID:  patch.Name,
			Title:       patch.Title,
			Description: patch.Description,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to patch workspace").SetInternal(err)
		}

		return c.JSON(http.StatusOK, workspace)
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
		workspaceUser, err := s.Store.GetWorkspaceUser(ctx, &store.FindWorkspaceUser{
			WorkspaceID: &workspaceID,
			UserID:      &userID,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to find workspace user").SetInternal(err)
		}
		if workspaceUser == nil {
			return echo.NewHTTPError(http.StatusUnauthorized, "not workspace user")
		}
		if workspaceUser.Role != store.RoleAdmin {
			return echo.NewHTTPError(http.StatusUnauthorized, "not workspace admin")
		}

		if err := s.Store.DeleteWorkspace(ctx, &store.DeleteWorkspace{
			ID: workspaceID,
		}); err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to delete user").SetInternal(err)
		}

		return c.JSON(http.StatusOK, true)
	})
}
