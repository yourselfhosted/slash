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
	// FeatureTypeUnlimitedShortcuts allows the user to create unlimited shortcuts.
	FeatureTypeUnlimitedShortcuts FeatureType = "ysh.slash.unlimited-shortcuts"
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
	FeatureTypeUnlimitedAccounts:    {false, true, true},
	FeatureTypeUnlimitedShortcuts:   {false, true, true},
	FeatureTypeUnlimitedCollections: {false, true, true},
	FeatureTypeCustomeBranding:      {false, false, true},
	FeatureTypeSSO:                  {false, false, false},
	FeatureTypeAdvancedAnalytics:    {false, false, false},
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
	case "ysh.slash.unlimited-accounts":
		return FeatureTypeUnlimitedAccounts, true
	case "ysh.slash.unlimited-shortcuts":
		return FeatureTypeUnlimitedShortcuts, true
	case "ysh.slash.unlimited-collections":
		return FeatureTypeUnlimitedCollections, true
	case "ysh.slash.custom-branding":
		return FeatureTypeCustomeBranding, true
	case "ysh.slash.sso":
		return FeatureTypeSSO, true
	case "ysh.slash.advanced-analytics":
		return FeatureTypeAdvancedAnalytics, true
	default:
		return "", false
	}
}
