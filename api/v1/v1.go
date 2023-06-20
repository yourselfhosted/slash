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

func (s *APIV1Service) Start(apiV1Group *echo.Group, secret string) {
	s.registerAuthRoutes(apiV1Group, secret)
	s.registerUserRoutes(apiV1Group)
	s.registerWorkspaceRoutes(apiV1Group)
}
