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
      let instanceUrl = await storage.get("instance_url");
      const accessToken = await storage.get("access_token");
      const defaultVisibility = (await storage.get("default_visibility")) as Visibility;

      // Migrate domain to instance_url.
      const domain = await storage.get("domain");
      if (domain) {
        instanceUrl = domain;
        await storage.remove("domain");
        await storage.set("instance_url", instanceUrl);
      }

      setInstanceUrl(instanceUrl);
      setAccessToken(accessToken);
      setDefaultVisibility(defaultVisibility);
      setIsInitialized(true);
    })();

    storage.watch({
      instance_url: (c) => {
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
        setInstanceUrl: (instanceUrl: string) => storage.set("instance_url", instanceUrl),
        setAccessToken: (accessToken: string) => storage.set("access_token", accessToken),
        setDefaultVisibility: (visibility: Visibility) => storage.set("default_visibility", visibility),
      }}
    >
      {isInitialized && children}
    </StorageContext.Provider>
  );
};

export default StorageContextProvider;
