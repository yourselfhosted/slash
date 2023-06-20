package v1

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/boojack/shortify/store"

	"github.com/labstack/echo/v4"
)

type WorkspaceUser struct {
	WorkspaceID int  `json:"workspaceId"`
	UserID      int  `json:"userId"`
	Role        Role `json:"role"`

	// Related fields
	Username string `json:"username"`
	Nickname string `json:"nickname"`
}

type UpsertWorkspaceUserRequest struct {
	WorkspaceID int  `json:"workspaceId"`
	UserID      int  `json:"userId"`
	Role        Role `json:"role"`
}

func (s *APIV1Service) registerWorkspaceUserRoutes(g *echo.Group) {
	g.POST("/workspace/:id/user", func(c echo.Context) error {
		ctx := c.Request().Context()
		userID, ok := c.Get(getUserIDContextKey()).(int)
		if !ok {
			return echo.NewHTTPError(http.StatusUnauthorized, "Missing auth session")
		}

		workspaceID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Malformatted workspace id").SetInternal(err)
		}

		currentWorkspaceUser, err := s.Store.GetWorkspaceUser(ctx, &store.FindWorkspaceUser{
			WorkspaceID: &workspaceID,
			UserID:      &userID,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to find workspace user").SetInternal(err)
		}
		if currentWorkspaceUser.Role != store.RoleAdmin {
			return echo.NewHTTPError(http.StatusForbidden, "Access forbidden to add workspace user").SetInternal(err)
		}

		upsert := &UpsertWorkspaceUserRequest{
			WorkspaceID: workspaceID,
		}
		if err := json.NewDecoder(c.Request().Body).Decode(upsert); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Malformatted post workspace user request").SetInternal(err)
		}

		workspaceUser, err := s.Store.UpsertWorkspaceUserV1(ctx, &store.WorkspaceUser{
			WorkspaceID: upsert.WorkspaceID,
			UserID:      upsert.UserID,
			Role:        convertRoleToStore(upsert.Role),
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to upsert workspace user").SetInternal(err)
		}

		composedWorkspaceUser, err := s.composeWorkspaceUser(ctx, workspaceUser)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to compose workspace user").SetInternal(err)
		}

		return c.JSON(http.StatusOK, composedWorkspaceUser)
	})

	g.GET("/workspace/:id/user", func(c echo.Context) error {
		ctx := c.Request().Context()
		workspaceID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Malformatted workspace id").SetInternal(err)
		}

		workspaceUserList, err := s.Store.ListWorkspaceUsers(ctx, &store.FindWorkspaceUser{
			WorkspaceID: &workspaceID,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to find workspace user list").SetInternal(err)
		}

		composedList := make([]*WorkspaceUser, 0, len(workspaceUserList))
		for _, workspaceUser := range workspaceUserList {
			composedWorkspaceUser, err := s.composeWorkspaceUser(ctx, workspaceUser)
			if err != nil {
				return echo.NewHTTPError(http.StatusInternalServerError, "Failed to compose workspace user").SetInternal(err)
			}
			composedList = append(composedList, composedWorkspaceUser)
		}

		return c.JSON(http.StatusOK, composedList)
	})

	g.GET("/workspace/:workspaceId/user/:userId", func(c echo.Context) error {
		ctx := c.Request().Context()
		workspaceID, err := strconv.Atoi(c.Param("workspaceId"))
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Malformatted workspace id").SetInternal(err)
		}
		userID, err := strconv.Atoi(c.Param("userId"))
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Malformatted user id").SetInternal(err)
		}

		workspaceUser, err := s.Store.GetWorkspaceUser(ctx, &store.FindWorkspaceUser{
			WorkspaceID: &workspaceID,
			UserID:      &userID,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to find workspace user").SetInternal(err)
		}

		composedWorkspaceUser, err := s.composeWorkspaceUser(ctx, workspaceUser)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to compose workspace user").SetInternal(err)
		}

		return c.JSON(http.StatusOK, composedWorkspaceUser)
	})

	g.DELETE("/workspace/:workspaceId/user/:userId", func(c echo.Context) error {
		ctx := c.Request().Context()
		currentUserID, ok := c.Get(getUserIDContextKey()).(int)
		if !ok {
			return echo.NewHTTPError(http.StatusUnauthorized, "Missing auth session")
		}

		workspaceID, err := strconv.Atoi(c.Param("workspaceId"))
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Malformatted workspace id").SetInternal(err)
		}

		userID, err := strconv.Atoi(c.Param("userId"))
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Malformatted user id").SetInternal(err)
		}

		currentWorkspaceUser, err := s.Store.GetWorkspaceUser(ctx, &store.FindWorkspaceUser{
			WorkspaceID: &workspaceID,
			UserID:      &currentUserID,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to find workspace user").SetInternal(err)
		}
		if currentUserID != userID && currentWorkspaceUser.Role != store.RoleAdmin {
			return echo.NewHTTPError(http.StatusForbidden, "Access forbidden to delete workspace user").SetInternal(err)
		}

		if err := s.Store.DeleteWorkspaceUserV1(ctx, &store.DeleteWorkspaceUser{
			WorkspaceID: workspaceID,
			UserID:      userID,
		}); err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to delete workspace user").SetInternal(err)
		}

		return c.JSON(http.StatusOK, true)
	})
}

func convertRoleToStore(role Role) store.Role {
	switch role {
	case RoleAdmin:
		return store.RoleAdmin
	case RoleUser:
		return store.RoleUser
	default:
		return store.RoleUser
	}
}

func convertRoleFromStore(role store.Role) Role {
	switch role {
	case store.RoleAdmin:
		return RoleAdmin
	case store.RoleUser:
		return RoleUser
	default:
		return RoleUser
	}
}

func (s *APIV1Service) composeWorkspaceUser(ctx context.Context, workspaceUser *store.WorkspaceUser) (*WorkspaceUser, error) {
	user, err := s.Store.GetUser(ctx, &store.FindUser{
		ID: &workspaceUser.UserID,
	})
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, fmt.Errorf("Failed to find user %d", workspaceUser.UserID)
	}

	composedWorkspaceUser := &WorkspaceUser{
		WorkspaceID: workspaceUser.WorkspaceID,
		UserID:      workspaceUser.UserID,
		Role:        convertRoleFromStore(workspaceUser.Role),
		Username:    user.Username,
		Nickname:    user.Nickname,
	}

	return composedWorkspaceUser, nil
}
