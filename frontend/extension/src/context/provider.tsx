import { Storage } from "@plasmohq/storage";
import { useEffect, useState } from "react";
import { StorageContext } from "./context";

interface Props {
  children: React.ReactNode;
}

const StorageContextProvider = ({ children }: Props) => {
  const storage = new Storage();
  const [instanceUrl, setInstanceUrl] = useState<string | undefined>(undefined);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    (async () => {
      const instanceUrl = await storage.get("instance_url");

      setInstanceUrl(instanceUrl);
      setIsInitialized(true);
    })();

    storage.watch({
      instance_url: (c) => {
        setInstanceUrl(c.newValue);
      },
    });
  }, []);

  return (
    <StorageContext.Provider
      value={{
        instanceUrl,
        setInstanceUrl: (instanceUrl: string) => storage.set("instance_url", instanceUrl),
      }}
    >
      {isInitialized && children}
    </StorageContext.Provider>
  );
};

export default StorageContextProvider;
