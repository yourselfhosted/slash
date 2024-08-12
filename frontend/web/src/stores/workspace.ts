import { create } from "zustand";
import { workspaceServiceClient } from "@/grpcweb";
import { WorkspaceProfile, WorkspaceSetting } from "@/types/proto/api/v1/workspace_service";

export enum FeatureType {
  SSO = "ysh.slash.sso",
  AdvancedAnalytics = "ysh.slash.advanced-analytics",
  UnlimitedAccounts = "ysh.slash.unlimited-accounts",
  UnlimitedCollections = "ysh.slash.unlimited-collections",
  CustomeBranding = "ysh.slash.custom-branding",
}

interface WorkspaceState {
  profile: WorkspaceProfile;
  setting: WorkspaceSetting;

  // Workspace related actions.
  fetchWorkspaceProfile: () => Promise<WorkspaceProfile>;
  fetchWorkspaceSetting: () => Promise<WorkspaceSetting>;
  checkFeatureAvailable: (feature: FeatureType) => boolean;
}

const useWorkspaceStore = create<WorkspaceState>()((set, get) => ({
  profile: WorkspaceProfile.fromPartial({}),
  setting: WorkspaceSetting.fromPartial({}),
  fetchWorkspaceProfile: async () => {
    const workspaceProfile = (await workspaceServiceClient.getWorkspaceProfile({})).profile as WorkspaceProfile;
    set({ ...get(), profile: workspaceProfile });
    console.log("workspaceProfile", workspaceProfile);
    return workspaceProfile;
  },
  fetchWorkspaceSetting: async () => {
    const workspaceSetting = (await workspaceServiceClient.getWorkspaceSetting({})).setting as WorkspaceSetting;
    set({ ...get(), setting: workspaceSetting });
    return workspaceSetting;
  },
  checkFeatureAvailable: (feature: FeatureType): boolean => {
    return get().profile.features.includes(feature);
  },
}));

export default useWorkspaceStore;
