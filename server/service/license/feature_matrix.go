package license

type FeatureType string

const (
	// Usages.

	// FeatureTypeUnlimitedAccounts allows the user to create unlimited accounts.
	FeatureTypeUnlimitedAccounts FeatureType = "unlimited_accounts"
	// FeatureTypeUnlimitedAccounts allows the user to create unlimited collections.
	FeatureTypeUnlimitedCollections FeatureType = "unlimited_collections"

	// Customization.

	// FeatureTypeCustomStyle allows the user to customize the style.
	FeatureTypeCustomeStyle FeatureType = "custom_style"
)

// FeatureMatrix is a matrix of features in [Free, Pro].
var FeatureMatrix = map[FeatureType][2]bool{
	FeatureTypeUnlimitedAccounts:    {false, true},
	FeatureTypeUnlimitedCollections: {false, true},
	FeatureTypeCustomeStyle:         {false, true},
}
