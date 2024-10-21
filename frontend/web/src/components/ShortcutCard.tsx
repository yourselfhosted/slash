import { Avatar, Tooltip } from "@mui/joy";
import classNames from "classnames";
import copy from "copy-to-clipboard";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { absolutifyLink } from "@/helpers/utils";
import { useUserStore, useViewStore } from "@/stores";
import { Shortcut } from "@/types/proto/api/v1/shortcut_service";
import Icon from "./Icon";
import LinkFavicon from "./LinkFavicon";
import ShortcutActionsDropdown from "./ShortcutActionsDropdown";
import VisibilityIcon from "./VisibilityIcon";

interface Props {
  shortcut: Shortcut;
}

const ShortcutCard = (props: Props) => {
  const { shortcut } = props;
  const { t } = useTranslation();
  const userStore = useUserStore();
  const viewStore = useViewStore();
  const creator = userStore.getUserById(shortcut.creatorId);
  const shortcutLink = absolutifyLink(`/s/${shortcut.name}`);

  useEffect(() => {
    userStore.getOrFetchUserById(shortcut.creatorId);
  }, []);

  const handleCopyButtonClick = () => {
    copy(shortcutLink);
    toast.success("Shortcut link copied to clipboard.");
  };

  return (
    <div
      className={classNames(
        "group px-4 py-3 w-full flex flex-col justify-start items-start border rounded-lg hover:shadow dark:border-zinc-700",
      )}
    >
      <div className="w-full flex flex-row justify-between items-center">
        <div className="w-[calc(100%-16px)] flex flex-row justify-start items-center mr-1 shrink-0">
          <Link
            className={classNames("w-8 h-8 flex justify-center items-center overflow-clip shrink-0")}
            to={`/shortcut/${shortcut.id}`}
            viewTransition
          >
            <LinkFavicon url={shortcut.link} />
          </Link>
          <div className="ml-2 w-[calc(100%-24px)] flex flex-col justify-start items-start">
            <div className="w-full flex flex-row justify-start items-center leading-tight">
              <a
                className={classNames(
                  "max-w-[calc(100%-36px)] flex flex-row justify-start items-center mr-1 cursor-pointer hover:opacity-80 hover:underline",
                )}
                target="_blank"
                href={shortcutLink}
              >
                <div className="truncate">
                  <span className="dark:text-gray-400">{shortcut.title}</span>
                  {shortcut.title ? (
                    <span className="text-gray-500">({shortcut.name})</span>
                  ) : (
                    <span className="truncate dark:text-gray-400">{shortcut.name}</span>
                  )}
                </div>
                <span className="hidden group-hover:block ml-1 cursor-pointer shrink-0">
                  <Icon.ExternalLink className="w-4 h-auto text-gray-600" />
                </span>
              </a>
              <Tooltip title="Copy" variant="solid" placement="top" arrow>
                <button
                  className="hidden group-hover:block cursor-pointer text-gray-500 hover:opacity-80"
                  onClick={() => handleCopyButtonClick()}
                >
                  <Icon.Clipboard className="w-4 h-auto mx-auto" />
                </button>
              </Tooltip>
            </div>
            <a
              className="pr-4 leading-tight w-full text-sm truncate text-gray-400 dark:text-gray-500 hover:underline"
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
      <div className="w-full mt-2 flex gap-2 overflow-x-auto">
        <Tooltip title={creator.nickname} variant="solid" placement="top" arrow>
          <Avatar
            className="dark:bg-zinc-800"
            sx={{
              "--Avatar-size": "24px",
            }}
            alt={creator.nickname.toUpperCase()}
          ></Avatar>
        </Tooltip>
        <Tooltip title={t(`shortcut.visibility.${shortcut.visibility.toLowerCase()}.description`)} variant="solid" placement="top" arrow>
          <div
            className="w-auto leading-5 flex flex-row justify-start items-center flex-nowrap whitespace-nowrap cursor-pointer text-gray-400 text-sm"
            onClick={() => viewStore.setFilter({ visibility: shortcut.visibility })}
          >
            <VisibilityIcon className="w-4 h-auto mr-1 opacity-70" visibility={shortcut.visibility} />
            {t(`shortcut.visibility.${shortcut.visibility.toLowerCase()}.self`)}
          </div>
        </Tooltip>
        <Tooltip title="View count" variant="solid" placement="top" arrow>
          <Link
            className="w-auto leading-5 flex flex-row justify-start items-center flex-nowrap whitespace-nowrap cursor-pointer text-gray-400 text-sm"
            to={`/shortcut/${shortcut.id}#analytics`}
            viewTransition
          >
            <Icon.BarChart2 className="w-4 h-auto mr-1 opacity-70" />
            {t("shortcut.visits", { count: shortcut.viewCount })}
          </Link>
        </Tooltip>
      </div>
    </div>
  );
};

export default ShortcutCard;
