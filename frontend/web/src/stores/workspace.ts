import { create } from "zustand";
import { workspaceServiceClient } from "@/grpcweb";
import { Subscription } from "@/types/proto/api/v1/subscription_service";
import { WorkspaceProfile, WorkspaceSetting } from "@/types/proto/api/v1/workspace_service";

export enum FeatureType {
  SSO = "ysh.slash.sso",
  AdvancedAnalytics = "ysh.slash.advanced-analytics",
  UnlimitedAccounts = "ysh.slash.unlimited-accounts",
  UnlimitedShortcuts = "ysh.slash.unlimited-shortcuts",
  UnlimitedCollections = "ysh.slash.unlimited-collections",
  CustomeBranding = "ysh.slash.custom-branding",
}

interface WorkspaceState {
  profile: WorkspaceProfile;
  setting: WorkspaceSetting;

  // Workspace related actions.
  fetchWorkspaceProfile: () => Promise<WorkspaceProfile>;
  fetchWorkspaceSetting: () => Promise<WorkspaceSetting>;
  getSubscription: () => Subscription;
  checkFeatureAvailable: (feature: FeatureType) => boolean;
}

const useWorkspaceStore = create<WorkspaceState>()((set, get) => ({
  profile: WorkspaceProfile.fromPartial({}),
  setting: WorkspaceSetting.fromPartial({}),
  fetchWorkspaceProfile: async () => {
    const workspaceProfile = await workspaceServiceClient.getWorkspaceProfile({});
    set({ ...get(), profile: workspaceProfile });
    return workspaceProfile;
  },
  fetchWorkspaceSetting: async () => {
    const workspaceSetting = await workspaceServiceClient.getWorkspaceSetting({});
    set({ ...get(), setting: workspaceSetting });
    return workspaceSetting;
  },
  getSubscription: () => Subscription.fromPartial(get().profile.subscription || {}),
  checkFeatureAvailable: (feature: FeatureType): boolean => {
    return get().profile.subscription?.features.includes(feature) || false;
  },
}));

export default useWorkspaceStore;
