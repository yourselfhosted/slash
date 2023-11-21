import { useStorage } from "@plasmohq/storage/hook";
import classNames from "classnames";
import { getFaviconWithGoogleS2 } from "@/helpers/utils";
import type { Shortcut } from "@/types/proto/api/v2/shortcut_service";
import Icon from "./Icon";

interface Props {
  shortcut: Shortcut;
}

const ShortcutView = (props: Props) => {
  const { shortcut } = props;
  const [domain] = useStorage<string>("domain", "");
  const favicon = getFaviconWithGoogleS2(shortcut.link);

  const handleShortcutLinkClick = () => {
    const shortcutLink = `${domain}/s/${shortcut.name}`;
    chrome.tabs.create({ url: shortcutLink });
  };

  return (
    <>
      <div
        className={classNames(
          "group w-full px-3 py-2 flex flex-col justify-start items-start border rounded-lg hover:bg-gray-100 hover:shadow dark:border-zinc-800 dark:hover:bg-zinc-800"
        )}
      >
        <div className="w-full flex flex-row justify-start items-center">
          <span className={classNames("w-5 h-5 flex justify-center items-center overflow-clip shrink-0")}>
            {favicon ? (
              <img className="w-full h-auto rounded" src={favicon} decoding="async" loading="lazy" />
            ) : (
              <Icon.CircleSlash className="w-full h-auto text-gray-400" />
            )}
          </span>
          <div className="ml-1 w-[calc(100%-20px)] flex flex-col justify-start items-start">
            <div className="w-full flex flex-row justify-start items-center">
              <button
                className={classNames(
                  "max-w-full flex flex-row px-1 mr-1 justify-start items-center cursor-pointer rounded-md hover:underline"
                )}
                onClick={handleShortcutLinkClick}
              >
                <div className="truncate">
                  <span className="dark:text-gray-400">{shortcut.title}</span>
                  {shortcut.title ? (
                    <span className="text-gray-500">({shortcut.name})</span>
                  ) : (
                    <>
                      <span className="truncate dark:text-gray-400">{shortcut.name}</span>
                    </>
                  )}
                </div>
                <span className="hidden group-hover:block ml-1 cursor-pointer shrink-0">
                  <Icon.ExternalLink className="w-4 h-auto text-gray-600" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShortcutView;
