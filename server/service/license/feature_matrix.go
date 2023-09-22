package license

type FeatureType string

const (
	// Accounts.

	// FeatureTypeUnlimitedAccounts allows the user to create unlimited accounts.
	FeatureTypeUnlimitedAccounts FeatureType = "unlimited_accounts"

	// Customization.

	// FeatureTypeCustomStyle allows the user to customize the style.
	FeatureTypeCustomeStyle FeatureType = "custom_style"
)

// FeatureMatrix is a matrix of features in [Free, Pro].
var FeatureMatrix = map[FeatureType][2]bool{
	FeatureTypeUnlimitedAccounts: {false, true},
	FeatureTypeCustomeStyle:      {false, true},
}
