import { Tooltip } from "@mui/joy";
import classNames from "classnames";
import copy from "copy-to-clipboard";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { absolutifyLink, getFaviconWithGoogleS2 } from "../helpers/utils";
import useViewStore from "../stores/v1/view";
import Icon from "./Icon";
import ShortcutActionsDropdown from "./ShortcutActionsDropdown";
import VisibilityIcon from "./VisibilityIcon";

interface Props {
  shortcut: Shortcut;
}

const ShortcutCard = (props: Props) => {
  const { shortcut } = props;
  const { t } = useTranslation();
  const viewStore = useViewStore();
  const shortcutLink = absolutifyLink(`/s/${shortcut.name}`);
  const favicon = getFaviconWithGoogleS2(shortcut.link);

  const handleCopyButtonClick = () => {
    copy(shortcutLink);
    toast.success("Shortcut link copied to clipboard.");
  };

  return (
    <>
      <div
        className={classNames(
          "group px-4 py-3 w-full flex flex-col justify-start items-start border rounded-lg hover:shadow dark:border-zinc-700"
        )}
      >
        <div className="w-full flex flex-row justify-between items-center">
          <div className="w-[calc(100%-16px)] flex flex-row justify-start items-center mr-1 shrink-0">
            <Link to={`/shortcut/${shortcut.id}`} className={classNames("w-8 h-8 flex justify-center items-center overflow-clip shrink-0")}>
              {favicon ? (
                <img className="w-full h-auto rounded-lg" src={favicon} decoding="async" loading="lazy" />
              ) : (
                <Icon.CircleSlash className="w-full h-auto text-gray-400" />
              )}
            </Link>
            <div className="ml-1 w-[calc(100%-24px)] flex flex-col justify-start items-start">
              <div className="w-full flex flex-row justify-start items-center">
                <a
                  className={classNames(
                    "max-w-[calc(100%-36px)] flex flex-row px-1 mr-1 justify-start items-center cursor-pointer rounded-md hover:bg-gray-100 hover:shadow dark:hover:bg-zinc-800"
                  )}
                  target="_blank"
                  href={shortcutLink}
                >
                  <div className="truncate">
                    <span className="dark:text-gray-400">{shortcut.title}</span>
                    {shortcut.title ? (
                      <span className="text-gray-500">(s/{shortcut.name})</span>
                    ) : (
                      <>
                        <span className="text-gray-400 dark:text-gray-500">s/</span>
                        <span className="truncate dark:text-gray-400">{shortcut.name}</span>
                      </>
                    )}
                  </div>
                  <span className="hidden group-hover:block ml-1 cursor-pointer shrink-0">
                    <Icon.ExternalLink className="w-4 h-auto text-gray-600" />
                  </span>
                </a>
                <Tooltip title="Copy" variant="solid" placement="top" arrow>
                  <button
                    className="hidden group-hover:block w-6 h-6 cursor-pointer rounded-md text-gray-500 hover:bg-gray-100 hover:shadow dark:hover:bg-zinc-800"
                    onClick={() => handleCopyButtonClick()}
                  >
                    <Icon.Clipboard className="w-4 h-auto mx-auto" />
                  </button>
                </Tooltip>
              </div>
              <a
                className="pl-1 pr-4 w-full text-sm truncate text-gray-400 dark:text-gray-500 hover:underline"
                href={shortcut.link}
                target="_blank"
              >
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
                className="max-w-[8rem] truncate text-gray-400 dark:text-gray-500 text-sm leading-4 cursor-pointer hover:opacity-80"
                onClick={() => viewStore.setFilter({ tag: tag })}
              >
                #{tag}
              </span>
            );
          })}
          {shortcut.tags.length === 0 && <span className="text-gray-400 text-sm leading-4 italic">No tags</span>}
        </div>
        <div className="w-full flex mt-2 gap-2 overflow-x-auto">
          <Tooltip title={t(`shortcut.visibility.${shortcut.visibility.toLowerCase()}.description`)} variant="solid" placement="top" arrow>
            <div
              className="w-auto px-2 leading-6 flex flex-row justify-start items-center flex-nowrap whitespace-nowrap border rounded-full cursor-pointer text-gray-500 dark:text-gray-400 text-sm dark:border-zinc-700"
              onClick={() => viewStore.setFilter({ visibility: shortcut.visibility })}
            >
              <VisibilityIcon className="w-4 h-auto mr-1 opacity-60" visibility={shortcut.visibility} />
              {t(`shortcut.visibility.${shortcut.visibility.toLowerCase()}.self`)}
            </div>
          </Tooltip>
          <Tooltip title="View count" variant="solid" placement="top" arrow>
            <Link
              to={`/shortcut/${shortcut.id}#analytics`}
              className="w-auto px-2 leading-6 flex flex-row justify-start items-center flex-nowrap whitespace-nowrap border rounded-full cursor-pointer text-gray-500 dark:text-gray-400 text-sm dark:border-zinc-700"
            >
              <Icon.BarChart2 className="w-4 h-auto mr-1 opacity-80" />
              {t("shortcut.visits", { count: shortcut.view })}
            </Link>
          </Tooltip>
        </div>
      </div>
    </>
  );
};

export default ShortcutCard;
