package v2

import (
	"context"
	"time"

	"github.com/boojack/slash/plugin/license"
	apiv2pb "github.com/boojack/slash/proto/gen/api/v2"
	storepb "github.com/boojack/slash/proto/gen/store"
	"github.com/boojack/slash/server/profile"
	"github.com/boojack/slash/store"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"
)

type SubscriptionService struct {
	apiv2pb.UnimplementedSubscriptionServiceServer

	Profile *profile.Profile
	Store   *store.Store
}

// NewSubscriptionService creates a new SubscriptionService.
func NewSubscriptionService(profile *profile.Profile, store *store.Store) *SubscriptionService {
	return &SubscriptionService{
		Profile: profile,
		Store:   store,
	}
}

func (s *SubscriptionService) GetSubscription(ctx context.Context, _ *apiv2pb.GetSubscriptionRequest) (*apiv2pb.GetSubscriptionResponse, error) {
	workspaceSetting, err := s.Store.GetWorkspaceSetting(ctx, &store.FindWorkspaceSetting{
		Key: storepb.WorkspaceSettingKey_WORKSPACE_SETTING_LICENSE_KEY,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get workspace setting: %v", err)
	}
	subscription := &apiv2pb.Subscription{
		Plan: apiv2pb.PlanType_FREE,
	}
	licenseKey := ""
	if workspaceSetting != nil {
		licenseKey = workspaceSetting.GetLicenseKey()
	}
	if licenseKey == "" {
		return &apiv2pb.GetSubscriptionResponse{
			Subscription: subscription,
		}, nil
	}

	validateResponse, err := license.ValidateLicenseKey(licenseKey, "")
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to validate license key: %v", err)
	}
	if validateResponse.Valid {
		subscription.Plan = apiv2pb.PlanType_PRO
		if validateResponse.LicenseKey.ExpiresAt != nil && *validateResponse.LicenseKey.ExpiresAt != "" {
			expiresTime, err := time.Parse("2006-01-02 15:04:05", *validateResponse.LicenseKey.ExpiresAt)
			if err != nil {
				return nil, status.Errorf(codes.Internal, "failed to parse license key expired time: %v", err)
			}
			subscription.ExpiresTime = timestamppb.New(expiresTime)
		}
		startedTime, err := time.Parse("2006-01-02 15:04:05", validateResponse.LicenseKey.CreatedAt)
		if err != nil {
			return nil, status.Errorf(codes.Internal, "failed to parse license key created time: %v", err)
		}
		subscription.StartedTime = timestamppb.New(startedTime)
	}
	return &apiv2pb.GetSubscriptionResponse{
		Subscription: subscription,
	}, nil
}

func (s *SubscriptionService) UpdateSubscription(ctx context.Context, request *apiv2pb.UpdateSubscriptionRequest) (*apiv2pb.UpdateSubscriptionResponse, error) {
	licenseKey := request.LicenseKey
	if licenseKey == "" {
		return nil, status.Errorf(codes.InvalidArgument, "license key is required")
	}
	validateResponse, err := license.ValidateLicenseKey(licenseKey, "")
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to validate license key: %v", err)
	}
	if !validateResponse.Valid {
		return nil, status.Errorf(codes.InvalidArgument, "invalid license key")
	}
	_, err = s.Store.UpsertWorkspaceSetting(ctx, &storepb.WorkspaceSetting{
		Key: storepb.WorkspaceSettingKey_WORKSPACE_SETTING_LICENSE_KEY,
		Value: &storepb.WorkspaceSetting_LicenseKey{
			LicenseKey: licenseKey,
		},
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to update license key: %v", err)
	}
	return &apiv2pb.UpdateSubscriptionResponse{}, nil
}
