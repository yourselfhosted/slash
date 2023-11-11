package v2

import (
	"context"
	"fmt"

	"github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"github.com/improbable-eng/grpc-web/go/grpcweb"
	"github.com/labstack/echo/v4"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/reflection"

	apiv2pb "github.com/boojack/slash/proto/gen/api/v2"
	"github.com/boojack/slash/server/profile"
	"github.com/boojack/slash/server/service/license"
	"github.com/boojack/slash/store"
)

type APIV2Service struct {
	apiv2pb.UnimplementedWorkspaceServiceServer
	apiv2pb.UnimplementedSubscriptionServiceServer
	apiv2pb.UnimplementedUserServiceServer
	apiv2pb.UnimplementedUserSettingServiceServer
	apiv2pb.UnimplementedShortcutServiceServer
	apiv2pb.UnimplementedCollectionServiceServer

	Secret         string
	Profile        *profile.Profile
	Store          *store.Store
	LicenseService *license.LicenseService

	grpcServer     *grpc.Server
	grpcServerPort int
}

func NewAPIV2Service(secret string, profile *profile.Profile, store *store.Store, licenseService *license.LicenseService, grpcServerPort int) *APIV2Service {
	authProvider := NewGRPCAuthInterceptor(store, secret)
	grpcServer := grpc.NewServer(
		grpc.ChainUnaryInterceptor(
			authProvider.AuthenticationInterceptor,
		),
	)
	apiV2Service := &APIV2Service{
		Secret:         secret,
		Profile:        profile,
		Store:          store,
		LicenseService: licenseService,
		grpcServer:     grpcServer,
		grpcServerPort: grpcServerPort,
	}

	apiv2pb.RegisterSubscriptionServiceServer(grpcServer, apiV2Service)
	apiv2pb.RegisterWorkspaceServiceServer(grpcServer, apiV2Service)
	apiv2pb.RegisterUserServiceServer(grpcServer, apiV2Service)
	apiv2pb.RegisterUserSettingServiceServer(grpcServer, apiV2Service)
	apiv2pb.RegisterShortcutServiceServer(grpcServer, apiV2Service)
	apiv2pb.RegisterCollectionServiceServer(grpcServer, apiV2Service)
	reflection.Register(grpcServer)

	return apiV2Service
}

func (s *APIV2Service) GetGRPCServer() *grpc.Server {
	return s.grpcServer
}

// RegisterGateway registers the gRPC-Gateway with the given Echo instance.
func (s *APIV2Service) RegisterGateway(ctx context.Context, e *echo.Echo) error {
	// Create a client connection to the gRPC Server we just started.
	// This is where the gRPC-Gateway proxies the requests.
	conn, err := grpc.DialContext(
		ctx,
		fmt.Sprintf(":%d", s.grpcServerPort),
		grpc.WithTransportCredentials(insecure.NewCredentials()),
	)
	if err != nil {
		return err
	}

	gwMux := runtime.NewServeMux()
	if err := apiv2pb.RegisterSubscriptionServiceHandler(context.Background(), gwMux, conn); err != nil {
		return err
	}
	if err := apiv2pb.RegisterWorkspaceServiceHandler(context.Background(), gwMux, conn); err != nil {
		return err
	}
	if err := apiv2pb.RegisterUserServiceHandler(context.Background(), gwMux, conn); err != nil {
		return err
	}
	if err := apiv2pb.RegisterUserSettingServiceHandler(context.Background(), gwMux, conn); err != nil {
		return err
	}
	if err := apiv2pb.RegisterShortcutServiceHandler(context.Background(), gwMux, conn); err != nil {
		return err
	}
	if err := apiv2pb.RegisterCollectionServiceHandler(context.Background(), gwMux, conn); err != nil {
		return err
	}
	e.Any("/api/v2/*", echo.WrapHandler(gwMux))

	// GRPC web proxy.
	options := []grpcweb.Option{
		grpcweb.WithCorsForRegisteredEndpointsOnly(false),
		grpcweb.WithOriginFunc(func(origin string) bool {
			return true
		}),
	}
	wrappedGrpc := grpcweb.WrapServer(s.grpcServer, options...)
	e.Any("/slash.api.v2.*", echo.WrapHandler(wrappedGrpc))

	return nil
}
