import { createContext, useContext } from "react";

interface Context {
  instanceUrl?: string;
  setInstanceUrl: (instanceUrl: string) => void;
}

export const StorageContext = createContext<Context>({
  instanceUrl: undefined,
  setInstanceUrl: () => {},
});

const useStorageContext = () => {
  const context = useContext(StorageContext);
  return context;
};

export default useStorageContext;
