package v2

import (
	"context"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	apiv2pb "github.com/yourselfhosted/slash/proto/gen/api/v2"
)

func (s *APIV2Service) GetSubscription(ctx context.Context, _ *apiv2pb.GetSubscriptionRequest) (*apiv2pb.GetSubscriptionResponse, error) {
	subscription, err := s.LicenseService.LoadSubscription(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to load subscription: %v", err)
	}
	return &apiv2pb.GetSubscriptionResponse{
		Subscription: subscription,
	}, nil
}

func (s *APIV2Service) UpdateSubscription(ctx context.Context, request *apiv2pb.UpdateSubscriptionRequest) (*apiv2pb.UpdateSubscriptionResponse, error) {
	subscription, err := s.LicenseService.UpdateSubscription(ctx, request.LicenseKey)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to load subscription: %v", err)
	}
	return &apiv2pb.UpdateSubscriptionResponse{
		Subscription: subscription,
	}, nil
}
