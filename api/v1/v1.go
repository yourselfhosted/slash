package v1

import (
	"github.com/labstack/echo/v4"

	"github.com/boojack/slash/server/profile"
	"github.com/boojack/slash/server/service/license"
	"github.com/boojack/slash/store"
)

type APIV1Service struct {
	Profile        *profile.Profile
	Store          *store.Store
	LicenseService *license.LicenseService
}

func NewAPIV1Service(profile *profile.Profile, store *store.Store, licenseService *license.LicenseService) *APIV1Service {
	return &APIV1Service{
		Profile:        profile,
		Store:          store,
		LicenseService: licenseService,
	}
}

func (s *APIV1Service) Start(apiGroup *echo.Group, secret string) {
	apiV1Group := apiGroup.Group("/api/v1")
	apiV1Group.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return JWTMiddleware(s, next, secret)
	})
	s.registerWorkspaceRoutes(apiV1Group)
	s.registerAuthRoutes(apiV1Group, secret)
	s.registerUserRoutes(apiV1Group)
	s.registerShortcutRoutes(apiV1Group)
	s.registerAnalyticsRoutes(apiV1Group)

	redirectorGroup := apiGroup.Group("/s")
	redirectorGroup.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return JWTMiddleware(s, next, secret)
	})
	s.registerRedirectorRoutes(redirectorGroup)
}
