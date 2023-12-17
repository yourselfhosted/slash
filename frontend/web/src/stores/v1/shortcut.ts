import { isEqual } from "lodash-es";
import { create } from "zustand";
import { shortcutServiceClient } from "@/grpcweb";
import { Shortcut } from "@/types/proto/api/v2/shortcut_service";

interface ShortcutState {
  shortcutMapByName: Record<string, Shortcut>;
  fetchShortcutList: () => Promise<Shortcut[]>;
  fetchShortcutById: (id: number) => Promise<Shortcut>;
  getOrFetchShortcutByName: (name: string) => Promise<Shortcut>;
  getShortcutByName: (name: string) => Shortcut;
  getShortcutList: () => Shortcut[];
  createShortcut: (shortcut: Shortcut) => Promise<Shortcut>;
  updateShortcut: (shortcut: Partial<Shortcut>, updateMask: string[]) => Promise<Shortcut>;
  deleteShortcut: (name: string) => Promise<void>;
}

const useShortcutStore = create<ShortcutState>()((set, get) => ({
  shortcutMapById: {},
  shortcutMapByName: {},
  fetchShortcutList: async () => {
    const { shortcuts } = await shortcutServiceClient.listShortcuts({});
    const shortcutMap = get().shortcutMapByName;
    shortcuts.forEach((shortcut) => {
      shortcutMap[shortcut.name] = shortcut;
    });
    set(shortcutMap);
    return shortcuts;
  },
  fetchShortcutById: async (id: number) => {
    const { shortcut } = await shortcutServiceClient.getShortcutById({
      id: id,
    });
    if (!shortcut) {
      throw new Error(`Shortcut with id ${id} not found`);
    }
    return shortcut;
  },
  getOrFetchShortcutByName: async (name: string) => {
    const shortcutMap = get().shortcutMapByName;
    if (shortcutMap[name]) {
      return shortcutMap[name] as Shortcut;
    }

    const { shortcut } = await shortcutServiceClient.getShortcut({
      name,
    });
    if (!shortcut) {
      throw new Error(`Shortcut with name ${name} not found`);
    }

    shortcutMap[name] = shortcut;
    set(shortcutMap);
    return shortcut;
  },
  getShortcutByName: (name: string) => {
    const shortcutMap = get().shortcutMapByName;
    return shortcutMap[name] || unknownShortcut;
  },
  getShortcutList: () => {
    return Object.values(get().shortcutMapByName);
  },
  createShortcut: async (shortcut: Shortcut) => {
    const { shortcut: createdShortcut } = await shortcutServiceClient.createShortcut({
      shortcut: shortcut,
    });
    if (!createdShortcut) {
      throw new Error(`Failed to create shortcut`);
    }
    const shortcutMap = get().shortcutMapByName;
    shortcutMap[createdShortcut.name] = createdShortcut;
    set(shortcutMap);
    return createdShortcut;
  },
  updateShortcut: async (shortcut: Partial<Shortcut>, updateMask: string[]) => {
    const { shortcut: updatedShortcut } = await shortcutServiceClient.updateShortcut({
      shortcut: shortcut,
      updateMask,
    });
    if (!updatedShortcut) {
      throw new Error(`Failed to update shortcut`);
    }
    const shortcutMap = get().shortcutMapByName;
    shortcutMap[updatedShortcut.name] = updatedShortcut;
    set(shortcutMap);
    return updatedShortcut;
  },
  deleteShortcut: async (name: string) => {
    await shortcutServiceClient.deleteShortcut({
      name,
    });
    const shortcutMap = get().shortcutMapByName;
    delete shortcutMap[name];
    set(shortcutMap);
  },
}));

const unknownShortcut: Shortcut = Shortcut.fromPartial({
  id: -1,
  name: "Unknown",
});

export const getShortcutUpdateMask = (shortcut: Shortcut, updatingShortcut: Shortcut) => {
  const updateMask: string[] = [];
  if (!isEqual(shortcut.name, updatingShortcut.name)) {
    updateMask.push("name");
  }
  if (!isEqual(shortcut.link, updatingShortcut.link)) {
    updateMask.push("link");
  }
  if (!isEqual(shortcut.title, updatingShortcut.title)) {
    updateMask.push("title");
  }
  if (!isEqual(shortcut.description, updatingShortcut.description)) {
    updateMask.push("description");
  }
  if (!isEqual(shortcut.tags, updatingShortcut.tags)) {
    updateMask.push("tags");
  }
  if (!isEqual(shortcut.visibility, updatingShortcut.visibility)) {
    updateMask.push("visibility");
  }
  if (!isEqual(shortcut.ogMetadata, updatingShortcut.ogMetadata)) {
    updateMask.push("og_metadata");
  }
  return updateMask;
};

export default useShortcutStore;
