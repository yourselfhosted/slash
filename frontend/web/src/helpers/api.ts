import axios from "axios";
import { userServiceClient, workspaceSettingServiceClient } from "@/grpcweb";
import { WorkspaceSetting } from "@/types/proto/api/v2/workspace_setting_service";

export function getWorkspaceProfile() {
  return axios.get<WorkspaceProfile>("/api/v1/workspace/profile");
}

export function signin(email: string, password: string) {
  return axios.post<User>("/api/v1/auth/signin", {
    email,
    password,
  });
}

export function signup(email: string, nickname: string, password: string) {
  return axios.post<User>("/api/v1/auth/signup", {
    email,
    nickname,
    password,
  });
}

export function signout() {
  return axios.post("/api/v1/auth/logout");
}

export function getMyselfUser() {
  return axios.get<User>("/api/v1/user/me");
}

export function getUserList() {
  return axios.get<User[]>("/api/v1/user");
}

export function getUserById(id: number) {
  return axios.get<User>(`/api/v1/user/${id}`);
}

export function createUser(userCreate: UserCreate) {
  return axios.post<User>("/api/v1/user", userCreate);
}

export function patchUser(userPatch: UserPatch) {
  return axios.patch<User>(`/api/v1/user/${userPatch.id}`, userPatch);
}

export function deleteUser(userId: UserId) {
  return userServiceClient.deleteUser({ id: userId });
}

export function getShortcutList(shortcutFind?: ShortcutFind) {
  const queryList = [];
  if (shortcutFind?.tag) {
    queryList.push(`tag=${shortcutFind.tag}`);
  }
  return axios.get<Shortcut[]>(`/api/v1/shortcut?${queryList.join("&")}`);
}

export function getShortcutById(id: number) {
  return axios.get<Shortcut>(`/api/v1/shortcut/${id}`);
}

export function createShortcut(shortcutCreate: ShortcutCreate) {
  return axios.post<Shortcut>("/api/v1/shortcut", shortcutCreate);
}

export function getShortcutAnalytics(shortcutId: ShortcutId) {
  return axios.get<AnalysisData>(`/api/v1/shortcut/${shortcutId}/analytics`);
}

export function patchShortcut(shortcutPatch: ShortcutPatch) {
  return axios.patch<Shortcut>(`/api/v1/shortcut/${shortcutPatch.id}`, shortcutPatch);
}

export function deleteShortcutById(shortcutId: ShortcutId) {
  return axios.delete(`/api/v1/shortcut/${shortcutId}`);
}

export function getWorkspaceSetting() {
  return workspaceSettingServiceClient.getWorkspaceSetting({});
}

export function updateWorkspaceSetting(setting: WorkspaceSetting, updateMask: string[]) {
  return workspaceSettingServiceClient.updateWorkspaceSetting({
    setting,
    updateMask,
  });
}

export function getUrlFavicon(url: string) {
  return axios.get<string>(`/api/v1/url/favicon?url=${url}`);
}
