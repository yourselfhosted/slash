import { createContext, useContext, useEffect, useState } from "react";
import { useUserStore, useWorkspaceStore } from "@/stores";

interface Context {}

const CommonContext = createContext<Context>({});

const CommonContextProvider = ({ children }: { children: React.ReactNode }) => {
  const workspaceStore = useWorkspaceStore();
  const userStore = useUserStore();
  const [commonContext, setCommonContext] = useState<Context>({});
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await Promise.all([workspaceStore.fetchWorkspaceProfile(), workspaceStore.fetchWorkspaceSetting(), userStore.fetchCurrentUser()]);
      } catch (error) {
        // Do nothing.
      }
      setInitialized(true);
    })();
  }, []);

  return (
    <CommonContext.Provider
      value={{
        ...commonContext,
        setLocale: (locale: string) => setCommonContext({ ...commonContext, locale }),
        setAppearance: (appearance: string) => setCommonContext({ ...commonContext, appearance }),
      }}
    >
      {!initialized ? null : <>{children}</>}
    </CommonContext.Provider>
  );
};

export const useCommonContext = () => {
  return useContext(CommonContext);
};

export default CommonContextProvider;
