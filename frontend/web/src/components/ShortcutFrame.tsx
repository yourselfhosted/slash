import classNames from "classnames";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
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
        className="w-72 max-w-full border border-border bg-card text-card-foreground p-6 pb-4 rounded-2xl shadow-xl hover:opacity-80"
        to={`/s/${shortcut.name}`}
        target="_blank"
      >
        <div className={classNames("w-12 h-12 flex justify-center items-center overflow-clip rounded-lg shrink-0")}>
          <LinkFavicon url={shortcut.link} />
        </div>
        <p className="text-lg font-medium leading-8 mt-2 truncate">{shortcut.title || shortcut.name}</p>
        <p className="text-muted-foreground truncate">{shortcut.description}</p>
        <Separator className="my-2" />
        <p className="text-muted-foreground text-sm mt-2">
          <span className="leading-4">Open this site in a new tab</span>
          <Icon.ArrowUpRight className="inline-block ml-1 -mt-0.5 w-4 h-auto" />
        </p>
      </Link>
    </div>
  );
};

export default ShortcutFrame;
