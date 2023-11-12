import classNames from "classnames";
import { Link } from "react-router-dom";
import { getFaviconWithGoogleS2 } from "../helpers/utils";
import Icon from "./Icon";
import ShortcutActionsDropdown from "./ShortcutActionsDropdown";

interface Props {
  shortcut: Shortcut;
  className?: string;
  showActions?: boolean;
  alwaysShowLink?: boolean;
  onClick?: () => void;
}

const ShortcutView = (props: Props) => {
  const { shortcut, className, showActions, alwaysShowLink, onClick } = props;
  const favicon = getFaviconWithGoogleS2(shortcut.link);

  return (
    <div
      className={classNames(
        "group w-full px-3 py-2 flex flex-row justify-start items-center border rounded-lg hover:bg-gray-100 dark:border-zinc-800 dark:hover:bg-zinc-800",
        className
      )}
      onClick={onClick}
    >
      <div className={classNames("w-5 h-5 flex justify-center items-center overflow-clip shrink-0")}>
        {favicon ? (
          <img className="w-full h-auto rounded-lg" src={favicon} decoding="async" loading="lazy" />
        ) : (
          <Icon.CircleSlash className="w-full h-auto text-gray-400" />
        )}
      </div>
      <div className="ml-2 w-full truncate">
        {shortcut.title ? (
          <>
            <span className="dark:text-gray-400">{shortcut.title}</span>
            <span className="text-gray-500">(s/{shortcut.name})</span>
          </>
        ) : (
          <>
            <span className="text-gray-400 dark:text-gray-500">s/</span>
            <span className="dark:text-gray-400">{shortcut.name}</span>
          </>
        )}
      </div>
      <Link
        className={classNames(
          "hidden group-hover:block ml-1 w-6 h-6 p-1 shrink-0 rounded-lg bg-gray-200 dark:bg-zinc-900 hover:opacity-80",
          alwaysShowLink && "!block"
        )}
        to={`/s/${shortcut.name}`}
        target="_blank"
        onClick={(e) => e.stopPropagation()}
      >
        <Icon.ArrowUpRight className="w-4 h-auto text-gray-400 shrink-0" />
      </Link>
      {showActions && (
        <div className="ml-1 flex flex-row justify-end items-center shrink-0" onClick={(e) => e.stopPropagation()}>
          <ShortcutActionsDropdown shortcut={shortcut} />
        </div>
      )}
    </div>
  );
};

export default ShortcutView;
