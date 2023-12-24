import { Button, CssVarsProvider, Divider, Input, Select, Option } from "@mui/joy";
import { useStorage } from "@plasmohq/storage/hook";
import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import Icon from "./components/Icon";
import Logo from "./components/Logo";
import PullShortcutsButton from "./components/PullShortcutsButton";
import ShortcutsContainer from "./components/ShortcutsContainer";
import useColorTheme from "./hooks/useColorTheme";
import useShortcutStore from "./store/shortcut";
import "./style.css";

interface SettingState {
  domain: string;
  accessToken: string;
}

const colorThemeOptions = [
  {
    value: "system",
    label: "System",
  },
  {
    value: "light",
    label: "Light",
  },
  {
    value: "dark",
    label: "Dark",
  },
];

const IndexOptions = () => {
  const { colorTheme, setColorTheme } = useColorTheme();
  const [domain, setDomain] = useStorage<string>("domain", (v) => (v ? v : ""));
  const [accessToken, setAccessToken] = useStorage<string>("access_token", (v) => (v ? v : ""));
  const [settingState, setSettingState] = useState<SettingState>({
    domain,
    accessToken,
  });
  const shortcutStore = useShortcutStore();
  const shortcuts = shortcutStore.getShortcutList();
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

  const handleSelectColorTheme = async (colorTheme: string) => {
    setColorTheme(colorTheme as any);
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
              {domain !== "" && (
                <a
                  className="text-sm flex flex-row justify-start items-center underline text-blue-600 hover:opacity-80"
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
                placeholder="The url of your Slash instance. e.g., https://slash.example.com"
                value={settingState.domain}
                onChange={(e) => setPartialSettingState({ domain: e.target.value })}
              />
            </div>
          </div>

          <div className="w-full flex flex-col justify-start items-start">
            <span className="mb-2 text-base dark:text-gray-400">Access Token</span>
            <div className="relative w-full">
              <Input
                className="w-full"
                type="text"
                placeholder="An available access token of your account."
                value={settingState.accessToken}
                onChange={(e) => setPartialSettingState({ accessToken: e.target.value })}
              />
            </div>
          </div>

          <div className="w-full mt-6 flex flex-row justify-end">
            <Button onClick={handleSaveSetting}>Save</Button>
          </div>

          <Divider className="!my-6" />

          <p className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-500">Preference</p>

          <div className="w-full flex flex-row justify-between items-center">
            <div className="flex flex-row justify-start items-center gap-x-1">
              <span className="dark:text-gray-400">Color Theme</span>
            </div>
            <Select defaultValue={colorTheme} onChange={(_, value) => handleSelectColorTheme(value)}>
              {colorThemeOptions.map((option) => {
                return (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                );
              })}
            </Select>
          </div>
        </div>

        {isInitialized && (
          <>
            <Divider className="!my-6" />

            <h2 className="flex flex-row justify-start items-center mb-4">
              <span className="text-lg dark:text-gray-400">Shortcuts</span>
              <span className="text-gray-500 mr-1">({shortcuts.length})</span>
              <PullShortcutsButton />
            </h2>
            <ShortcutsContainer />
          </>
        )}
      </div>
    </div>
  );
};

const Options = () => {
  return (
    <CssVarsProvider>
      <IndexOptions />
      <Toaster position="top-center" />
    </CssVarsProvider>
  );
};

export default Options;
