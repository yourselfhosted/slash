import axios from "axios";

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
