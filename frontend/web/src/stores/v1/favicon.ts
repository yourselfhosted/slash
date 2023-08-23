import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as api from "../../helpers/api";

interface FaviconState {
  cache: {
    [key: string]: string;
  };
  getOrFetchUrlFavicon: (url: string) => Promise<string>;
}

const useFaviconStore = create<FaviconState>()(
  persist(
    (set, get) => ({
      cache: {},
      getOrFetchUrlFavicon: async (url: string) => {
        const cache = get().cache;
        if (cache[url]) {
          return cache[url];
        }

        try {
          const { data: favicon } = await api.getUrlFavicon(url);
          if (favicon) {
            cache[url] = favicon;
            set(cache);
            return favicon;
          }
        } catch (error) {
          // do nothing
        }
        return "";
      },
    }),
    {
      name: "favicon_cache",
    }
  )
);

export default useFaviconStore;
