import { create } from "zustand";

export interface Filter {
  tag?: string;
  mineOnly?: boolean;
}

interface FilterState {
  filter: Filter;
  setFilter: (filter: Partial<Filter>) => void;
}

const useFilterStore = create<FilterState>()((set, get) => ({
  filter: {},
  setFilter: (filter: Partial<Filter>) => {
    set({ filter: { ...get().filter, ...filter } });
  },
}));

export default useFilterStore;
