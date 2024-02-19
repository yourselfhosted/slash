package license

import (
	"context"
	"time"

	"github.com/pkg/errors"
	"google.golang.org/protobuf/types/known/timestamppb"

	apiv1pb "github.com/yourselfhosted/slash/proto/gen/api/v1"
	storepb "github.com/yourselfhosted/slash/proto/gen/store"
	"github.com/yourselfhosted/slash/server/profile"
	"github.com/yourselfhosted/slash/store"
)

type LicenseService struct {
	Profile *profile.Profile
	Store   *store.Store

	cachedSubscription *apiv1pb.Subscription
}

// NewLicenseService creates a new LicenseService.
func NewLicenseService(profile *profile.Profile, store *store.Store) *LicenseService {
	return &LicenseService{
		Profile: profile,
		Store:   store,
		cachedSubscription: &apiv1pb.Subscription{
			Plan: apiv1pb.PlanType_FREE,
		},
	}
}

func (s *LicenseService) LoadSubscription(ctx context.Context) (*apiv1pb.Subscription, error) {
	workspaceSetting, err := s.Store.GetWorkspaceSetting(ctx, &store.FindWorkspaceSetting{
		Key: storepb.WorkspaceSettingKey_WORKSPACE_SETTING_LICENSE_KEY,
	})
	if err != nil {
		return nil, errors.Wrap(err, "failed to get workspace setting")
	}
	subscription := &apiv1pb.Subscription{
		Plan: apiv1pb.PlanType_FREE,
	}
	licenseKey := ""
	if workspaceSetting != nil {
		licenseKey = workspaceSetting.GetLicenseKey()
	}
	if licenseKey == "" {
		return subscription, nil
	}

	validateResponse, err := validateLicenseKey(licenseKey, "")
	if err != nil {
		return nil, errors.Wrap(err, "failed to validate license key")
	}
	if validateResponse.Valid {
		subscription.Plan = apiv1pb.PlanType_PRO
		if validateResponse.LicenseKey.ExpiresAt != nil && *validateResponse.LicenseKey.ExpiresAt != "" {
			expiresTime, err := time.Parse("2006-01-02 15:04:05", *validateResponse.LicenseKey.ExpiresAt)
			if err != nil {
				return nil, errors.Wrap(err, "failed to parse license key expires time")
			}
			subscription.ExpiresTime = timestamppb.New(expiresTime)
		}
		startedTime, err := time.Parse("2006-01-02 15:04:05", validateResponse.LicenseKey.CreatedAt)
		if err != nil {
			return nil, errors.Wrap(err, "failed to parse license key created time")
		}
		subscription.StartedTime = timestamppb.New(startedTime)
	}
	s.cachedSubscription = subscription
	return subscription, nil
}

func (s *LicenseService) UpdateSubscription(ctx context.Context, licenseKey string) (*apiv1pb.Subscription, error) {
	if licenseKey == "" {
		return nil, errors.New("license key is required")
	}
	validateResponse, err := validateLicenseKey(licenseKey, "")
	if err != nil {
		return nil, errors.Wrap(err, "failed to validate license key")
	}
	if !validateResponse.Valid {
		return nil, errors.New("invalid license key")
	}
	_, err = s.Store.UpsertWorkspaceSetting(ctx, &storepb.WorkspaceSetting{
		Key: storepb.WorkspaceSettingKey_WORKSPACE_SETTING_LICENSE_KEY,
		Value: &storepb.WorkspaceSetting_LicenseKey{
			LicenseKey: licenseKey,
		},
	})
	if err != nil {
		return nil, errors.Wrap(err, "failed to upsert workspace setting")
	}
	return s.LoadSubscription(ctx)
}

func (s *LicenseService) GetSubscription(ctx context.Context) (*apiv1pb.Subscription, error) {
	return s.LoadSubscription(ctx)
}

func (s *LicenseService) IsFeatureEnabled(feature FeatureType) bool {
	matrix, ok := FeatureMatrix[feature]
	if !ok {
		return false
	}
	return matrix[s.cachedSubscription.Plan-1]
}
