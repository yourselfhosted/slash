package server

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/boojack/shortify/server/profile"
	"github.com/boojack/shortify/store"
	"github.com/boojack/shortify/store/db"
	"github.com/pkg/errors"

	"github.com/gorilla/securecookie"
	"github.com/gorilla/sessions"
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

type Server struct {
	e  *echo.Echo
	db *sql.DB

	Profile *profile.Profile
	Store   *store.Store
}

func NewServer(ctx context.Context, profile *profile.Profile) (*Server, error) {
	e := echo.New()
	e.Debug = true
	e.HideBanner = true
	e.HidePort = true

	db := db.NewDB(profile)
	if err := db.Open(ctx); err != nil {
		return nil, errors.Wrap(err, "cannot open db")
	}

	s := &Server{
		e:       e,
		db:      db.DBInstance,
		Profile: profile,
	}
	storeInstance := store.New(db.DBInstance, profile)
	s.Store = storeInstance

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
	secret := []byte("iamshortify")
	if profile.Mode == "prod" {
		secret = securecookie.GenerateRandomKey(16)
	}
	e.Use(session.Middleware(sessions.NewCookieStore(secret)))

	redirectGroup := e.Group("/o")
	redirectGroup.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return aclMiddleware(s, next)
	})
	s.registerRedirectRoutes(redirectGroup)

	apiGroup := e.Group("/api")
	apiGroup.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return aclMiddleware(s, next)
	})
	s.registerSystemRoutes(apiGroup)
	s.registerAuthRoutes(apiGroup)
	s.registerUserRoutes(apiGroup)
	s.registerWorkspaceRoutes(apiGroup)
	s.registerWorkspaceUserRoutes(apiGroup)
	s.registerShortcutRoutes(apiGroup)

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
	if err := s.db.Close(); err != nil {
		fmt.Printf("failed to close database, error: %v\n", err)
	}

	fmt.Printf("server stopped properly\n")
}
