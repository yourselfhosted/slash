import { isEqual } from "lodash-es";
import { create } from "zustand";
import { combine } from "zustand/middleware";
import { shortcutServiceClient } from "@/grpcweb";
import { Shortcut } from "@/types/proto/api/v1/shortcut_service";

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
    fetchShortcutList: async () => {
      const { shortcuts } = await shortcutServiceClient.listShortcuts({});
      const shortcutMap = get().shortcutMapById;
      shortcuts.forEach((shortcut) => {
        shortcutMap[shortcut.id] = shortcut;
      });
      set({ shortcutMapById: shortcutMap });
      return shortcuts;
    },
    fetchShortcutByName: async (name: string) => {
      const { shortcut } = await shortcutServiceClient.getShortcutByName({
        name,
      });
      if (!shortcut) {
        throw new Error(`Shortcut with name ${name} not found`);
      }
      return shortcut;
    },
    getOrFetchShortcutById: async (id: number) => {
      const shortcutMap = get().shortcutMapById;
      if (shortcutMap[id]) {
        return shortcutMap[id] as Shortcut;
      }

      const { shortcut } = await shortcutServiceClient.getShortcut({
        id,
      });
      if (!shortcut) {
        throw new Error(`Shortcut with id ${id} not found`);
      }

      shortcutMap[id] = shortcut;
      set({ shortcutMapById: shortcutMap });
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
      set({ shortcutMapById: shortcutMap });
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
      set({ shortcutMapById: shortcutMap });
      return updatedShortcut;
    },
    deleteShortcut: async (id: number) => {
      await shortcutServiceClient.deleteShortcut({
        id,
      });
      const shortcutMap = get().shortcutMapById;
      delete shortcutMap[id];
      set({ shortcutMapById: shortcutMap });
    },
  }))
);

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
