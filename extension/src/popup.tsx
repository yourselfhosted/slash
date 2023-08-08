import { Button } from "@mui/joy";
import { useStorage } from "@plasmohq/storage/hook";
import { Toaster } from "react-hot-toast";
import { Shortcut } from "@/types/proto/api/v2/shortcut_service_pb";
import Icon from "./components/Icon";
import PullShortcutsButton from "./components/PullShortcutsButton";
import ShortcutsContainer from "./components/ShortcutsContainer";
import "./style.css";

function IndexPopup() {
  const [domain] = useStorage<string>("domain", "");
  const [accessToken] = useStorage<string>("access_token", "");
  const [shortcuts] = useStorage<Shortcut[]>("shortcuts", []);
  const isInitialized = domain && accessToken;

  const handleSettingButtonClick = () => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <>
      <div className="w-full min-w-[480px] p-4">
        <div className="w-full flex flex-row justify-between items-center text-sm">
          <div className="flex flex-row justify-start items-center font-mono">
            <Icon.CircleSlash className="w-5 h-auto mr-1 text-gray-500 -mt-0.5" />
            <span className="font-mono">Slash</span>
            {isInitialized && (
              <>
                <span className="mx-1 text-gray-400">/</span>
                <span>Shortcuts</span>
                <span className="mr-1 text-gray-500">({shortcuts.length})</span>
                <PullShortcutsButton />
              </>
            )}
          </div>
          <div>
            <Button size="sm" variant="plain" color="neutral" onClick={handleSettingButtonClick}>
              <Icon.Settings className="w-5 h-auto" />
            </Button>
          </div>
        </div>

        <div className="w-full mt-4">
          <ShortcutsContainer />
        </div>
      </div>

      <Toaster position="top-right" />
    </>
  );
}

export default IndexPopup;
