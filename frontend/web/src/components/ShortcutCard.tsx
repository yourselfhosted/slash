import classNames from "classnames";
import copy from "copy-to-clipboard";
import { useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { absolutifyLink } from "@/helpers/utils";
import { useUserStore, useViewStore } from "@/stores";
import { Shortcut } from "@/types/proto/api/v1/shortcut_service";
import Icon from "./Icon";
import LinkFavicon from "./LinkFavicon";
import ShortcutActionsDropdown from "./ShortcutActionsDropdown";
import VisibilityIcon from "./VisibilityIcon";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    <Card
      className={classNames(
        "group p-4 w-full flex flex-col justify-start items-start hover:shadow-md transition-shadow duration-200"
      )}
    >
      <div className="w-full flex flex-row justify-between items-center">
        <div className="w-[calc(100%-16px)] flex flex-row justify-start items-center mr-1 shrink-0">
          <Link
            className={classNames("w-8 h-8 flex justify-center items-center overflow-clip shrink-0 rounded")}
            to={`/shortcut/${shortcut.id}`}
            viewTransition
          >
            <LinkFavicon url={shortcut.link} />
          </Link>
          <div className="ml-3 w-[calc(100%-24px)] flex flex-col justify-start items-start">
            <div className="w-full flex flex-row justify-start items-center leading-tight">
              <a
                className={classNames(
                  "max-w-[calc(100%-36px)] flex flex-row justify-start items-center mr-1 hover:opacity-80 hover:underline transition-all"
                )}
                target="_blank"
                href={shortcutLink}
              >
                <div className="truncate">
                  <span className="text-foreground font-medium">{shortcut.title}</span>
                  {shortcut.title ? (
                    <span className="text-muted-foreground ml-1">({shortcut.name})</span>
                  ) : (
                    <span className="truncate text-foreground font-medium">{shortcut.name}</span>
                  )}
                </div>
                <span className="hidden group-hover:block ml-1 shrink-0">
                  <Icon.ExternalLink className="w-4 h-auto text-muted-foreground" />
                </span>
              </a>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="hidden group-hover:block text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => handleCopyButtonClick()}
                    >
                      <Icon.Clipboard className="w-4 h-auto" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <a
              className="pr-4 leading-tight w-full text-sm truncate text-muted-foreground hover:underline transition-all"
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
      <div className="mt-3 w-full flex flex-row justify-start items-start gap-2 truncate">
        {shortcut.tags.map((tag) => {
          return (
            <Badge
              key={tag}
              variant="secondary"
              className="max-w-[8rem] truncate cursor-pointer hover:bg-secondary/80 transition-colors"
              onClick={() => viewStore.setFilter({ tag: tag })}
            >
              #{tag}
            </Badge>
          );
        })}
        {shortcut.tags.length === 0 && (
          <span className="text-muted-foreground text-sm italic">No tags</span>
        )}
      </div>
      <div className="w-full mt-3 flex gap-3 overflow-x-auto">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {creator.nickname.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>{creator.nickname}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="flex flex-row justify-start items-center gap-1 text-muted-foreground text-sm cursor-pointer hover:text-foreground transition-colors"
                onClick={() => viewStore.setFilter({ visibility: shortcut.visibility })}
              >
                <VisibilityIcon className="w-4 h-auto" visibility={shortcut.visibility} />
                {t(`shortcut.visibility.${shortcut.visibility.toLowerCase()}.self`)}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t(`shortcut.visibility.${shortcut.visibility.toLowerCase()}.description`)}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                className="flex flex-row justify-start items-center gap-1 text-muted-foreground text-sm hover:text-foreground transition-colors"
                to={`/shortcut/${shortcut.id}#analytics`}
                viewTransition
              >
                <Icon.BarChart2 className="w-4 h-auto" />
                {t("shortcut.visits", { count: shortcut.viewCount })}
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>View count</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </Card>
  );
};

export default ShortcutCard;
