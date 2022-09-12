import store from "../store";
import { setGlobalState } from "../store/modules/global";
import userService from "./userService";

const globalService = {
  getState: () => {
    return store.getState().global;
  },

  initialState: async () => {
    const defaultGlobalState = {};

    try {
      await userService.initialState();
    } catch (error) {
      // do nth
    }

    store.dispatch(setGlobalState(defaultGlobalState));
  },
};

export default globalService;
