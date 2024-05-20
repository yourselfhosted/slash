import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Visibility } from "@/types/proto/api/v1/common";
import { Shortcut } from "@/types/proto/api/v1/shortcut_service";
import { User } from "@/types/proto/api/v1/user_service";

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

export type DisplayStyle = "full" | "compact";

interface ViewState {
  filter: Filter;
  order: Order;
  displayStyle: DisplayStyle;
  setFilter: (filter: Partial<Filter>) => void;
  getOrder: () => Order;
  setOrder: (order: Partial<Order>) => void;
  setDisplayStyle: (displayStyle: DisplayStyle) => void;
}

const useViewStore = create<ViewState>()(
  persist(
    (set, get) => ({
      filter: {},
      order: {
        field: "name",
        direction: "asc",
      },
      displayStyle: "full",
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
      setDisplayStyle: (displayStyle: DisplayStyle) => {
        set({ displayStyle });
      },
    }),
    {
      name: "view",
    },
  ),
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
      return direction === "asc"
        ? getDateTimestamp(a.createdTime) - getDateTimestamp(b.createdTime)
        : getDateTimestamp(b.createdTime) - getDateTimestamp(a.createdTime);
    } else if (field === "updatedTs") {
      return direction === "asc"
        ? getDateTimestamp(a.updatedTime) - getDateTimestamp(b.updatedTime)
        : getDateTimestamp(b.updatedTime) - getDateTimestamp(a.updatedTime);
    } else if (field === "view") {
      return direction === "asc" ? a.viewCount - b.viewCount : b.viewCount - a.viewCount;
    } else {
      return 0;
    }
  });
  return orderedShortcutList;
};

const getDateTimestamp = (date: Date = new Date()) => {
  return new Date(date).getTime();
};

export default useViewStore;
