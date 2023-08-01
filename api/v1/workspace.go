package v1

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/boojack/slash/server/profile"
	"github.com/boojack/slash/store"
	"github.com/labstack/echo/v4"
)

type WorkspaceSetting struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

type WorkspaceSettingUpsert struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

func (upsert WorkspaceSettingUpsert) Validate() error {
	if upsert.Key == store.WorkspaceDisallowSignUp.String() {
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
			Key: store.WorkspaceDisallowSignUp,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to find workspace setting, err: %s", err)).SetInternal(err)
		}
		if disallowSignUpSetting != nil {
			workspaceProfile.DisallowSignUp = disallowSignUpSetting.Value == "true"
		}

		return c.JSON(http.StatusOK, workspaceProfile)
	})

	g.POST("/workspace/setting", func(c echo.Context) error {
		ctx := c.Request().Context()
		userID, ok := c.Get(UserIDContextKey).(int)
		if !ok {
			return echo.NewHTTPError(http.StatusUnauthorized, "missing user in session")
		}

		user, err := s.Store.GetUser(ctx, &store.FindUser{
			ID: &userID,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to find user, err: %s", err)).SetInternal(err)
		}
		if user == nil || user.Role != store.RoleAdmin {
			return echo.NewHTTPError(http.StatusUnauthorized, "Unauthorized")
		}

		upsert := &WorkspaceSettingUpsert{}
		if err := json.NewDecoder(c.Request().Body).Decode(upsert); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("failed to decode request body, err: %s", err)).SetInternal(err)
		}
		if err := upsert.Validate(); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("invalid request body, err: %s", err)).SetInternal(err)
		}

		workspaceSetting, err := s.Store.UpsertWorkspaceSetting(ctx, &store.WorkspaceSetting{
			Key:   store.WorkspaceSettingKey(upsert.Key),
			Value: upsert.Value,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to upsert workspace setting, err: %s", err)).SetInternal(err)
		}
		return c.JSON(http.StatusOK, convertWorkspaceSettingFromStore(workspaceSetting))
	})

	g.GET("/workspace/setting", func(c echo.Context) error {
		ctx := c.Request().Context()
		userID, ok := c.Get(UserIDContextKey).(int)
		if !ok {
			return echo.NewHTTPError(http.StatusUnauthorized, "missing user in session")
		}

		user, err := s.Store.GetUser(ctx, &store.FindUser{
			ID: &userID,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to find user, err: %s", err)).SetInternal(err)
		}
		if user == nil || user.Role != store.RoleAdmin {
			return echo.NewHTTPError(http.StatusUnauthorized, "Unauthorized")
		}

		list, err := s.Store.ListWorkspaceSettings(ctx, &store.FindWorkspaceSetting{})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to list workspace settings, err: %s", err)).SetInternal(err)
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
		Key:   workspaceSetting.Key.String(),
		Value: workspaceSetting.Value,
	}
}
