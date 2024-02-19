package server

import (
	"context"
	"fmt"
	"log/slog"
	"net"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/pkg/errors"
	"go.uber.org/zap"

	apiv1 "github.com/yourselfhosted/slash/api/v1"
	"github.com/yourselfhosted/slash/internal/log"
	storepb "github.com/yourselfhosted/slash/proto/gen/store"
	"github.com/yourselfhosted/slash/server/metric"
	"github.com/yourselfhosted/slash/server/profile"
	"github.com/yourselfhosted/slash/server/service/license"
	"github.com/yourselfhosted/slash/server/service/resource"
	"github.com/yourselfhosted/slash/store"
)

type Server struct {
	e *echo.Echo

	Profile *profile.Profile
	Store   *store.Store
	Secret  string

	licenseService *license.LicenseService

	// API services.
	apiV2Service *apiv1.APIV2Service
}

func NewServer(ctx context.Context, profile *profile.Profile, store *store.Store) (*Server, error) {
	e := echo.New()
	e.Debug = true
	e.HideBanner = true
	e.HidePort = true

	licenseService := license.NewLicenseService(profile, store)

	s := &Server{
		e:              e,
		Profile:        profile,
		Store:          store,
		licenseService: licenseService,
	}

	e.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
		Format: `{"time":"${time_rfc3339}",` +
			`"method":"${method}","uri":"${uri}",` +
			`"status":${status},"error":"${error}"}` + "\n",
	}))

	// Serve frontend.
	frontendService := NewFrontendService(profile, store)
	frontendService.Serve(ctx, e)

	// In dev mode, we'd like to set the const secret key to make signin session persistence.
	secret := "slash"
	if profile.Mode == "prod" {
		var err error
		secret, err = s.getSecretSessionName(ctx)
		if err != nil {
			return nil, err
		}
	}
	s.Secret = secret

	// Register healthz endpoint.
	e.GET("/healthz", func(c echo.Context) error {
		return c.String(http.StatusOK, "Service ready.")
	})

	rootGroup := e.Group("")
	s.apiV2Service = apiv1.NewAPIV2Service(secret, profile, store, licenseService, s.Profile.Port+1)
	// Register gRPC gateway as api v1.
	if err := s.apiV2Service.RegisterGateway(ctx, e); err != nil {
		return nil, errors.Wrap(err, "failed to register gRPC gateway")
	}

	// Register resource service.
	resourceService := resource.NewResourceService(profile, store)
	resourceService.Register(rootGroup)

	return s, nil
}

func (s *Server) Start(ctx context.Context) error {
	// Load subscription.
	if _, err := s.licenseService.LoadSubscription(ctx); err != nil {
		log.Error("failed to load subscription", zap.Error(err))
	}
	// Start gRPC server.
	listen, err := net.Listen("tcp", fmt.Sprintf(":%d", s.Profile.Port+1))
	if err != nil {
		return err
	}
	go func() {
		if err := s.apiV2Service.GetGRPCServer().Serve(listen); err != nil {
			slog.Log(ctx, slog.LevelError, "failed to start grpc server")
		}
	}()

	metric.Enqueue("server start")
	return s.e.Start(fmt.Sprintf(":%d", s.Profile.Port))
}

func (s *Server) Shutdown(ctx context.Context) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	// Shutdown echo server.
	if err := s.e.Shutdown(ctx); err != nil {
		fmt.Printf("failed to shutdown server, error: %v\n", err)
	}

	// Close database connection.
	if err := s.Store.Close(); err != nil {
		fmt.Printf("failed to close database, error: %v\n", err)
	}

	fmt.Printf("server stopped properly\n")
}

func (s *Server) GetEcho() *echo.Echo {
	return s.e
}

func (s *Server) getSecretSessionName(ctx context.Context) (string, error) {
	secretSessionSetting, err := s.Store.GetWorkspaceSetting(ctx, &store.FindWorkspaceSetting{
		Key: storepb.WorkspaceSettingKey_WORKSPACE_SETTING_SECRET_SESSION,
	})
	if err != nil {
		return "", err
	}
	if secretSessionSetting == nil {
		tempSecret := uuid.New().String()
		secretSessionSetting, err = s.Store.UpsertWorkspaceSetting(ctx, &storepb.WorkspaceSetting{
			Key: storepb.WorkspaceSettingKey_WORKSPACE_SETTING_SECRET_SESSION,
			Value: &storepb.WorkspaceSetting_SecretSession{
				SecretSession: tempSecret,
			},
		})
		if err != nil {
			return "", err
		}
	}
	return secretSessionSetting.GetSecretSession(), nil
}
