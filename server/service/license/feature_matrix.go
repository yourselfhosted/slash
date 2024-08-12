package license

import (
	v1pb "github.com/yourselfhosted/slash/proto/gen/api/v1"
)

type FeatureType string

const (
	// Enterprise features.

	// FeatureTypeSSO allows the user to use SSO.
	FeatureTypeSSO FeatureType = "ysh.slash.sso"
	// FeatureTypeAdvancedAnalytics allows the user to use advanced analytics.
	FeatureTypeAdvancedAnalytics FeatureType = "ysh.slash.advanced-analytics"

	// Usages.

	// FeatureTypeUnlimitedAccounts allows the user to create unlimited accounts.
	FeatureTypeUnlimitedAccounts FeatureType = "ysh.slash.unlimited-accounts"
	// FeatureTypeUnlimitedAccounts allows the user to create unlimited collections.
	FeatureTypeUnlimitedCollections FeatureType = "ysh.slash.unlimited-collections"

	// Customization.

	// FeatureTypeCustomeBranding allows the user to customize the branding.
	FeatureTypeCustomeBranding FeatureType = "ysh.slash.custom-branding"
)

func (f FeatureType) String() string {
	return string(f)
}

// FeatureMatrix is a matrix of features in [Free, Pro, Enterprise].
var FeatureMatrix = map[FeatureType][3]bool{
	FeatureTypeSSO:                  {false, false, false},
	FeatureTypeAdvancedAnalytics:    {false, false, false},
	FeatureTypeUnlimitedAccounts:    {false, true, false},
	FeatureTypeUnlimitedCollections: {false, true, true},
	FeatureTypeCustomeBranding:      {false, true, true},
}

func getDefaultFeatures(plan v1pb.PlanType) []FeatureType {
	var features []FeatureType
	for feature, enabled := range FeatureMatrix {
		if enabled[plan-1] {
			features = append(features, feature)
		}
	}
	return features
}

func validateFeatureString(feature string) (FeatureType, bool) {
	switch feature {
	case "ysh.slash.sso":
		return FeatureTypeSSO, true
	case "ysh.slash.advanced-analytics":
		return FeatureTypeAdvancedAnalytics, true
	case "ysh.slash.unlimited-accounts":
		return FeatureTypeUnlimitedAccounts, true
	case "ysh.slash.unlimited-collections":
		return FeatureTypeUnlimitedCollections, true
	case "ysh.slash.custom-branding":
		return FeatureTypeCustomeBranding, true
	default:
		return "", false
	}
}
