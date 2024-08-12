// const (
// 	// Enterprise features.
import { PlanType } from "@/types/proto/api/v1/subscription_service";

// 	// FeatureTypeSSO allows the user to use SSO.
// 	FeatureTypeSSO FeatureType = "ysh.slash.sso"
// 	// FeatureTypeAdvancedAnalytics allows the user to use advanced analytics.
// 	FeatureTypeAdvancedAnalytics FeatureType = "ysh.slash.advanced-analytics"

// 	// Usages.

// 	// FeatureTypeUnlimitedAccounts allows the user to create unlimited accounts.
// 	FeatureTypeUnlimitedAccounts FeatureType = "ysh.slash.unlimited-accounts"
// 	// FeatureTypeUnlimitedAccounts allows the user to create unlimited collections.
// 	FeatureTypeUnlimitedCollections FeatureType = "ysh.slash.unlimited-collections"

// 	// Customization.

// 	// FeatureTypeCustomeBranding allows the user to customize the branding.
// 	FeatureTypeCustomeBranding FeatureType = "ysh.slash.custom-branding"
// )

export enum FeatureType {
  SSO = "ysh.slash.sso",
  AdvancedAnalytics = "ysh.slash.advanced-analytics",
  UnlimitedAccounts = "ysh.slash.unlimited-accounts",
  UnlimitedCollections = "ysh.slash.unlimited-collections",
  CustomeBranding = "ysh.slash.custom-branding",
}

const FeatureMatrix: Record<FeatureType, [boolean, boolean, boolean]> = {
  [FeatureType.SSO]: [false, false, true],
  [FeatureType.AdvancedAnalytics]: [false, false, true],
  [FeatureType.UnlimitedAccounts]: [false, true, false],
  [FeatureType.UnlimitedCollections]: [false, true, true],
  [FeatureType.CustomeBranding]: [false, true, true],
};

export const checkFeatureAvailable = (feature: FeatureType, plan: PlanType): boolean => {
  const [isFree, isPro, isEnterprise] = FeatureMatrix[feature];
  switch (plan) {
    case PlanType.FREE:
      return isFree;
    case PlanType.PRO:
      return isPro;
    case PlanType.ENTERPRISE:
      return isEnterprise;
    default:
      return false;
  }
};
