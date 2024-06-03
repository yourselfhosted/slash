package v1

import (
	"context"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	v1pb "github.com/yourselfhosted/slash/proto/gen/api/v1"
)

func (s *APIV1Service) GetSubscription(ctx context.Context, _ *v1pb.GetSubscriptionRequest) (*v1pb.GetSubscriptionResponse, error) {
	subscription, err := s.LicenseService.LoadSubscription(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to load subscription: %v", err)
	}
	return &v1pb.GetSubscriptionResponse{
		Subscription: subscription,
	}, nil
}

func (s *APIV1Service) UpdateSubscription(ctx context.Context, request *v1pb.UpdateSubscriptionRequest) (*v1pb.UpdateSubscriptionResponse, error) {
	subscription, err := s.LicenseService.UpdateSubscription(ctx, request.LicenseKey)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to load subscription: %v", err)
	}
	return &v1pb.UpdateSubscriptionResponse{
		Subscription: subscription,
	}, nil
}
