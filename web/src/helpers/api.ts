import axios from "axios";

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

export function patchUser(userPatch: UserPatch) {
  return axios.patch<User>(`/api/v1/user/${userPatch.id}`, userPatch);
}

export function deleteUser(userDelete: UserDelete) {
  return axios.delete(`/api/v1/user/${userDelete.id}`);
}

export function getShortcutList(shortcutFind?: ShortcutFind) {
  const queryList = [];
  if (shortcutFind?.tag) {
    queryList.push(`tag=${shortcutFind.tag}`);
  }
  return axios.get<Shortcut[]>(`/api/v1/shortcut?${queryList.join("&")}`);
}

export function createShortcut(shortcutCreate: ShortcutCreate) {
  return axios.post<Shortcut>("/api/v1/shortcut", shortcutCreate);
}

export function patchShortcut(shortcutPatch: ShortcutPatch) {
  return axios.patch<Shortcut>(`/api/v1/shortcut/${shortcutPatch.id}`, shortcutPatch);
}

export function deleteShortcutById(shortcutId: ShortcutId) {
  return axios.delete(`/api/v1/shortcut/${shortcutId}`);
}

export function upsertWorkspaceSetting(key: string, value: string) {
  return axios.post(`/api/v1/workspace/setting`, {
    key,
    value,
  });
}

export function getUrlFavicon(url: string) {
  return axios.get<string>(`/api/v1/url/favicon?url=${url}`);
}
