import type { Shortcut } from "./types/proto/api/v2/shortcut_service_pb";
import { Button, Divider, Input } from "@mui/joy";
import { useStorage } from "@plasmohq/storage/hook";
import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import Icon from "./components/Icon";
import PullShortcutsButton from "./components/PullShortcutsButton";
import ShortcutsContainer from "./components/ShortcutsContainer";
import "./style.css";

interface SettingState {
  domain: string;
  accessToken: string;
}

const IndexOptions = () => {
  const [domain, setDomain] = useStorage<string>("domain", (v) => (v ? v : ""));
  const [accessToken, setAccessToken] = useStorage<string>("access_token", (v) => (v ? v : ""));
  const [settingState, setSettingState] = useState<SettingState>({
    domain,
    accessToken,
  });
  const [shortcuts] = useStorage<Shortcut[]>("shortcuts", []);
  const isInitialized = domain && accessToken;

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
    setDomain(settingState.domain);
    setAccessToken(settingState.accessToken);
    toast.success("Setting saved");
  };

  return (
    <>
      <div className="w-full">
        <div className="w-full flex flex-row justify-center items-center">
          <a
            className="bg-yellow-100 mt-12 py-2 px-3 rounded-full border flex flex-row justify-start items-center cursor-pointer shadow hover:underline hover:text-blue-600"
            href="https://github.com/boojack/slash#browser-extension"
            target="_blank"
          >
            <Icon.HelpCircle className="w-4 h-auto" />
            <span className="mx-1 text-sm">Need help? Check out the docs</span>
            <Icon.ExternalLink className="w-4 h-auto" />
          </a>
        </div>

        <div className="w-full max-w-lg mx-auto flex flex-col justify-start items-start mt-12">
          <h2 className="flex flex-row justify-start items-center mb-6 font-mono">
            <Icon.CircleSlash className="w-8 h-auto mr-2 text-gray-500" />
            <span className="text-lg">Slash</span>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-lg">Setting</span>
          </h2>

          <div className="w-full flex flex-col justify-start items-start">
            <div className="w-full flex flex-col justify-start items-start mb-4">
              <div className="mb-2 text-base w-full flex flex-row justify-between items-center">
                <span>Domain</span>
                {domain !== "" && (
                  <a
                    className="text-sm flex flex-row justify-start items-center hover:underline hover:text-blue-600"
                    href={domain}
                    target="_blank"
                  >
                    <span className="mr-1">Go to my Slash</span>
                    <Icon.ExternalLink className="w-4 h-auto" />
                  </a>
                )}
              </div>
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

          {isInitialized && (
            <>
              <Divider className="!my-6" />

              <h2 className="flex flex-row justify-start items-center mb-4 font-mono">
                <span className="text-lg">Shortcuts</span>
                <span className="text-gray-500 mr-1">({shortcuts.length})</span>
                <PullShortcutsButton />
              </h2>
              <ShortcutsContainer />
            </>
          )}
        </div>
      </div>

      <Toaster position="top-center" />
    </>
  );
};

export default IndexOptions;
