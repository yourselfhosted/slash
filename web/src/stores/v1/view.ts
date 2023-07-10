import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Filter {
  tag?: string;
  mineOnly?: boolean;
  visibility?: Visibility;
}

interface ViewState {
  filter: Filter;
  setFilter: (filter: Partial<Filter>) => void;
}

const useViewStore = create<ViewState>()(
  persist(
    (set, get) => ({
      filter: {},
      setFilter: (filter: Partial<Filter>) => {
        set({ filter: { ...get().filter, ...filter } });
      },
    }),
    {
      name: "view",
    }
  )
);

export default useViewStore;
