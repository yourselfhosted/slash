package server

import (
	"context"
	"fmt"
	"time"

	apiv1 "github.com/boojack/shortify/api/v1"
	"github.com/boojack/shortify/server/profile"
	"github.com/boojack/shortify/store"

	"github.com/gorilla/securecookie"
	"github.com/gorilla/sessions"
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

type Server struct {
	e *echo.Echo

	Profile *profile.Profile
	Store   *store.Store
}

func NewServer(profile *profile.Profile, store *store.Store) (*Server, error) {
	e := echo.New()
	e.Debug = true
	e.HideBanner = true
	e.HidePort = true

	s := &Server{
		e:       e,
		Profile: profile,
		Store:   store,
	}

	e.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
		Format: `{"time":"${time_rfc3339}",` +
			`"method":"${method}","uri":"${uri}",` +
			`"status":${status},"error":"${error}"}` + "\n",
	}))

	e.Use(middleware.Gzip())

	e.Use(middleware.CORS())

	e.Use(middleware.TimeoutWithConfig(middleware.TimeoutConfig{
		Skipper:      middleware.DefaultSkipper,
		ErrorMessage: "Request timeout",
		Timeout:      30 * time.Second,
	}))

	embedFrontend(e)

	// In dev mode, set the const secret key to make signin session persistence.
	secret := "iamshortify"
	if profile.Mode == "prod" {
		secret = string(securecookie.GenerateRandomKey(16))
	}
	e.Use(session.Middleware(sessions.NewCookieStore([]byte(secret))))

	apiGroup := e.Group("/api")
	apiGroup.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return JWTMiddleware(s, next, string(secret))
	})
	s.registerSystemRoutes(apiGroup)
	s.registerWorkspaceRoutes(apiGroup)
	s.registerWorkspaceUserRoutes(apiGroup)
	s.registerShortcutRoutes(apiGroup)

	// Register API v1 routes.
	apiV1Service := apiv1.NewAPIV1Service(profile, store)
	apiV1Group := apiGroup.Group("/api/v1")
	apiV1Group.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return JWTMiddleware(s, next, string(secret))
	})
	apiV1Service.Start(apiV1Group, secret)

	return s, nil
}

func (s *Server) Start(_ context.Context) error {
	return s.e.Start(fmt.Sprintf(":%d", s.Profile.Port))
}

func (s *Server) Shutdown(ctx context.Context) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	// Shutdown echo server
	if err := s.e.Shutdown(ctx); err != nil {
		fmt.Printf("failed to shutdown server, error: %v\n", err)
	}

	// Close database connection
	if err := s.Store.Close(); err != nil {
		fmt.Printf("failed to close database, error: %v\n", err)
	}

	fmt.Printf("server stopped properly\n")
}
