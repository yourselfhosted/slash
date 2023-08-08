import { Button, Input } from "@mui/joy";
import { useStorage } from "@plasmohq/storage/hook";
import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import Icon from "./components/Icon";
import "./style.css";

interface SettingState {
  domain: string;
  accessToken: string;
}

function IndexOptions() {
  const [domain, setDomain] = useStorage<string>("domain", (v) => (v ? v : ""));
  const [accessToken, setAccessToken] = useStorage<string>("access_token", (v) => (v ? v : ""));
  const [settingState, setSettingState] = useState<SettingState>({
    domain,
    accessToken,
  });

  useEffect(() => {
    setSettingState({
      domain,
      accessToken,
    });
  }, [domain, accessToken]);

  const setPartialSettingState = (partialSettingState: Partial<SettingState>) => {
    setSettingState((prevState) => ({
      ...prevState,
      ...partialSettingState,
    }));
  };

  const handleSaveSetting = () => {
    if (!settingState.domain || !settingState.accessToken) {
      toast.error("Domain and access token are required");
      return;
    }

    setDomain(settingState.domain);
    setAccessToken(settingState.accessToken);
    toast.success("Setting saved");
  };

  return (
    <>
      <div className="w-full">
        <div className="w-full max-w-lg mx-auto flex flex-col justify-start items-start mt-12">
          <h2 className="flex flex-row justify-start items-center mb-6 font-mono">
            <Icon.CircleSlash className="w-8 h-auto mr-2 text-gray-500" />
            <span className="text-lg">Slash</span>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-lg">Setting</span>
          </h2>

          <div className="w-full flex flex-col justify-start items-start mb-4">
            <span className="mb-2 text-base">Domain</span>
            <div className="relative w-full">
              <Input
                className="w-full"
                type="text"
                placeholder="The domain of your Slash instance"
                value={settingState.domain}
                onChange={(e) => setPartialSettingState({ domain: e.target.value })}
              />
            </div>
          </div>

          <div className="w-full flex flex-col justify-start items-start">
            <span className="mb-2 text-base">Access Token</span>
            <div className="relative w-full">
              <Input
                className="w-full"
                type="text"
                placeholder="The access token of your Slash instance"
                value={settingState.accessToken}
                onChange={(e) => setPartialSettingState({ accessToken: e.target.value })}
              />
            </div>
          </div>

          <div className="w-full mt-6">
            <Button onClick={handleSaveSetting}>Save</Button>
          </div>
        </div>
      </div>

      <Toaster position="top-center" />
    </>
  );
}

export default IndexOptions;
