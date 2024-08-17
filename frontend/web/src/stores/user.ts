import { create } from "zustand";
import { authServiceClient, userServiceClient, userSettingServiceClient } from "@/grpcweb";
import { User } from "@/types/proto/api/v1/user_service";
import { UserSetting } from "@/types/proto/api/v1/user_setting_service";

interface UserState {
  userMapById: Record<number, User>;
  userSettingMapById: Record<number, UserSetting>;
  currentUserId?: number;

  // User related actions.
  fetchUserList: () => Promise<User[]>;
  fetchCurrentUser: () => Promise<User>;
  getOrFetchUserById: (id: number) => Promise<User>;
  getUserById: (id: number) => User;
  getCurrentUser: () => User;
  setCurrentUserId: (id: number) => void;
  createUser: (create: Partial<User>) => Promise<User>;
  patchUser: (userPatch: Partial<User>, updateMask: string[]) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;

  // User setting related actions.
  fetchUserSetting: (userId: number) => Promise<UserSetting>;
  updateUserSetting: (userSetting: UserSetting, updateMask: string[]) => Promise<UserSetting>;
  getCurrentUserSetting: () => UserSetting;
}

const useUserStore = create<UserState>()((set, get) => ({
  userMapById: {},
  userSettingMapById: {},
  fetchUserList: async () => {
    const { users } = await userServiceClient.listUsers({});
    const userMap = get().userMapById;
    users.forEach((user) => {
      userMap[user.id] = user;
    });
    set(userMap);
    return users;
  },
  fetchCurrentUser: async () => {
    const user = await authServiceClient.getAuthStatus({});
    if (!user) {
      throw new Error("User not found");
    }
    const userMap = get().userMapById;
    userMap[user.id] = user;
    set({ userMapById: userMap, currentUserId: user.id });
    return user;
  },
  getOrFetchUserById: async (id: number) => {
    const userMap = get().userMapById;
    if (userMap[id]) {
      return userMap[id] as User;
    }

    const user = await userServiceClient.getUser({
      id: id,
    });
    userMap[id] = user;
    set(userMap);
    return user;
  },
  createUser: async (userCreate: Partial<User>) => {
    const user = await userServiceClient.createUser({
      user: userCreate,
    });
    const userMap = get().userMapById;
    userMap[user.id] = user;
    set(userMap);
    return user;
  },
  patchUser: async (userPatch: Partial<User>, updateMask: string[]) => {
    const user = await userServiceClient.updateUser({
      user: userPatch,
      updateMask: updateMask,
    });
    const userMap = get().userMapById;
    userMap[user.id] = user;
    set(userMap);
  },
  deleteUser: async (userId: number) => {
    await userServiceClient.deleteUser({
      id: userId,
    });
    const userMap = get().userMapById;
    delete userMap[userId];
    set(userMap);
  },
  getUserById: (id: number) => {
    const userMap = get().userMapById;
    return userMap[id] || unknownUser;
  },
  getCurrentUser: () => {
    const userMap = get().userMapById;
    const currentUserId = get().currentUserId;
    return userMap[currentUserId as number];
  },
  setCurrentUserId: (id: number) => {
    set({
      currentUserId: id,
    });
  },
  fetchUserSetting: async (userId: number) => {
    const userSetting = (
      await userSettingServiceClient.getUserSetting({
        id: userId,
      })
    ).userSetting as UserSetting;
    const userSettingMap = get().userSettingMapById;
    userSettingMap[userId] = userSetting;
    set(userSettingMap);
    return userSetting;
  },
  updateUserSetting: async (userSetting: UserSetting, updateMask: string[]) => {
    const userId = userSetting.userId;
    const updatedUserSetting = (
      await userSettingServiceClient.updateUserSetting({
        id: userId,
        userSetting,
        updateMask,
      })
    ).userSetting as UserSetting;
    const userSettingMap = get().userSettingMapById;
    userSettingMap[userId] = updatedUserSetting;
    set(userSettingMap);
    return updatedUserSetting;
  },
  getCurrentUserSetting: () => {
    const userSettingMap = get().userSettingMapById;
    const currentUserId = get().currentUserId;
    return userSettingMap[currentUserId as number];
  },
}));

const unknownUser: User = User.fromPartial({
  id: -1,
  email: "Unknown",
  nickname: "Unknown",
});

export default useUserStore;
