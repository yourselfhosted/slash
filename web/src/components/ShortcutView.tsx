import classNames from "classnames";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { absolutifyLink } from "../helpers/utils";
import useFaviconStore from "../stores/v1/favicon";
import Icon from "./Icon";
import ShortcutActionsDropdown from "./ShortcutActionsDropdown";

interface Props {
  shortcut: Shortcut;
}

const ShortcutView = (props: Props) => {
  const { shortcut } = props;
  const faviconStore = useFaviconStore();
  const [favicon, setFavicon] = useState<string | undefined>(undefined);
  const shortcutLink = absolutifyLink(`/s/${shortcut.name}`);

  useEffect(() => {
    faviconStore.getOrFetchUrlFavicon(shortcut.link).then((url) => {
      if (url) {
        setFavicon(url);
      }
    });
  }, [shortcut.link]);

  return (
    <>
      <div
        className={classNames(
          "group w-full px-3 py-2 flex flex-col justify-start items-start border rounded-lg hover:bg-gray-100 hover:shadow"
        )}
      >
        <div className="w-full flex flex-row justify-between items-center">
          <div className="w-[calc(100%-16px)] flex flex-row justify-start items-center mr-1 shrink-0">
            <Link to={`/shortcut/${shortcut.id}`} className={classNames("w-5 h-5 flex justify-center items-center overflow-clip shrink-0")}>
              {favicon ? (
                <img className="w-full h-auto rounded-full" src={favicon} decoding="async" loading="lazy" />
              ) : (
                <Icon.CircleSlash className="w-full h-auto text-gray-400" />
              )}
            </Link>
            <div className="ml-1 w-[calc(100%-20px)] flex flex-col justify-start items-start">
              <div className="w-full flex flex-row justify-start items-center">
                <a
                  className={classNames(
                    "max-w-full flex flex-row px-1 mr-1 justify-start items-center cursor-pointer rounded-md hover:underline"
                  )}
                  href={shortcutLink}
                  target="_blank"
                >
                  <div className="truncate">
                    <span>{shortcut.title}</span>
                    {shortcut.title ? (
                      <span className="text-gray-400">(s/{shortcut.name})</span>
                    ) : (
                      <>
                        <span className="text-gray-400">s/</span>
                        <span className="truncate">{shortcut.name}</span>
                      </>
                    )}
                  </div>
                  <span className="hidden group-hover:block ml-1 cursor-pointer shrink-0">
                    <Icon.ExternalLink className="w-4 h-auto text-gray-600" />
                  </span>
                </a>
              </div>
            </div>
          </div>
          <div className="flex flex-row justify-end items-center">
            <ShortcutActionsDropdown shortcut={shortcut} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ShortcutView;
