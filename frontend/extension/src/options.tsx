import { Button, CssVarsProvider, Input } from "@mui/joy";
import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import Icon from "./components/Icon";
import Logo from "./components/Logo";
import { StorageContextProvider, useStorageContext } from "./context";
import "./style.css";

interface SettingState {
  instanceUrl: string;
}

const IndexOptions = () => {
  const context = useStorageContext();
  const [settingState, setSettingState] = useState<SettingState>({
    instanceUrl: context.instanceUrl || "",
  });

  useEffect(() => {
    setSettingState({
      instanceUrl: context.instanceUrl || "",
    });
  }, [context]);

  const setPartialSettingState = (partialSettingState: Partial<SettingState>) => {
    setSettingState((prevState) => ({
      ...prevState,
      ...partialSettingState,
    }));
  };

  const handleSaveSetting = () => {
    context.setInstanceUrl(settingState.instanceUrl);
    toast.success("Setting saved");
  };

  return (
    <div className="w-full px-4">
      <div className="w-full flex flex-row justify-center items-center">
        <a
          className="bg-yellow-100 dark:bg-yellow-500 dark:opacity-70 mt-12 py-2 px-3 rounded-full border dark:border-yellow-600 flex flex-row justify-start items-center cursor-pointer shadow hover:underline hover:text-blue-600"
          href="https://github.com/yourselfhosted/slash#browser-extension"
          target="_blank"
        >
          <Icon.HelpCircle className="w-4 h-auto" />
          <span className="mx-1 text-sm">Need help? Check out the docs</span>
          <Icon.ExternalLink className="w-4 h-auto" />
        </a>
      </div>

      <div className="w-full max-w-lg mx-auto flex flex-col justify-start items-start py-12">
        <h2 className="flex flex-row justify-start items-center mb-6 text-2xl dark:text-gray-400">
          <Logo className="w-10 h-auto mr-2" />
          <span>Slash</span>
          <span className="mx-2 text-gray-400">/</span>
          <span>Setting</span>
        </h2>

        <div className="w-full flex flex-col justify-start items-start">
          <div className="w-full flex flex-col justify-start items-start mb-4">
            <div className="mb-2 text-base w-full flex flex-row justify-between items-center">
              <span className="dark:text-gray-400">Instance URL</span>
              {context.instanceUrl !== "" && (
                <a
                  className="text-sm flex flex-row justify-start items-center underline text-blue-600 hover:opacity-80"
                  href={context.instanceUrl}
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
                placeholder="The url of your Slash instance. e.g., https://slash.example.com"
                value={settingState.instanceUrl}
                onChange={(e) => setPartialSettingState({ instanceUrl: e.target.value })}
              />
            </div>
          </div>

          <div className="w-full mt-6 flex flex-row justify-end">
            <Button onClick={handleSaveSetting}>Save</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Options = () => {
  return (
    <StorageContextProvider>
      <CssVarsProvider>
        <IndexOptions />
        <Toaster position="top-center" />
      </CssVarsProvider>
    </StorageContextProvider>
  );
};

export default Options;
