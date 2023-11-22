package v1

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/pkg/errors"

	"github.com/boojack/slash/internal/util"
	storepb "github.com/boojack/slash/proto/gen/store"
	"github.com/boojack/slash/server/metric"
	"github.com/boojack/slash/store"
)

// Visibility is the type of a shortcut visibility.
type Visibility string

const (
	// VisibilityPublic is the PUBLIC visibility.
	VisibilityPublic Visibility = "PUBLIC"
	// VisibilityWorkspace is the WORKSPACE visibility.
	VisibilityWorkspace Visibility = "WORKSPACE"
	// VisibilityPrivate is the PRIVATE visibility.
	VisibilityPrivate Visibility = "PRIVATE"
)

func (v Visibility) String() string {
	return string(v)
}

type OpenGraphMetadata struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Image       string `json:"image"`
}

type Shortcut struct {
	ID int32 `json:"id"`

	// Standard fields
	CreatorID int32     `json:"creatorId"`
	Creator   *User     `json:"creator"`
	CreatedTs int64     `json:"createdTs"`
	UpdatedTs int64     `json:"updatedTs"`
	RowStatus RowStatus `json:"rowStatus"`

	// Domain specific fields
	Name              string             `json:"name"`
	Link              string             `json:"link"`
	Title             string             `json:"title"`
	Description       string             `json:"description"`
	Visibility        Visibility         `json:"visibility"`
	Tags              []string           `json:"tags"`
	View              int                `json:"view"`
	OpenGraphMetadata *OpenGraphMetadata `json:"openGraphMetadata"`
}

type CreateShortcutRequest struct {
	Name              string             `json:"name"`
	Link              string             `json:"link"`
	Title             string             `json:"title"`
	Description       string             `json:"description"`
	Visibility        Visibility         `json:"visibility"`
	Tags              []string           `json:"tags"`
	OpenGraphMetadata *OpenGraphMetadata `json:"openGraphMetadata"`
}

type PatchShortcutRequest struct {
	RowStatus         *RowStatus         `json:"rowStatus"`
	Name              *string            `json:"name"`
	Link              *string            `json:"link"`
	Title             *string            `json:"title"`
	Description       *string            `json:"description"`
	Visibility        *Visibility        `json:"visibility"`
	Tags              []string           `json:"tags"`
	OpenGraphMetadata *OpenGraphMetadata `json:"openGraphMetadata"`
}

