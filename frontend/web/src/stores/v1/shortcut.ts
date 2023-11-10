import { create } from "zustand";
import { shortcutServiceClient } from "@/grpcweb";
import { Shortcut } from "@/types/proto/api/v2/shortcut_service";

interface ShortcutState {
  shortcutMapById: Record<ShortcutId, Shortcut>;
  fetchShortcutList: () => Promise<Shortcut[]>;
  getOrFetchShortcutById: (id: ShortcutId) => Promise<Shortcut>;
  getShortcutById: (id: ShortcutId) => Shortcut;
  getShortcutList: () => Shortcut[];
}

const useShortcutStore = create<ShortcutState>()((set, get) => ({
  shortcutMapById: {},
  fetchShortcutList: async () => {
    const { shortcuts } = await shortcutServiceClient.listShortcuts({});
    const shortcutMap = get().shortcutMapById;
    shortcuts.forEach((shortcut) => {
      shortcutMap[shortcut.id] = shortcut;
    });
    set(shortcutMap);
    return shortcuts;
  },
  getOrFetchShortcutById: async (id: ShortcutId) => {
    const shortcutMap = get().shortcutMapById;
    if (shortcutMap[id]) {
      return shortcutMap[id] as Shortcut;
    }

    const { shortcut } = await shortcutServiceClient.getShortcut({
      id: id,
    });
    if (!shortcut) {
      throw new Error(`Shortcut with id ${id} not found`);
    }

    shortcutMap[id] = shortcut;
    set(shortcutMap);
    return shortcut;
  },
  getShortcutById: (id: ShortcutId) => {
    const shortcutMap = get().shortcutMapById;
    return shortcutMap[id] as Shortcut;
  },
  getShortcutList: () => {
    return Object.values(get().shortcutMapById);
  },
}));

export default useShortcutStore;
