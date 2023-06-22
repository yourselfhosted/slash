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

		shortcutMessage, err := s.composeShortcut(ctx, convertShortcutFromStore(shortcut))
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to compose shortcut").SetInternal(err)
		}
		return c.JSON(http.StatusOK, shortcutMessage)
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

		shortcutUpdate := &store.UpdateShortcut{
			ID:          shortcutID,
			Name:        patch.Name,
			Link:        patch.Link,
			Description: patch.Description,
		}
		if patch.RowStatus != nil {
			shortcutUpdate.RowStatus = (*store.RowStatus)(patch.RowStatus)
		}
		if patch.Visibility != nil {
			shortcutUpdate.Visibility = (*store.Visibility)(patch.Visibility)
		}
		shortcut, err = s.Store.UpdateShortcut(ctx, shortcutUpdate)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to patch shortcut").SetInternal(err)
		}

		shortcutMessage, err := s.composeShortcut(ctx, convertShortcutFromStore(shortcut))
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to compose shortcut").SetInternal(err)
		}
		return c.JSON(http.StatusOK, shortcutMessage)
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

		shortcutMessageList := []*Shortcut{}
		for _, shortcut := range list {
			shortcutMessage, err := s.composeShortcut(ctx, convertShortcutFromStore(shortcut))
			if err != nil {
				return echo.NewHTTPError(http.StatusInternalServerError, "Failed to compose shortcut").SetInternal(err)
			}
			shortcutMessageList = append(shortcutMessageList, shortcutMessage)
		}
		return c.JSON(http.StatusOK, shortcutMessageList)
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

		shortcutMessage, err := s.composeShortcut(ctx, convertShortcutFromStore(shortcut))
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to compose shortcut").SetInternal(err)
		}
		return c.JSON(http.StatusOK, shortcutMessage)
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

func (s *APIV1Service) composeShortcut(ctx context.Context, shortcut *Shortcut) (*Shortcut, error) {
	if shortcut == nil {
		return nil, nil
	}

	user, err := s.Store.GetUser(ctx, &store.FindUser{
		ID: &shortcut.CreatorID,
	})
	if err != nil {
		return nil, err
	}
	shortcut.Creator = convertUserFromStore(user)
	return shortcut, nil
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

func convertShortcutFromStore(shortcut *store.Shortcut) *Shortcut {
	return &Shortcut{
		ID:          shortcut.ID,
		CreatedTs:   shortcut.CreatedTs,
		UpdatedTs:   shortcut.UpdatedTs,
		CreatorID:   shortcut.CreatorID,
		Name:        shortcut.Name,
		Link:        shortcut.Link,
		Description: shortcut.Description,
		Visibility:  Visibility(shortcut.Visibility),
		RowStatus:   RowStatus(shortcut.RowStatus),
	}
}
