import { Tooltip } from "@mui/joy";
import classNames from "classnames";
import copy from "copy-to-clipboard";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { absolutifyLink } from "../helpers/utils";
import useFaviconStore from "../stores/v1/favicon";
import useViewStore from "../stores/v1/view";
import Icon from "./Icon";
import ShortcutActionsDropdown from "./ShortcutActionsDropdown";
import VisibilityIcon from "./VisibilityIcon";

interface Props {
  shortcut: Shortcut;
}

const ShortcutView = (props: Props) => {
  const { shortcut } = props;
  const { t } = useTranslation();
  const viewStore = useViewStore();
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

  const handleCopyButtonClick = () => {
    copy(shortcutLink);
    toast.success("Shortcut link copied to clipboard.");
  };

  return (
    <>
      <div className={classNames("group px-4 py-3 w-full flex flex-col justify-start items-start border rounded-lg hover:shadow")}>
        <div className="w-full flex flex-row justify-between items-center">
          <div className="w-[calc(100%-16px)] flex flex-row justify-start items-center mr-1 shrink-0">
            <Link to={`/shortcut/${shortcut.id}`} className={classNames("w-8 h-8 flex justify-center items-center overflow-clip shrink-0")}>
              {favicon ? (
                <img className="w-full h-auto rounded-full" src={favicon} decoding="async" loading="lazy" />
              ) : (
                <Icon.CircleSlash className="w-full h-auto text-gray-400" />
              )}
            </Link>
            <div className="ml-1 w-[calc(100%-24px)] flex flex-col justify-start items-start">
              <div className="w-full flex flex-row justify-start items-center">
                <a
                  className={classNames(
                    "max-w-[calc(100%-36px)] flex flex-row px-1 mr-1 justify-start items-center cursor-pointer rounded-md hover:bg-gray-100 hover:shadow"
                  )}
                  target="_blank"
                  href={shortcutLink}
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
                <Tooltip title="Copy" variant="solid" placement="top" arrow>
                  <button
                    className="hidden group-hover:block w-6 h-6 cursor-pointer rounded-md text-gray-500 hover:bg-gray-100 hover:shadow"
                    onClick={() => handleCopyButtonClick()}
                  >
                    <Icon.Clipboard className="w-4 h-auto mx-auto" />
                  </button>
                </Tooltip>
              </div>
              <a className="pl-1 pr-4 w-full text-sm truncate text-gray-400 hover:underline" href={shortcut.link} target="_blank">
                {shortcut.link}
              </a>
            </div>
          </div>
          <div className="h-full pt-2 flex flex-row justify-end items-start">
            <ShortcutActionsDropdown shortcut={shortcut} />
          </div>
        </div>
        <div className="mt-2 w-full flex flex-row justify-start items-start gap-2 truncate">
          {shortcut.tags.map((tag) => {
            return (
              <span
                key={tag}
                className="max-w-[8rem] truncate text-gray-400 text-sm font-mono leading-4 cursor-pointer hover:text-gray-600"
                onClick={() => viewStore.setFilter({ tag: tag })}
              >
                #{tag}
              </span>
            );
          })}
          {shortcut.tags.length === 0 && <span className="text-gray-400 text-sm font-mono leading-4 italic">No tags</span>}
        </div>
        <div className="w-full flex mt-2 gap-2">
          <Tooltip title="Creator" variant="solid" placement="top" arrow>
            <div className="w-auto px-2 leading-6 flex flex-row justify-start items-center border rounded-full text-gray-500 text-sm">
              <Icon.User className="w-4 h-auto mr-1" />
              <span className="max-w-[4rem] sm:max-w-[6rem] truncate">{shortcut.creator.nickname}</span>
            </div>
          </Tooltip>
          <Tooltip title={t(`shortcut.visibility.${shortcut.visibility.toLowerCase()}.description`)} variant="solid" placement="top" arrow>
            <div
              className="w-auto px-2 leading-6 flex flex-row justify-start items-center border rounded-full cursor-pointer text-gray-500 text-sm"
              onClick={() => viewStore.setFilter({ visibility: shortcut.visibility })}
            >
              <VisibilityIcon className="w-4 h-auto mr-1" visibility={shortcut.visibility} />
              {t(`shortcut.visibility.${shortcut.visibility.toLowerCase()}.self`)}
            </div>
          </Tooltip>
          <Tooltip title="View count" variant="solid" placement="top" arrow>
            <Link
              to={`/shortcut/${shortcut.id}#analytics`}
              className="w-auto px-2 leading-6 flex flex-row justify-start items-center border rounded-full cursor-pointer text-gray-500 text-sm"
            >
              <Icon.BarChart2 className="w-4 h-auto mr-1" />
              {shortcut.view} visits
            </Link>
          </Tooltip>
        </div>
      </div>
    </>
  );
};

export default ShortcutView;
