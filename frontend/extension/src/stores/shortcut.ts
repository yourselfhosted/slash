import axios from "axios";
import { create } from "zustand";
import { combine } from "zustand/middleware";
import { ListShortcutsResponse, Shortcut } from "@/types/proto/api/v1/shortcut_service";

interface State {
  shortcutMapById: Record<number, Shortcut>;
}

const getDefaultState = (): State => {
  return {
    shortcutMapById: {},
  };
};

const useShortcutStore = create(
  combine(getDefaultState(), (set, get) => ({
    fetchShortcutList: async (instanceUrl: string, accessToken: string) => {
      const {
        data: { shortcuts },
      } = await axios.get<ListShortcutsResponse>(`${instanceUrl}/api/v1/shortcuts`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const shortcutMap = get().shortcutMapById;
      shortcuts.forEach((shortcut) => {
        shortcutMap[shortcut.id] = shortcut;
      });
      set({ shortcutMapById: shortcutMap });
      return shortcuts;
    },
    getShortcutList: () => {
      return Object.values(get().shortcutMapById);
    },
    createShortcut: async (instanceUrl: string, accessToken: string, create: Shortcut) => {
      const { data: shortcut } = await axios.post<Shortcut>(`${instanceUrl}/api/v1/shortcuts`, create, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const shortcutMap = get().shortcutMapById;
      shortcutMap[shortcut.id] = shortcut;
      set({ shortcutMapById: shortcutMap });
      return shortcut;
    },
  })),
);

export default useShortcutStore;
