import { isEqual } from "lodash-es";
import { create } from "zustand";
import { shortcutServiceClient } from "@/grpcweb";
import { Shortcut } from "@/types/proto/api/v2/shortcut_service";

interface ShortcutState {
  shortcutMapById: Record<number, Shortcut>;
  fetchShortcutList: () => Promise<Shortcut[]>;
  getOrFetchShortcutById: (id: number) => Promise<Shortcut>;
  getShortcutById: (id: number) => Shortcut;
  getShortcutList: () => Shortcut[];
  createShortcut: (shortcut: Shortcut) => Promise<Shortcut>;
  updateShortcut: (shortcut: Partial<Shortcut>, updateMask: string[]) => Promise<Shortcut>;
  deleteShortcut: (id: number) => Promise<void>;
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
  getOrFetchShortcutById: async (id: number) => {
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
  getShortcutById: (id: number) => {
    const shortcutMap = get().shortcutMapById;
    return shortcutMap[id] || unknownShortcut;
  },
  getShortcutList: () => {
    return Object.values(get().shortcutMapById);
  },
  createShortcut: async (shortcut: Shortcut) => {
    const { shortcut: createdShortcut } = await shortcutServiceClient.createShortcut({
      shortcut: shortcut,
    });
    if (!createdShortcut) {
      throw new Error(`Failed to create shortcut`);
    }
    const shortcutMap = get().shortcutMapById;
    shortcutMap[createdShortcut.id] = createdShortcut;
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
    const shortcutMap = get().shortcutMapById;
    shortcutMap[updatedShortcut.id] = updatedShortcut;
    set(shortcutMap);
    return updatedShortcut;
  },
  deleteShortcut: async (id: number) => {
    await shortcutServiceClient.deleteShortcut({
      id: id,
    });
    const shortcutMap = get().shortcutMapById;
    delete shortcutMap[id];
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
