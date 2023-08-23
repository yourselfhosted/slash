import * as api from "../helpers/api";
import store from "../stores";
import { setGlobalState } from "../stores/modules/global";

const globalService = {
  getState: () => {
    return store.getState().global;
  },

  initialState: async () => {
    try {
      const workspaceProfile = (await api.getWorkspaceProfile()).data;
      store.dispatch(setGlobalState({ workspaceProfile }));
    } catch (error) {
      // do nth
    }
  },
};

export default globalService;
