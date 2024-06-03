package v1

import (
	"context"
	"fmt"

	"github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"github.com/improbable-eng/grpc-web/go/grpcweb"
	"github.com/labstack/echo/v4"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/reflection"

	v1pb "github.com/yourselfhosted/slash/proto/gen/api/v1"
	"github.com/yourselfhosted/slash/server/profile"
	"github.com/yourselfhosted/slash/server/service/license"
	"github.com/yourselfhosted/slash/store"
)

type APIV1Service struct {
	v1pb.UnimplementedWorkspaceServiceServer
	v1pb.UnimplementedSubscriptionServiceServer
	v1pb.UnimplementedAuthServiceServer
	v1pb.UnimplementedUserServiceServer
	v1pb.UnimplementedUserSettingServiceServer
	v1pb.UnimplementedShortcutServiceServer
	v1pb.UnimplementedCollectionServiceServer

	Secret         string
	Profile        *profile.Profile
	Store          *store.Store
	LicenseService *license.LicenseService

	grpcServer     *grpc.Server
	grpcServerPort int
}

func NewAPIV1Service(secret string, profile *profile.Profile, store *store.Store, licenseService *license.LicenseService, grpcServerPort int) *APIV1Service {
	authProvider := NewGRPCAuthInterceptor(store, secret)
	grpcServer := grpc.NewServer(
		grpc.ChainUnaryInterceptor(
			NewLoggerInterceptor().LoggerInterceptor,
			authProvider.AuthenticationInterceptor,
		),
	)
	apiV1Service := &APIV1Service{
		Secret:         secret,
		Profile:        profile,
		Store:          store,
		LicenseService: licenseService,
		grpcServer:     grpcServer,
		grpcServerPort: grpcServerPort,
	}

	v1pb.RegisterSubscriptionServiceServer(grpcServer, apiV1Service)
	v1pb.RegisterWorkspaceServiceServer(grpcServer, apiV1Service)
	v1pb.RegisterAuthServiceServer(grpcServer, apiV1Service)
	v1pb.RegisterUserServiceServer(grpcServer, apiV1Service)
	v1pb.RegisterUserSettingServiceServer(grpcServer, apiV1Service)
	v1pb.RegisterShortcutServiceServer(grpcServer, apiV1Service)
	v1pb.RegisterCollectionServiceServer(grpcServer, apiV1Service)
	reflection.Register(grpcServer)

	return apiV1Service
}

func (s *APIV1Service) GetGRPCServer() *grpc.Server {
	return s.grpcServer
}

// RegisterGateway registers the gRPC-Gateway with the given Echo instance.
func (s *APIV1Service) RegisterGateway(_ context.Context, e *echo.Echo) error {
	// Create a client connection to the gRPC Server we just started.
	// This is where the gRPC-Gateway proxies the requests.
	conn, err := grpc.NewClient(
		fmt.Sprintf(":%d", s.grpcServerPort),
		grpc.WithTransportCredentials(insecure.NewCredentials()),
	)
	if err != nil {
		return err
	}

	gwMux := runtime.NewServeMux()
	if err := v1pb.RegisterSubscriptionServiceHandler(context.Background(), gwMux, conn); err != nil {
		return err
	}
	if err := v1pb.RegisterWorkspaceServiceHandler(context.Background(), gwMux, conn); err != nil {
		return err
	}
	if err := v1pb.RegisterAuthServiceHandler(context.Background(), gwMux, conn); err != nil {
		return err
	}
	if err := v1pb.RegisterUserServiceHandler(context.Background(), gwMux, conn); err != nil {
		return err
	}
	if err := v1pb.RegisterUserSettingServiceHandler(context.Background(), gwMux, conn); err != nil {
		return err
	}
	if err := v1pb.RegisterShortcutServiceHandler(context.Background(), gwMux, conn); err != nil {
		return err
	}
	if err := v1pb.RegisterCollectionServiceHandler(context.Background(), gwMux, conn); err != nil {
		return err
	}
	e.Any("/api/v1/*", echo.WrapHandler(gwMux))

	// GRPC web proxy.
	options := []grpcweb.Option{
		grpcweb.WithCorsForRegisteredEndpointsOnly(false),
		grpcweb.WithOriginFunc(func(_ string) bool {
			return true
		}),
	}
	wrappedGrpc := grpcweb.WrapServer(s.grpcServer, options...)
	e.Any("/slash.api.v1.*", echo.WrapHandler(wrappedGrpc))

	return nil
}
