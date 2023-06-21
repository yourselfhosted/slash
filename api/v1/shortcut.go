package v1

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/boojack/shortify/store"

	"github.com/labstack/echo/v4"
)

// Visibility is the type of a visibility.
type Visibility string

const (
	// VisibilityPublic is the PUBLIC visibility.
	VisibilityPublic Visibility = "PUBLIC"
	// VisibilityWorkspace is the WORKSPACE visibility.
	VisibilityWorkspace Visibility = "WORKSPACE"
	// VisibilityPrivate is the PRIVATE visibility.
	VisibilityPrivate Visibility = "PRIVATE"
)

func (e Visibility) String() string {
	switch e {
	case VisibilityPublic:
		return "PUBLIC"
	case VisibilityWorkspace:
		return "WORKSPACE"
	case VisibilityPrivate:
		return "PRIVATE"
	}
	return "PRIVATE"
}

type Shortcut struct {
	ID int `json:"id"`

	// Standard fields
	CreatorID int       `json:"creatorId"`
	Creator   *User     `json:"creator"`
	CreatedTs int64     `json:"createdTs"`
	UpdatedTs int64     `json:"updatedTs"`
	RowStatus RowStatus `json:"rowStatus"`

	// Domain specific fields
	Name        string     `json:"name"`
	Link        string     `json:"link"`
	Description string     `json:"description"`
	Visibility  Visibility `json:"visibility"`
}

type CreateShortcutRequest struct {
	Name        string     `json:"name"`
	Link        string     `json:"link"`
	Description string     `json:"description"`
	Visibility  Visibility `json:"visibility"`
}

type PatchShortcutRequest struct {
	RowStatus   *RowStatus  `json:"rowStatus"`
	Name        *string     `json:"name"`
	Link        *string     `json:"link"`
	Description *string     `json:"description"`
	Visibility  *Visibility `json:"visibility"`
}

func (s *APIV1Service) registerShortcutRoutes(g *echo.Group) {
	g.POST("/shortcut", func(c echo.Context) error {
		ctx := c.Request().Context()
		userID, ok := c.Get(getUserIDContextKey()).(int)
		if !ok {
			return echo.NewHTTPError(http.StatusUnauthorized, "Missing user in session")
		}
		create := &CreateShortcutRequest{}
		if err := json.NewDecoder(c.Request().Body).Decode(create); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Malformatted post shortcut request").SetInternal(err)
		}

		shortcut, err := s.Store.CreateShortcut(ctx, &store.Shortcut{
			CreatorID:   userID,
			Name:        create.Name,
			Link:        create.Link,
			Description: create.Description,
			Visibility:  convertVisibilityToStore(create.Visibility),
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to create shortcut").SetInternal(err)
		}

		return c.JSON(http.StatusOK, shortcut)
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

		shortcut, err := s.Store.GetShortcut(ctx, &store.FindShortcut{
			ID: &shortcutID,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to find shortcut").SetInternal(err)
		}
		if shortcut == nil {
			return echo.NewHTTPError(http.StatusNotFound, "Shortcut not found")
		}
		if shortcut.CreatorID != userID {
			return echo.NewHTTPError(http.StatusForbidden, "Shortcut does not belong to user")
		}

		patch := &PatchShortcutRequest{}
		if err := json.NewDecoder(c.Request().Body).Decode(patch); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Malformatted patch shortcut request").SetInternal(err)
		}

		shortcut, err = s.Store.UpdateShortcut(ctx, &store.UpdateShortcut{
			ID:         shortcutID,
			RowStatus:  (*store.RowStatus)(patch.RowStatus),
			Name:       patch.Name,
			Link:       patch.Link,
			Visibility: (*store.Visibility)(patch.Visibility),
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to patch shortcut").SetInternal(err)
		}

		return c.JSON(http.StatusOK, shortcut)
	})

	g.GET("/shortcut", func(c echo.Context) error {
		ctx := c.Request().Context()
		userID, ok := c.Get(getUserIDContextKey()).(int)
		if !ok {
			return echo.NewHTTPError(http.StatusUnauthorized, "Missing user in session")
		}

		find := &store.FindShortcut{}
		if name := c.QueryParam("name"); name != "" {
			find.Name = &name
		}

		list := []*store.Shortcut{}
		find.VisibilityList = []store.Visibility{store.VisibilityWorkspace, store.VisibilityPublic}
		visibleShortcutList, err := s.Store.ListShortcuts(ctx, find)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch shortcut list").SetInternal(err)
		}
		list = append(list, visibleShortcutList...)

		find.VisibilityList = []store.Visibility{store.VisibilityPrivate}
		find.CreatorID = &userID
		privateShortcutList, err := s.Store.ListShortcuts(ctx, find)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch private shortcut list").SetInternal(err)
		}
		list = append(list, privateShortcutList...)

		return c.JSON(http.StatusOK, list)
	})

	g.GET("/shortcut/:id", func(c echo.Context) error {
		ctx := c.Request().Context()
		shortcutID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("ID is not a number: %s", c.Param("id"))).SetInternal(err)
		}

		shortcut, err := s.Store.GetShortcut(ctx, &store.FindShortcut{
			ID: &shortcutID,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("Failed to fetch shortcut by ID %d", shortcutID)).SetInternal(err)
		}

		return c.JSON(http.StatusOK, shortcut)
	})

	g.DELETE("/shortcut/:id", func(c echo.Context) error {
		ctx := c.Request().Context()
		shortcutID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("ID is not a number: %s", c.Param("id"))).SetInternal(err)
		}

		if err := s.Store.DeleteShortcut(ctx, &store.DeleteShortcut{
			ID: shortcutID,
		}); err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to delete shortcut").SetInternal(err)
		}

		return c.JSON(http.StatusOK, true)
	})
}

func convertVisibilityToStore(visibility Visibility) store.Visibility {
	switch visibility {
	case VisibilityPrivate:
		return store.VisibilityPrivate
	case VisibilityWorkspace:
		return store.VisibilityWorkspace
	case VisibilityPublic:
		return store.VisibilityPublic
	default:
		return store.VisibilityPrivate
	}
}
