import { Button } from "@mui/joy";
import { useStorage } from "@plasmohq/storage/hook";
import { Toaster } from "react-hot-toast";
import { Shortcut } from "@/types/proto/api/v2/shortcut_service_pb";
import CreateShortcutsButton from "./components/CreateShortcutsButton";
import Icon from "./components/Icon";
import PullShortcutsButton from "./components/PullShortcutsButton";
import ShortcutsContainer from "./components/ShortcutsContainer";
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
  };

  return (
    <>
      <div className="w-full min-w-[512px] p-6">
        <div className="w-full flex flex-row justify-between items-center">
          <div className="flex flex-row justify-start items-center">
            <Icon.CircleSlash className="w-5 h-auto mr-1 text-gray-500" />
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

              <div className="mt-4 w-full flex flex-row justify-start items-center">
                <Button size="sm" variant="plain" color="neutral" onClick={handleSettingButtonClick}>
                  <Icon.Settings className="w-5 h-auto text-gray-500" />
                </Button>
                <a
                  className="flex flex-row justify-start items-center text-sm rounded-md py-1 px-2 text-gray-500 cursor-pointer hover:text-blue-600 hover:underline"
                  href="https://github.com/boojack/slash"
                  target="_blank"
                >
                  <Icon.Github className="w-5 h-auto mr-1" />
                  <span>GitHub</span>
                </a>
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