func (s *APIV1Service) registerShortcutRoutes(g *echo.Group) {
	g.POST("/shortcut", func(c echo.Context) error {
		ctx := c.Request().Context()
		userID, ok := c.Get(userIDContextKey).(int32)
		if !ok {
			return echo.NewHTTPError(http.StatusUnauthorized, "missing user in session")
		}
		create := &CreateShortcutRequest{}
		if err := json.NewDecoder(c.Request().Body).Decode(create); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("malformatted post shortcut request, err: %s", err)).SetInternal(err)
		}

		shortcut := &storepb.Shortcut{
			CreatorId:   userID,
			Name:        create.Name,
			Link:        create.Link,
			Title:       create.Title,
			Description: create.Description,
			Visibility:  convertVisibilityToStorepb(create.Visibility),
			Tags:        create.Tags,
			OgMetadata:  &storepb.OpenGraphMetadata{},
		}
		if create.Name == "" {
			return echo.NewHTTPError(http.StatusBadRequest, "name is required")
		}
		if create.OpenGraphMetadata != nil {
			shortcut.OgMetadata = &storepb.OpenGraphMetadata{
				Title:       create.OpenGraphMetadata.Title,
				Description: create.OpenGraphMetadata.Description,
				Image:       create.OpenGraphMetadata.Image,
			}
		}
		shortcut, err := s.Store.CreateShortcut(ctx, shortcut)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to create shortcut, err: %s", err)).SetInternal(err)
		}

		if err := s.createShortcutCreateActivity(ctx, shortcut); err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to create shortcut activity, err: %s", err)).SetInternal(err)
		}

		shortcutMessage, err := s.composeShortcut(ctx, convertShortcutFromStorepb(shortcut))
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to compose shortcut, err: %s", err)).SetInternal(err)
		}
		metric.Enqueue("shortcut create")
		return c.JSON(http.StatusOK, shortcutMessage)
	})

	g.PATCH("/shortcut/:shortcutId", func(c echo.Context) error {
		ctx := c.Request().Context()
		shortcutID, err := util.ConvertStringToInt32(c.Param("shortcutId"))
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("shortcut ID is not a number: %s", c.Param("shortcutId"))).SetInternal(err)
		}
		userID, ok := c.Get(userIDContextKey).(int32)
		if !ok {
			return echo.NewHTTPError(http.StatusUnauthorized, "missing user in session")
		}
		currentUser, err := s.Store.GetUser(ctx, &store.FindUser{
			ID: &userID,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to find user, err: %s", err)).SetInternal(err)
		}

		shortcut, err := s.Store.GetShortcut(ctx, &store.FindShortcut{
			ID: &shortcutID,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to find shortcut, err: %s", err)).SetInternal(err)
		}
		if shortcut == nil {
			return echo.NewHTTPError(http.StatusNotFound, fmt.Sprintf("not found shortcut with id: %d", shortcutID))
		}
		if shortcut.CreatorId != userID && currentUser.Role != store.RoleAdmin {
			return echo.NewHTTPError(http.StatusForbidden, "unauthorized to update shortcut")
		}

		patch := &PatchShortcutRequest{}
		if err := json.NewDecoder(c.Request().Body).Decode(patch); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("failed to decode patch shortcut request, err: %s", err)).SetInternal(err)
		}

		shortcutUpdate := &store.UpdateShortcut{
			ID:          shortcutID,
			Name:        patch.Name,
			Link:        patch.Link,
			Title:       patch.Title,
			Description: patch.Description,
		}
		if patch.RowStatus != nil {
			shortcutUpdate.RowStatus = (*store.RowStatus)(patch.RowStatus)
		}
		if patch.Visibility != nil {
			shortcutUpdate.Visibility = (*store.Visibility)(patch.Visibility)
		}
		if patch.Tags != nil {
			tag := strings.Join(patch.Tags, " ")
			shortcutUpdate.Tag = &tag
		}
		if patch.OpenGraphMetadata != nil {
			shortcutUpdate.OpenGraphMetadata = &storepb.OpenGraphMetadata{
				Title:       patch.OpenGraphMetadata.Title,
				Description: patch.OpenGraphMetadata.Description,
				Image:       patch.OpenGraphMetadata.Image,
			}
		}
		shortcut, err = s.Store.UpdateShortcut(ctx, shortcutUpdate)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to patch shortcut, err: %s", err)).SetInternal(err)
		}

		shortcutMessage, err := s.composeShortcut(ctx, convertShortcutFromStorepb(shortcut))
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to compose shortcut, err: %s", err)).SetInternal(err)
		}
		return c.JSON(http.StatusOK, shortcutMessage)
	})

	g.GET("/shortcut", func(c echo.Context) error {
		ctx := c.Request().Context()
		userID, ok := c.Get(userIDContextKey).(int32)
		if !ok {
			return echo.NewHTTPError(http.StatusUnauthorized, "missing user in session")
		}

		find := &store.FindShortcut{}
		if tag := c.QueryParam("tag"); tag != "" {
			find.Tag = &tag
		}

		list := []*storepb.Shortcut{}
		find.VisibilityList = []store.Visibility{store.VisibilityWorkspace, store.VisibilityPublic}
		visibleShortcutList, err := s.Store.ListShortcuts(ctx, find)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to fetch shortcut list, err: %s", err)).SetInternal(err)
		}
		list = append(list, visibleShortcutList...)

		find.VisibilityList = []store.Visibility{store.VisibilityPrivate}
		find.CreatorID = &userID
		privateShortcutList, err := s.Store.ListShortcuts(ctx, find)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to fetch private shortcut list, err: %s", err)).SetInternal(err)
		}
		list = append(list, privateShortcutList...)

		shortcutMessageList := []*Shortcut{}
		for _, shortcut := range list {
			shortcutMessage, err := s.composeShortcut(ctx, convertShortcutFromStorepb(shortcut))
			if err != nil {
				return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to compose shortcut, err: %s", err)).SetInternal(err)
			}
			shortcutMessageList = append(shortcutMessageList, shortcutMessage)
		}
		return c.JSON(http.StatusOK, shortcutMessageList)
	})

	g.GET("/shortcut/:id", func(c echo.Context) error {
		ctx := c.Request().Context()
		shortcutID, err := util.ConvertStringToInt32(c.Param("id"))
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("shortcut id is not a number: %s", c.Param("id"))).SetInternal(err)
		}

		shortcut, err := s.Store.GetShortcut(ctx, &store.FindShortcut{
			ID: &shortcutID,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to fetch shortcut by id, err: %s", err)).SetInternal(err)
		}
		if shortcut == nil {
			return echo.NewHTTPError(http.StatusNotFound, fmt.Sprintf("not found shortcut with id: %d", shortcutID))
		}

		shortcutMessage, err := s.composeShortcut(ctx, convertShortcutFromStorepb(shortcut))
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to compose shortcut, err: %s", err)).SetInternal(err)
		}
		return c.JSON(http.StatusOK, shortcutMessage)
	})

	g.DELETE("/shortcut/:id", func(c echo.Context) error {
		ctx := c.Request().Context()
		shortcutID, err := util.ConvertStringToInt32(c.Param("id"))
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("shortcut id is not a number: %s", c.Param("id"))).SetInternal(err)
		}
		userID, ok := c.Get(userIDContextKey).(int32)
		if !ok {
			return echo.NewHTTPError(http.StatusUnauthorized, "missing user in session")
		}
		currentUser, err := s.Store.GetUser(ctx, &store.FindUser{
			ID: &userID,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to find user, err: %s", err)).SetInternal(err)
		}

		shortcut, err := s.Store.GetShortcut(ctx, &store.FindShortcut{
			ID: &shortcutID,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to fetch shortcut by id, err: %s", err)).SetInternal(err)
		}
		if shortcut == nil {
			return echo.NewHTTPError(http.StatusNotFound, fmt.Sprintf("not found shortcut with id: %d", shortcutID))
		}
		if shortcut.CreatorId != userID && currentUser.Role != store.RoleAdmin {
			return echo.NewHTTPError(http.StatusForbidden, "Unauthorized to delete shortcut")
		}

		err = s.Store.DeleteShortcut(ctx, &store.DeleteShortcut{ID: shortcutID})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to delete shortcut, err: %s", err)).SetInternal(err)
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
		return nil, errors.Wrap(err, "Failed to get creator")
	}
	if user == nil {
		return nil, errors.New("Creator not found")
	}
	shortcut.Creator = convertUserFromStore(user)

	activityList, err := s.Store.ListActivities(ctx, &store.FindActivity{
		Type:  store.ActivityShortcutView,
		Level: store.ActivityInfo,
		Where: []string{fmt.Sprintf("json_extract(payload, '$.shortcutId') = %d", shortcut.ID)},
	})
	if err != nil {
		return nil, errors.Wrap(err, "Failed to list activities")
	}
	shortcut.View = len(activityList)

	return shortcut, nil
}

