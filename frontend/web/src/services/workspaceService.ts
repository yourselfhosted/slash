import { workspaceServiceClient } from "@/grpcweb";
import { WorkspaceProfile } from "@/types/proto/api/v2/workspace_service";
import store from "../stores";
import { setWorkspaceState } from "../stores/modules/workspace";

const workspaceService = {
  getState: () => {
    return store.getState().global;
  },

  initialState: async () => {
    try {
      const workspaceProfile = (await workspaceServiceClient.getWorkspaceProfile({})).profile as WorkspaceProfile;
      store.dispatch(setWorkspaceState({ workspaceProfile }));
    } catch (error) {
      // do nth
    }
  },
};

export default workspaceService;
