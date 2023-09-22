package v2

import (
	"context"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	apiv2pb "github.com/boojack/slash/proto/gen/api/v2"
	"github.com/boojack/slash/server/profile"
	"github.com/boojack/slash/server/service/license"
	"github.com/boojack/slash/store"
)

type SubscriptionService struct {
	apiv2pb.UnimplementedSubscriptionServiceServer

	Profile        *profile.Profile
	Store          *store.Store
	LicenseService *license.LicenseService
}

// NewSubscriptionService creates a new SubscriptionService.
func NewSubscriptionService(profile *profile.Profile, store *store.Store, licenseService *license.LicenseService) *SubscriptionService {
	return &SubscriptionService{
		Profile:        profile,
		Store:          store,
		LicenseService: licenseService,
	}
}

func (s *SubscriptionService) GetSubscription(ctx context.Context, _ *apiv2pb.GetSubscriptionRequest) (*apiv2pb.GetSubscriptionResponse, error) {
	subscription, err := s.LicenseService.LoadSubscription(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to load subscription: %v", err)
	}
	return &apiv2pb.GetSubscriptionResponse{
		Subscription: subscription,
	}, nil
}

func (s *SubscriptionService) UpdateSubscription(ctx context.Context, request *apiv2pb.UpdateSubscriptionRequest) (*apiv2pb.UpdateSubscriptionResponse, error) {
	subscription, err := s.LicenseService.UpdateSubscription(ctx, request.LicenseKey)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to load subscription: %v", err)
	}
	return &apiv2pb.UpdateSubscriptionResponse{
		Subscription: subscription,
	}, nil
}
