package v1

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/boojack/shortify/server/profile"
	"github.com/boojack/shortify/store"
	"github.com/labstack/echo/v4"
)

type WorkspaceSettingKey string

const (
	// WorkspaceDisallowSignUp is the key type for disallow sign up in workspace level.
	WorkspaceDisallowSignUp WorkspaceSettingKey = "disallow-signup"
)

// String returns the string format of WorkspaceSettingKey type.
func (key WorkspaceSettingKey) String() string {
	if key == WorkspaceDisallowSignUp {
		return "disallow-signup"
	}
	return ""
}

type WorkspaceSetting struct {
	Key   WorkspaceSettingKey `json:"key"`
	Value string              `json:"value"`
}

type WorkspaceSettingUpsert struct {
	Key   WorkspaceSettingKey `json:"key"`
	Value string              `json:"value"`
}

func (upsert WorkspaceSettingUpsert) Validate() error {
	if upsert.Key == WorkspaceDisallowSignUp {
		value := false
		err := json.Unmarshal([]byte(upsert.Value), &value)
		if err != nil {
			return fmt.Errorf("failed to unmarshal workspace setting disallow signup value")
		}
	} else {
		return fmt.Errorf("invalid workspace setting key")
	}

	return nil
}

type WorkspaceProfile struct {
	Profile        *profile.Profile `json:"profile"`
	DisallowSignUp bool             `json:"disallowSignUp"`
}

func (s *APIV1Service) registerWorkspaceRoutes(g *echo.Group) {
	g.GET("/workspace/profile", func(c echo.Context) error {
		ctx := c.Request().Context()
		workspaceProfile := WorkspaceProfile{
			Profile:        s.Profile,
			DisallowSignUp: false,
		}

		disallowSignUpSetting, err := s.Store.GetWorkspaceSetting(ctx, &store.FindWorkspaceSetting{
			Key: WorkspaceDisallowSignUp.String(),
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to get workspace setting")
		}
		if disallowSignUpSetting != nil {
			workspaceProfile.DisallowSignUp = disallowSignUpSetting.Value == "true"
		}

		return c.JSON(http.StatusOK, workspaceProfile)
	})

	g.POST("/workspace/setting", func(c echo.Context) error {
		ctx := c.Request().Context()
		userID, ok := c.Get(getUserIDContextKey()).(int)
		if !ok {
			return echo.NewHTTPError(http.StatusUnauthorized, "Missing user in session")
		}

		user, err := s.Store.GetUser(ctx, &store.FindUser{
			ID: &userID,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to find user").SetInternal(err)
		}
		if user == nil || user.Role != store.RoleAdmin {
			return echo.NewHTTPError(http.StatusUnauthorized, "Unauthorized")
		}

		upsert := &WorkspaceSettingUpsert{}
		if err := json.NewDecoder(c.Request().Body).Decode(upsert); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Malformatted post workspace setting request").SetInternal(err)
		}
		if err := upsert.Validate(); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "system setting invalidate").SetInternal(err)
		}

		workspaceSetting, err := s.Store.UpsertWorkspaceSetting(ctx, &store.WorkspaceSetting{
			Key:   upsert.Key.String(),
			Value: upsert.Value,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to upsert system setting").SetInternal(err)
		}
		return c.JSON(http.StatusOK, convertWorkspaceSettingFromStore(workspaceSetting))
	})

	g.GET("/workspace/setting", func(c echo.Context) error {
		ctx := c.Request().Context()
		userID, ok := c.Get(getUserIDContextKey()).(int)
		if !ok {
			return echo.NewHTTPError(http.StatusUnauthorized, "Missing user in session")
		}

		user, err := s.Store.GetUser(ctx, &store.FindUser{
			ID: &userID,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to find user").SetInternal(err)
		}
		if user == nil || user.Role != store.RoleAdmin {
			return echo.NewHTTPError(http.StatusUnauthorized, "Unauthorized")
		}

		list, err := s.Store.ListWorkspaceSettings(ctx, &store.FindWorkspaceSetting{})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to find system setting list").SetInternal(err)
		}

		workspaceSettingList := []*WorkspaceSetting{}
		for _, workspaceSetting := range list {
			workspaceSettingList = append(workspaceSettingList, convertWorkspaceSettingFromStore(workspaceSetting))
		}
		return c.JSON(http.StatusOK, workspaceSettingList)
	})
}

func convertWorkspaceSettingFromStore(workspaceSetting *store.WorkspaceSetting) *WorkspaceSetting {
	return &WorkspaceSetting{
		Key:   WorkspaceSettingKey(workspaceSetting.Key),
		Value: workspaceSetting.Value,
	}
}
