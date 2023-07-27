import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Filter {
  tab?: string;
  tag?: string;
  visibility?: Visibility;
  search?: string;
}

export interface Order {
  field: "name" | "createdTs" | "updatedTs" | "view";
  direction: "asc" | "desc";
}

interface ViewState {
  filter: Filter;
  order: Order;
  setFilter: (filter: Partial<Filter>) => void;
  getOrder: () => Order;
  setOrder: (order: Partial<Order>) => void;
}

const useViewStore = create<ViewState>()(
  persist(
    (set, get) => ({
      filter: {},
      order: {
        field: "name",
        direction: "asc",
      },
      setFilter: (filter: Partial<Filter>) => {
        set({ filter: { ...get().filter, ...filter } });
      },
      getOrder: () => {
        return {
          field: get().order.field || "name",
          direction: get().order.direction || "asc",
        };
      },
      setOrder: (order: Partial<Order>) => {
        set({ order: { ...get().order, ...order } });
      },
    }),
    {
      name: "view",
    }
  )
);

export const getFilteredShortcutList = (shortcutList: Shortcut[], filter: Filter, currentUser: User) => {
  const { tab, tag, visibility, search } = filter;
  const filteredShortcutList = shortcutList.filter((shortcut) => {
    if (tag) {
      if (!shortcut.tags.includes(tag)) {
        return false;
      }
    }
    if (visibility) {
      if (shortcut.visibility !== visibility) {
        return false;
      }
    }
    if (search) {
      if (
        !shortcut.name.toLowerCase().includes(search.toLowerCase()) &&
        !shortcut.description.toLowerCase().includes(search.toLowerCase()) &&
        !shortcut.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase())) &&
        !shortcut.link.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
    }
    if (tab) {
      if (tab === "tab:mine") {
        return shortcut.creatorId === currentUser.id;
      } else if (tab.startsWith("tag:")) {
        const tag = tab.split(":")[1];
        return shortcut.tags.includes(tag);
      }
    }
    return true;
  });
  return filteredShortcutList;
};

export const getOrderedShortcutList = (shortcutList: Shortcut[], order: Order) => {
  const { field, direction } = {
    field: order.field || "name",
    direction: order.direction || "asc",
  };
  const orderedShortcutList = shortcutList.sort((a, b) => {
    if (field === "name") {
      return direction === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    } else if (field === "createdTs") {
      return direction === "asc" ? a.createdTs - b.createdTs : b.createdTs - a.createdTs;
    } else if (field === "updatedTs") {
      return direction === "asc" ? a.updatedTs - b.updatedTs : b.updatedTs - a.updatedTs;
    } else if (field === "view") {
      return direction === "asc" ? a.view - b.view : b.view - a.view;
    } else {
      return 0;
    }
  });
  return orderedShortcutList;
};

export default useViewStore;
