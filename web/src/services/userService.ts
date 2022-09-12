import * as api from "../helpers/api";
import store from "../store";
import { setUser, patchUser } from "../store/modules/user";

export const convertResponseModelUser = (user: User): User => {
  return {
    ...user,
    createdTs: user.createdTs * 1000,
    updatedTs: user.updatedTs * 1000,
  };
};

const userService = {
  getState: () => {
    return store.getState().user;
  },

  initialState: async () => {
    try {
      const { data: user } = (await api.getMyselfUser()).data;
      if (user) {
        store.dispatch(setUser(convertResponseModelUser(user)));
      }
    } catch (error) {
      // do nth
    }
  },

  doSignIn: async () => {
    const { data: user } = (await api.getMyselfUser()).data;
    if (user) {
      store.dispatch(setUser(convertResponseModelUser(user)));
    } else {
      userService.doSignOut();
    }
    return user;
  },

  doSignOut: async () => {
    store.dispatch(setUser());
    await api.signout();
  },

  getUserById: async (userId: UserId) => {
    const { data: user } = (await api.getUserById(userId)).data;
    if (user) {
      return convertResponseModelUser(user);
    } else {
      return undefined;
    }
  },

  patchUser: async (userPatch: UserPatch): Promise<void> => {
    const { data } = (await api.patchUser(userPatch)).data;
    if (userPatch.id === store.getState().user.user?.id) {
      const user = convertResponseModelUser(data);
      store.dispatch(patchUser(user));
    }
  },

  deleteUser: async (userDelete: UserDelete) => {
    await api.deleteUser(userDelete);
  },
};

export default userService;
