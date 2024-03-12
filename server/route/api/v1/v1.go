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

	apiv1pb "github.com/yourselfhosted/slash/proto/gen/api/v1"
	"github.com/yourselfhosted/slash/server/profile"
	"github.com/yourselfhosted/slash/server/service/license"
	"github.com/yourselfhosted/slash/store"
)

type APIV2Service struct {
	apiv1pb.UnimplementedWorkspaceServiceServer
	apiv1pb.UnimplementedSubscriptionServiceServer
	apiv1pb.UnimplementedAuthServiceServer
	apiv1pb.UnimplementedUserServiceServer
	apiv1pb.UnimplementedUserSettingServiceServer
	apiv1pb.UnimplementedShortcutServiceServer
	apiv1pb.UnimplementedCollectionServiceServer

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
			NewLoggerInterceptor().LoggerInterceptor,
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

	apiv1pb.RegisterSubscriptionServiceServer(grpcServer, apiV2Service)
	apiv1pb.RegisterWorkspaceServiceServer(grpcServer, apiV2Service)
	apiv1pb.RegisterAuthServiceServer(grpcServer, apiV2Service)
	apiv1pb.RegisterUserServiceServer(grpcServer, apiV2Service)
	apiv1pb.RegisterUserSettingServiceServer(grpcServer, apiV2Service)
	apiv1pb.RegisterShortcutServiceServer(grpcServer, apiV2Service)
	apiv1pb.RegisterCollectionServiceServer(grpcServer, apiV2Service)
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
	if err := apiv1pb.RegisterSubscriptionServiceHandler(context.Background(), gwMux, conn); err != nil {
		return err
	}
	if err := apiv1pb.RegisterWorkspaceServiceHandler(context.Background(), gwMux, conn); err != nil {
		return err
	}
	if err := apiv1pb.RegisterAuthServiceHandler(context.Background(), gwMux, conn); err != nil {
		return err
	}
	if err := apiv1pb.RegisterUserServiceHandler(context.Background(), gwMux, conn); err != nil {
		return err
	}
	if err := apiv1pb.RegisterUserSettingServiceHandler(context.Background(), gwMux, conn); err != nil {
		return err
	}
	if err := apiv1pb.RegisterShortcutServiceHandler(context.Background(), gwMux, conn); err != nil {
		return err
	}
	if err := apiv1pb.RegisterCollectionServiceHandler(context.Background(), gwMux, conn); err != nil {
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
