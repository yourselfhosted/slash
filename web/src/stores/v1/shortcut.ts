import { create } from "zustand";
import * as api from "../../helpers/api";

const convertResponseModelShortcut = (shortcut: Shortcut): Shortcut => {
  return {
    ...shortcut,
    createdTs: shortcut.createdTs * 1000,
    updatedTs: shortcut.updatedTs * 1000,
  };
};

interface ShortcutState {
  shortcutMapById: Record<ShortcutId, Shortcut>;
  getOrFetchShortcutById: (id: ShortcutId) => Promise<Shortcut>;
  getShortcutById: (id: ShortcutId) => Shortcut;
}

const useShortcutStore = create<ShortcutState>()((set, get) => ({
  shortcutMapById: {},
  getOrFetchShortcutById: async (id: ShortcutId) => {
    const shortcutMap = get().shortcutMapById;
    if (shortcutMap[id]) {
      return shortcutMap[id] as Shortcut;
    }

    const { data } = await api.getShortcutById(id);
    const shortcut = convertResponseModelShortcut(data);
    shortcutMap[id] = shortcut;
    set(shortcutMap);
    return shortcut;
  },
  getShortcutById: (id: ShortcutId) => {
    const shortcutMap = get().shortcutMapById;
    return shortcutMap[id] as Shortcut;
  },
}));

export default useShortcutStore;
