package license

import (
	"context"
	_ "embed"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/pkg/errors"
	"google.golang.org/protobuf/types/known/timestamppb"

	v1pb "github.com/yourselfhosted/slash/proto/gen/api/v1"
	storepb "github.com/yourselfhosted/slash/proto/gen/store"
	"github.com/yourselfhosted/slash/server/profile"
	"github.com/yourselfhosted/slash/server/service/license/lemonsqueezy"
	"github.com/yourselfhosted/slash/store"
)

//go:embed slash.public.pem
var slashPublicRSAKey string

type LicenseService struct {
	Profile *profile.Profile
	Store   *store.Store

	cachedSubscription *v1pb.Subscription
}

// NewLicenseService creates a new LicenseService.
func NewLicenseService(profile *profile.Profile, store *store.Store) *LicenseService {
	return &LicenseService{
		Profile: profile,
		Store:   store,
		cachedSubscription: &v1pb.Subscription{
			Plan: v1pb.PlanType_FREE,
		},
	}
}

func (s *LicenseService) LoadSubscription(ctx context.Context) (*v1pb.Subscription, error) {
	workspaceSetting, err := s.Store.GetWorkspaceSetting(ctx, &store.FindWorkspaceSetting{
		Key: storepb.WorkspaceSettingKey_WORKSPACE_SETTING_LICENSE_KEY,
	})
	if err != nil {
		return nil, errors.Wrap(err, "failed to get workspace setting")
	}
	subscription := &v1pb.Subscription{
		Plan: v1pb.PlanType_FREE,
	}
	licenseKey := ""
	if workspaceSetting != nil {
		licenseKey = workspaceSetting.GetLicenseKey()
	}
	if licenseKey == "" {
		return subscription, nil
	}

	result, err := validateLicenseKey(licenseKey)
	if err != nil {
		return nil, errors.Wrap(err, "failed to validate license key")
	}
	if result == nil {
		return subscription, nil
	}
	subscription.Plan = result.Plan
	subscription.ExpiresTime = timestamppb.New(result.ExpiresTime)
	s.cachedSubscription = subscription
	return subscription, nil
}

func (s *LicenseService) UpdateSubscription(ctx context.Context, licenseKey string) (*v1pb.Subscription, error) {
	if licenseKey == "" {
		return nil, errors.New("license key is required")
	}
	result, err := validateLicenseKey(licenseKey)
	if err != nil {
		return nil, errors.Wrap(err, "failed to validate license key")
	}
	if result == nil {
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

func (s *LicenseService) GetSubscription(ctx context.Context) (*v1pb.Subscription, error) {
	subscription, err := s.LoadSubscription(ctx)
	if err != nil || subscription.Plan == v1pb.PlanType_PLAN_TYPE_UNSPECIFIED {
		// nolint
		return &v1pb.Subscription{
			Plan: v1pb.PlanType_FREE,
		}, nil
	}
	return subscription, nil
}

func (s *LicenseService) IsFeatureEnabled(feature FeatureType) bool {
	matrix, ok := FeatureMatrix[feature]
	if !ok {
		return false
	}
	return matrix[s.cachedSubscription.Plan-1]
}

type ValidateResult struct {
	Plan        v1pb.PlanType
	ExpiresTime time.Time
}

type Claims struct {
	jwt.RegisteredClaims

	Owner string `json:"owner"`
	Plan  string `json:"plan"`
	Trial bool   `json:"trial"`
}

func validateLicenseKey(licenseKey string) (*ValidateResult, error) {
	// Try to parse the license key as a JWT token.
	claims, _ := parseLicenseKey(licenseKey)
	if claims != nil {
		plan := v1pb.PlanType(v1pb.PlanType_value[claims.Plan])
		if plan == v1pb.PlanType_PLAN_TYPE_UNSPECIFIED {
			return nil, errors.New("invalid plan")
		}
		return &ValidateResult{
			Plan:        v1pb.PlanType(v1pb.PlanType_value[claims.Plan]),
			ExpiresTime: claims.ExpiresAt.Time,
		}, nil
	}

	// Try to validate the license key with the license server.
	validateResponse, err := lemonsqueezy.ValidateLicenseKey(licenseKey, "")
	if err != nil {
		return nil, errors.Wrap(err, "failed to validate license key")
	}
	if validateResponse.Valid {
		result := &ValidateResult{
			Plan: v1pb.PlanType_PRO,
		}
		if validateResponse.LicenseKey.ExpiresAt != nil && *validateResponse.LicenseKey.ExpiresAt != "" {
			expiresTime, err := time.Parse(time.RFC3339Nano, *validateResponse.LicenseKey.ExpiresAt)
			if err != nil {
				return nil, errors.Wrap(err, "failed to parse license key expires time")
			}
			result.ExpiresTime = expiresTime
		}
		return result, nil
	}

	// Otherwise, return an error.
	return nil, errors.New("invalid license key")
}

func parseLicenseKey(licenseKey string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(licenseKey, &Claims{}, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, errors.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		key, err := jwt.ParseRSAPublicKeyFromPEM([]byte(slashPublicRSAKey))
		if err != nil {
			return nil, err
		}

		return key, nil
	})
	if err != nil {
		return nil, errors.Wrap(err, "failed to parse token")
	}
	if token == nil || !token.Valid {
		return nil, errors.New("invalid token")
	}

	claims, ok := token.Claims.(*Claims)
	if !ok {
		return nil, errors.New("invalid claims")
	}
	return claims, nil
}
