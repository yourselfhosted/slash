import { createContext, useContext } from "react";
import { Visibility } from "@/types/proto/api/v1/common";

interface Context {
  instanceUrl?: string;
  accessToken?: string;
  defaultVisibility: string;
  setInstanceUrl: (instanceUrl: string) => void;
  setAccessToken: (accessToken: string) => void;
  setDefaultVisibility: (visibility: string) => void;
}

export const StorageContext = createContext<Context>({
  instanceUrl: undefined,
  accessToken: undefined,
  defaultVisibility: Visibility.PRIVATE,
  setInstanceUrl: () => {},
  setAccessToken: () => {},
  setDefaultVisibility: () => {},
});

const useStorageContext = () => {
  const context = useContext(StorageContext);
  return context;
};

export default useStorageContext;
