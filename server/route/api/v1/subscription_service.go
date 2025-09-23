package v1

import (
	"context"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	v1pb "github.com/bshort/monotreme/proto/gen/api/v1"
)

func (s *APIV1Service) GetSubscription(ctx context.Context, _ *v1pb.GetSubscriptionRequest) (*v1pb.Subscription, error) {
	subscription, err := s.LicenseService.LoadSubscription(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to load subscription: %v", err)
	}
	return subscription, nil
}

func (s *APIV1Service) UpdateSubscription(ctx context.Context, request *v1pb.UpdateSubscriptionRequest) (*v1pb.Subscription, error) {
	subscription, err := s.LicenseService.UpdateSubscription(ctx, request.LicenseKey)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to load subscription: %v", err)
	}
	return subscription, nil
}

func (s *APIV1Service) DeleteSubscription(ctx context.Context, _ *v1pb.DeleteSubscriptionRequest) (*v1pb.Subscription, error) {
	subscription, err := s.LicenseService.UpdateSubscription(ctx, "")
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to load subscription: %v", err)
	}
	return subscription, nil
}
