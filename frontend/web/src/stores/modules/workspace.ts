import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WorkspaceProfile } from "@/types/proto/api/v2/workspace_service";

type State = {
  workspaceProfile: WorkspaceProfile;
};

const workspaceSlice = createSlice({
  name: "workspace",
  initialState: {} as State,
  reducers: {
    setWorkspaceState: (_, action: PayloadAction<State>) => {
      return action.payload;
    },
  },
});

export const { setWorkspaceState } = workspaceSlice.actions;

export default workspaceSlice.reducer;
