import * as api from "../helpers/api";
import store from "../store";
import { createWorkspace, deleteWorkspace, patchWorkspace, setWorkspaceList } from "../store/modules/workspace";

const convertResponseModelWorkspace = (workspace: Workspace): Workspace => {
  return {
    ...workspace,
    createdTs: workspace.createdTs * 1000,
    updatedTs: workspace.updatedTs * 1000,
  };
};

const workspaceService = {
  getState: () => {
    return store.getState().workspace;
  },

  fetchWorkspaceList: async () => {
    const { data } = (await api.getWorkspaceList()).data;
    const workspaces = data.map((w) => convertResponseModelWorkspace(w));
    store.dispatch(setWorkspaceList(workspaces));
    return workspaces;
  },

  getWorkspaceByName: (workspaceName: string) => {
    const workspaceList = workspaceService.getState().workspaceList;
    for (const workspace of workspaceList) {
      if (workspace.name === workspaceName) {
        return workspace;
      }
    }
    return undefined;
  },

  getWorkspaceById: (id: WorkspaceId) => {
    const workspaceList = workspaceService.getState().workspaceList;
    for (const workspace of workspaceList) {
      if (workspace.id === id) {
        return workspace;
      }
    }
    return undefined;
  },

  createWorkspace: async (create: WorkspaceCreate) => {
    const { data } = (await api.createWorkspace(create)).data;
    const workspace = convertResponseModelWorkspace(data);
    store.dispatch(createWorkspace(workspace));
    return workspace;
  },

  patchWorkspace: async (patch: WorkspacePatch) => {
    const { data } = (await api.patchWorkspace(patch)).data;
    const workspace = convertResponseModelWorkspace(data);
    store.dispatch(patchWorkspace(workspace));
    return workspace;
  },

  deleteWorkspaceById: async (id: WorkspaceId) => {
    await api.deleteWorkspaceById(id);
    store.dispatch(deleteWorkspace(id));
  },
};

export default workspaceService;
