import { Storage } from "@plasmohq/storage";
import { useEffect, useState } from "react";
import { Visibility } from "@/types/proto/api/v1/common";
import { StorageContext } from "./context";

interface Props {
  children: React.ReactNode;
}

const StorageContextProvider = ({ children }: Props) => {
  const storage = new Storage();
  const [instanceUrl, setInstanceUrl] = useState<string | undefined>(undefined);
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined);
  const [defaultVisibility, setDefaultVisibility] = useState<Visibility>(Visibility.PRIVATE);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    (async () => {
      const domain = await storage.get("domain");
      const accessToken = await storage.get("access_token");
      const defaultVisibility = (await storage.get("default_visibility")) as Visibility;

      setInstanceUrl(domain);
      setAccessToken(accessToken);
      setDefaultVisibility(defaultVisibility);
      setIsInitialized(true);
    })();

    storage.watch({
      domain: (c) => {
        setInstanceUrl(c.newValue);
      },
      access_token: (c) => {
        setAccessToken(c.newValue);
      },
      default_visibility: (c) => {
        setDefaultVisibility(c.newValue as Visibility);
      },
    });
  }, []);

  return (
    <StorageContext.Provider
      value={{
        instanceUrl,
        accessToken,
        defaultVisibility,
        setInstanceUrl: (instanceUrl: string) => storage.set("domain", instanceUrl),
        setAccessToken: (accessToken: string) => storage.set("access_token", accessToken),
        setDefaultVisibility: (visibility: Visibility) => storage.set("default_visibility", visibility),
      }}
    >
      {isInitialized && children}
    </StorageContext.Provider>
  );
};

export default StorageContextProvider;
