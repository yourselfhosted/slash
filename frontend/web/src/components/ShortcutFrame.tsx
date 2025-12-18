import { Separator } from "@/components/ui/separator";
import classNames from "classnames";
import { Link } from "react-router-dom";
import { Shortcut } from "@/types/proto/api/v1/shortcut_service";
import Icon from "./Icon";
import LinkFavicon from "./LinkFavicon";

interface Props {
  shortcut: Shortcut;
}

const ShortcutFrame = ({ shortcut }: Props) => {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center p-8">
      <Link
        className="w-72 max-w-full border dark:border-zinc-900 dark:bg-zinc-900 p-6 pb-4 rounded-2xl shadow-xl dark:text-gray-400 hover:opacity-80"
        to={`/s/${shortcut.name}`}
        target="_blank"
      >
        <div className={classNames("w-12 h-12 flex justify-center items-center overflow-clip rounded-lg shrink-0")}>
          <LinkFavicon url={shortcut.link} />
        </div>
        <p className="text-lg font-medium leading-8 mt-2 truncate">{shortcut.title || shortcut.name}</p>
        <p className="text-gray-500 truncate">{shortcut.description}</p>
        <Separator className="my-2" />
        <p className="text-gray-400 dark:text-gray-600 text-sm mt-2">
          <span className="leading-4">Open this site in a new tab</span>
          <Icon.ArrowUpRight className="inline-block ml-1 -mt-0.5 w-4 h-auto" />
        </p>
      </Link>
    </div>
  );
};

export default ShortcutFrame;
