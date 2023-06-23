package v1

import (
	"github.com/boojack/shortify/server/profile"
	"github.com/boojack/shortify/store"

	"github.com/labstack/echo/v4"
)

type APIV1Service struct {
	Profile *profile.Profile
	Store   *store.Store
}

func NewAPIV1Service(profile *profile.Profile, store *store.Store) *APIV1Service {
	return &APIV1Service{
		Profile: profile,
		Store:   store,
	}
}

func (s *APIV1Service) Start(apiGroup *echo.Group, secret string) {
	apiV1Group := apiGroup.Group("/api/v1")
	s.registerSystemRoutes(apiV1Group)
	s.registerWorkspaceSettingRoutes(apiV1Group)
	s.registerAuthRoutes(apiV1Group, secret)
	s.registerUserRoutes(apiV1Group)
	s.registerShortcutRoutes(apiV1Group)

	redirectorGroup := apiGroup.Group("/o")
	s.registerRedirectorRoutes(redirectorGroup)
}
