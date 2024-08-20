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
	"github.com/pkg/errors"

	storepb "github.com/yourselfhosted/slash/proto/gen/store"
	"github.com/yourselfhosted/slash/server/metric"
	"github.com/yourselfhosted/slash/server/profile"
	apiv1 "github.com/yourselfhosted/slash/server/route/api/v1"
	"github.com/yourselfhosted/slash/server/route/frontend"
	licensern "github.com/yourselfhosted/slash/server/runner/license"
	"github.com/yourselfhosted/slash/server/runner/version"
	"github.com/yourselfhosted/slash/server/service/license"
	"github.com/yourselfhosted/slash/store"
)

type Server struct {
	e *echo.Echo

	Profile *profile.Profile
	Store   *store.Store
	Secret  string

	licenseService *license.LicenseService

	// API services.
	apiV1Service *apiv1.APIV1Service
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

	// Serve frontend.
	frontendService := frontend.NewFrontendService(profile, store)
	frontendService.Serve(ctx, e)

	// In dev mode, we'd like to set the const secret key to make signin session persistence.
	secret := "slash"
	if profile.Mode == "prod" {
		var err error
		secret, err = s.getSecretSession(ctx)
		if err != nil {
			return nil, err
		}
	}
	s.Secret = secret

	// Register healthz endpoint.
	e.GET("/healthz", func(c echo.Context) error {
		return c.String(http.StatusOK, "Service ready.")
	})

	s.apiV1Service = apiv1.NewAPIV1Service(secret, profile, store, licenseService, s.Profile.Port+1)
	// Register gRPC gateway as api v1.
	if err := s.apiV1Service.RegisterGateway(ctx, e); err != nil {
		return nil, errors.Wrap(err, "failed to register gRPC gateway")
	}

	return s, nil
}

func (s *Server) Start(ctx context.Context) error {
	s.StartBackgroundRunners(ctx)
	// Start gRPC server.
	listen, err := net.Listen("tcp", fmt.Sprintf(":%d", s.Profile.Port+1))
	if err != nil {
		return err
	}
	go func() {
		if err := s.apiV1Service.GetGRPCServer().Serve(listen); err != nil {
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

func (s *Server) StartBackgroundRunners(ctx context.Context) {
	licenseRunner := licensern.NewRunner(s.Store, s.licenseService)
	licenseRunner.RunOnce(ctx)
	versionRunner := version.NewRunner(s.Store, s.Profile)
	versionRunner.RunOnce(ctx)

	go licenseRunner.Run(ctx)
	go versionRunner.Run(ctx)
}

func (s *Server) getSecretSession(ctx context.Context) (string, error) {
	workspaceGeneralSetting, err := s.Store.GetWorkspaceGeneralSetting(ctx)
	if err != nil {
		return "", err
	}
	secretSession := workspaceGeneralSetting.SecretSession
	if secretSession == "" {
		secretSession = uuid.New().String()
		_, err := s.Store.UpsertWorkspaceSetting(ctx, &storepb.WorkspaceSetting{
			Key: storepb.WorkspaceSettingKey_WORKSPACE_SETTING_GENERAL,
			Value: &storepb.WorkspaceSetting_General{
				General: &storepb.WorkspaceSetting_GeneralSetting{
					SecretSession: secretSession,
				},
			},
		})
		if err != nil {
			return "", err
		}
	}
	return secretSession, nil
}
