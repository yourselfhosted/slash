package v1

import (
	"context"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	apiv1pb "github.com/yourselfhosted/slash/proto/gen/api/v1"
)

func (s *APIV2Service) GetSubscription(ctx context.Context, _ *apiv1pb.GetSubscriptionRequest) (*apiv1pb.GetSubscriptionResponse, error) {
	subscription, err := s.LicenseService.LoadSubscription(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to load subscription: %v", err)
	}
	return &apiv1pb.GetSubscriptionResponse{
		Subscription: subscription,
	}, nil
}

func (s *APIV2Service) UpdateSubscription(ctx context.Context, request *apiv1pb.UpdateSubscriptionRequest) (*apiv1pb.UpdateSubscriptionResponse, error) {
	subscription, err := s.LicenseService.UpdateSubscription(ctx, request.LicenseKey)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to load subscription: %v", err)
	}
	return &apiv1pb.UpdateSubscriptionResponse{
		Subscription: subscription,
	}, nil
}
