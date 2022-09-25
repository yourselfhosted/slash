import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UNKNOWN_ID } from "../../helpers/consts";

export const unknownWorkspace = {
  id: UNKNOWN_ID,
} as Workspace;

export const unknownWorkspaceUser = {
  workspaceId: UNKNOWN_ID,
  userId: UNKNOWN_ID,
} as WorkspaceUser;

interface State {
  workspaceList: Workspace[];
}

const workspaceSlice = createSlice({
  name: "workspace",
  initialState: {
    workspaceList: [],
  } as State,
  reducers: {
    setWorkspaceList: (state, action: PayloadAction<Workspace[]>) => {
      return {
        ...state,
        workspaceList: action.payload,
      };
    },
    createWorkspace: (state, action: PayloadAction<Workspace>) => {
      return {
        ...state,
        workspaceList: state.workspaceList.concat(action.payload).sort((a, b) => b.createdTs - a.createdTs),
      };
    },
    patchWorkspace: (state, action: PayloadAction<Partial<Workspace>>) => {
      return {
        ...state,
        workspaceList: state.workspaceList.map((s) => {
          if (s.id === action.payload.id) {
            return {
              ...s,
              ...action.payload,
            };
          } else {
            return s;
          }
        }),
      };
    },
    deleteWorkspace: (state, action: PayloadAction<WorkspaceId>) => {
      return {
        ...state,
        workspaceList: [...state.workspaceList].filter((workspace) => workspace.id !== action.payload),
      };
    },
  },
});

export const { setWorkspaceList, createWorkspace, patchWorkspace, deleteWorkspace } = workspaceSlice.actions;

export default workspaceSlice.reducer;
