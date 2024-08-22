import { Button, CssVarsProvider, IconButton } from "@mui/joy";
import { Toaster } from "react-hot-toast";
import Icon from "@/components/Icon";
import Logo from "@/components/Logo";
import { StorageContextProvider, useStorageContext } from "./context";
import "./style.css";

const IndexPopup = () => {
  const context = useStorageContext();
  const isInitialized = context.instanceUrl;

  const handleSettingButtonClick = () => {
    chrome.runtime.openOptionsPage();
  };

  const handleRefreshButtonClick = () => {
    chrome.runtime.reload();
    chrome.browserAction.setPopup({ popup: "" });
  };

  return (
    <div className="w-full min-w-[512px] px-4 pt-4">
      <div className="w-full flex flex-row justify-between items-center">
        <div className="flex flex-row justify-start items-center dark:text-gray-400">
          <Logo className="w-6 h-auto mr-1" />
          <span className="">Slash</span>
        </div>
      </div>

      <div className="w-full mt-4">
        {isInitialized ? (
          <>
            <p className="w-full mb-2">
              <span>Your instance URL is </span>
              <a
                className="inline-flex flex-row justify-start items-center underline text-blue-600 hover:opacity-80"
                href={context.instanceUrl}
                target="_blank"
              >
                <span className="mr-1">{context.instanceUrl}</span>
                <Icon.ExternalLink className="w-4 h-auto" />
              </a>
            </p>
            <div className="w-full flex flex-row justify-between items-center mb-2">
              <div className="flex flex-row justify-start items-center">
                <IconButton size="sm" variant="plain" color="neutral" onClick={handleSettingButtonClick}>
                  <Icon.Settings className="w-5 h-auto text-gray-500 dark:text-gray-400" />
                </IconButton>
                <IconButton
                  size="sm"
                  variant="plain"
                  color="neutral"
                  component="a"
                  href="https://github.com/yourselfhosted/slash"
                  target="_blank"
                >
                  <Icon.Github className="w-5 h-auto text-gray-500 dark:text-gray-400" />
                </IconButton>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full flex flex-col justify-start items-center">
            <Icon.Cookie strokeWidth={1} className="w-20 h-auto mb-4 text-gray-400" />
            <p className="dark:text-gray-400">Please set your instance URL first.</p>
            <div className="w-full flex flex-row justify-center items-center py-4">
              <Button size="sm" color="primary" onClick={handleSettingButtonClick}>
                <Icon.Settings className="w-5 h-auto mr-1" /> Go to Setting
              </Button>
              <span className="mx-2 dark:text-gray-400">Or</span>
              <Button size="sm" variant="outlined" color="neutral" onClick={handleRefreshButtonClick}>
                <Icon.RefreshCcw className="w-5 h-auto mr-1" /> Refresh
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Popup = () => {
  return (
    <StorageContextProvider>
      <CssVarsProvider>
        <IndexPopup />
        <Toaster position="top-center" />
      </CssVarsProvider>
    </StorageContextProvider>
  );
};

export default Popup;
