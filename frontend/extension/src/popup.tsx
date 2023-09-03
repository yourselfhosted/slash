import type { Shortcut } from "@/types/proto/api/v2/shortcut_service_pb";
import { Button, Divider, IconButton } from "@mui/joy";
import { useStorage } from "@plasmohq/storage/hook";
import { Toaster } from "react-hot-toast";
import CreateShortcutsButton from "@/components/CreateShortcutsButton";
import Icon from "@/components/Icon";
import Logo from "@/components/Logo";
import PullShortcutsButton from "@/components/PullShortcutsButton";
import ShortcutsContainer from "@/components/ShortcutsContainer";
import "./style.css";

const IndexPopup = () => {
  const [domain] = useStorage<string>("domain", "");
  const [accessToken] = useStorage<string>("access_token", "");
  const [shortcuts] = useStorage<Shortcut[]>("shortcuts", []);
  const isInitialized = domain && accessToken;

  const handleSettingButtonClick = () => {
    chrome.runtime.openOptionsPage();
  };

  const handleRefreshButtonClick = () => {
    chrome.runtime.reload();
    chrome.browserAction.setPopup({ popup: "" });
  };

  return (
    <>
      <div className="w-full min-w-[512px] px-4 pt-4">
        <div className="w-full flex flex-row justify-between items-center">
          <div className="flex flex-row justify-start items-center">
            <Logo className="w-6 h-auto mr-2" />
            <span className="">Slash</span>
            {isInitialized && (
              <>
                <span className="mx-1 text-gray-400">/</span>
                <span>Shortcuts</span>
                <span className="text-gray-500 mr-0.5">({shortcuts.length})</span>
                <PullShortcutsButton />
              </>
            )}
          </div>
          <div>{isInitialized && <CreateShortcutsButton />}</div>
        </div>

        <div className="w-full mt-4">
          {isInitialized ? (
            <>
              {shortcuts.length !== 0 ? (
                <ShortcutsContainer />
              ) : (
                <div className="w-full flex flex-col justify-center items-center">
                  <p>No shortcut found.</p>
                </div>
              )}

              <Divider className="!mt-4 !mb-2 opacity-40" />

              <div className="w-full flex flex-row justify-between items-center mb-2">
                <div className="flex flex-row justify-start items-center">
                  <IconButton size="sm" variant="plain" color="neutral" onClick={handleSettingButtonClick}>
                    <Icon.Settings className="w-5 h-auto text-gray-500" />
                  </IconButton>
                  <IconButton
                    size="sm"
                    variant="plain"
                    color="neutral"
                    component="a"
                    href="https://github.com/boojack/slash"
                    target="_blank"
                  >
                    <Icon.Github className="w-5 h-auto text-gray-500" />
                  </IconButton>
                </div>
                <div className="flex flex-row justify-end items-center">
                  <a
                    className="text-sm flex flex-row justify-start items-center text-gray-500 hover:underline hover:text-blue-600"
                    href={domain}
                    target="_blank"
                  >
                    <span className="mr-1">Go to my Slash</span>
                    <Icon.ExternalLink className="w-4 h-auto" />
                  </a>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full flex flex-col justify-start items-center">
              <p>No domain and access token found.</p>
              <div className="w-full flex flex-row justify-center items-center py-4">
                <Button size="sm" color="primary" onClick={handleSettingButtonClick}>
                  <Icon.Settings className="w-5 h-auto mr-1" /> Setting
                </Button>
                <span className="mx-2">Or</span>
                <Button size="sm" variant="outlined" color="neutral" onClick={handleRefreshButtonClick}>
                  <Icon.RefreshCcw className="w-5 h-auto mr-1" /> Refresh
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Toaster position="top-right" />
    </>
  );
};

export default IndexPopup;
