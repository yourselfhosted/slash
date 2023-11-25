package v1

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"

	storepb "github.com/yourselfhosted/slash/proto/gen/store"
	"github.com/yourselfhosted/slash/server/profile"
	"github.com/yourselfhosted/slash/store"
)

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

		enableSignUpSetting, err := s.Store.GetWorkspaceSetting(ctx, &store.FindWorkspaceSetting{
			Key: storepb.WorkspaceSettingKey_WORKSAPCE_SETTING_ENABLE_SIGNUP,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to find workspace setting, err: %s", err)).SetInternal(err)
		}
		if enableSignUpSetting != nil {
			workspaceProfile.DisallowSignUp = !enableSignUpSetting.GetEnableSignup()
		}

		return c.JSON(http.StatusOK, workspaceProfile)
	})
}