func convertShortcutFromStorepb(shortcut *storepb.Shortcut) *Shortcut {
	return &Shortcut{
		ID:          shortcut.Id,
		CreatedTs:   shortcut.CreatedTs,
		UpdatedTs:   shortcut.UpdatedTs,
		CreatorID:   shortcut.CreatorId,
		RowStatus:   RowStatus(shortcut.RowStatus.String()),
		Name:        shortcut.Name,
		Link:        shortcut.Link,
		Title:       shortcut.Title,
		Description: shortcut.Description,
		Visibility:  Visibility(shortcut.Visibility.String()),
		Tags:        shortcut.Tags,
		OpenGraphMetadata: &OpenGraphMetadata{
			Title:       shortcut.OgMetadata.Title,
			Description: shortcut.OgMetadata.Description,
			Image:       shortcut.OgMetadata.Image,
		},
	}
}

func convertVisibilityToStorepb(visibility Visibility) storepb.Visibility {
	switch visibility {
	case VisibilityPublic:
		return storepb.Visibility_PUBLIC
	case VisibilityWorkspace:
		return storepb.Visibility_WORKSPACE
	case VisibilityPrivate:
		return storepb.Visibility_PRIVATE
	default:
		return storepb.Visibility_PUBLIC
	}
}

func (s *APIV1Service) createShortcutCreateActivity(ctx context.Context, shortcut *storepb.Shortcut) error {
	payload := &ActivityShorcutCreatePayload{
		ShortcutID: shortcut.Id,
	}
	payloadStr, err := json.Marshal(payload)
	if err != nil {
		return errors.Wrap(err, "Failed to marshal activity payload")
	}
	activity := &store.Activity{
		CreatorID: shortcut.CreatorId,
		Type:      store.ActivityShortcutCreate,
		Level:     store.ActivityInfo,
		Payload:   string(payloadStr),
	}
	_, err = s.Store.CreateActivity(ctx, activity)
	if err != nil {
		return errors.Wrap(err, "Failed to create activity")
	}
	return nil
}
