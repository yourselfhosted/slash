import classNames from "classnames";
import copy from "copy-to-clipboard";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { showCommonDialog } from "@/components/Alert";
import AnalyticsView from "@/components/AnalyticsView";
import CreateShortcutDrawer from "@/components/CreateShortcutDrawer";
import GenerateQRCodeDialog from "@/components/GenerateQRCodeDialog";
import Icon from "@/components/Icon";
import LinkFavicon from "@/components/LinkFavicon";
import VisibilityIcon from "@/components/VisibilityIcon";
import Dropdown from "@/components/common/Dropdown";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { absolutifyLink } from "@/helpers/utils";
import useLoading from "@/hooks/useLoading";
import useNavigateTo from "@/hooks/useNavigateTo";
import { useUserStore, useShortcutStore } from "@/stores";
import { Shortcut } from "@/types/proto/api/v1/shortcut_service";
import { Role } from "@/types/proto/api/v1/user_service";

interface State {
  showEditDrawer: boolean;
}

const ShortcutDetail = () => {
  const { t } = useTranslation();
  const params = useParams();
  const shortcutId = Number(params["shortcutId"]);
  const navigateTo = useNavigateTo();
  const shortcutStore = useShortcutStore();
  const userStore = useUserStore();
  const shortcut = shortcutStore.getShortcutById(shortcutId);
  const currentUser = useUserStore().getCurrentUser();
  const [state, setState] = useState<State>({
    showEditDrawer: false,
  });
  const [showQRCodeDialog, setShowQRCodeDialog] = useState<boolean>(false);
  const loadingState = useLoading(true);
  const creator = userStore.getUserById(shortcut.creatorId);
  const havePermission = currentUser.role === Role.ADMIN || shortcut.creatorId === currentUser.id;
  const shortcutLink = absolutifyLink(`/s/${shortcut.name}`);

  useEffect(() => {
    (async () => {
      const shortcut = await shortcutStore.getOrFetchShortcutById(shortcutId);
      await userStore.getOrFetchUserById(shortcut.creatorId);
      loadingState.setFinish();
    })();
  }, [shortcutId]);

  if (loadingState.isLoading) {
    return null;
  }

  const handleCopyButtonClick = () => {
    copy(shortcutLink);
    toast.success("Shortcut link copied to clipboard.");
  };

  const handleDeleteShortcutButtonClick = (shortcut: Shortcut) => {
    showCommonDialog({
      title: "Delete Shortcut",
      content: `Are you sure to delete shortcut \`${shortcut.name}\`? You cannot undo this action.`,
      style: "danger",
      onConfirm: async () => {
        await shortcutStore.deleteShortcut(shortcut.id);
        navigateTo("/", {
          replace: true,
        });
      },
    });
  };

  return (
    <>
      <div className="mx-auto max-w-8xl w-full px-4 sm:px-6 md:px-12 pt-4 pb-6 flex flex-col justify-start items-start">
        <div className="mt-4 sm:mt-8 w-12 h-12 flex justify-center items-center overflow-clip">
          <LinkFavicon url={shortcut.link} />
        </div>
        <a
          className={classNames(
            "group max-w-full flex flex-row px-1 mr-1 justify-start items-center cursor-pointer rounded-md hover:underline",
          )}
          href={shortcutLink}
          target="_blank"
        >
          <div className="truncate text-3xl">
            {shortcut.title ? (
              <>
                <span className="dark:text-gray-400">{shortcut.title}</span>
                <span className="text-gray-500">(s/{shortcut.name})</span>
              </>
            ) : (
              <>
                <span className="text-gray-400 dark:text-gray-500">s/</span>
                <span className="truncate dark:text-gray-400">{shortcut.name}</span>
              </>
            )}
          </div>
          <span className="hidden group-hover:block ml-1 cursor-pointer shrink-0">
            <Icon.ExternalLink className="w-6 h-auto text-gray-600" />
          </span>
        </a>
        <div className="mt-2 w-full flex flex-row justify-normal items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="w-8 h-8 cursor-pointer border rounded-full text-gray-500 hover:bg-gray-100 hover:shadow dark:border-zinc-800 dark:hover:bg-zinc-800"
                  onClick={() => handleCopyButtonClick()}
                >
                  <Icon.Clipboard className="w-4 h-auto mx-auto" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Copy</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="w-8 h-8 cursor-pointer border rounded-full text-gray-500 hover:bg-gray-100 hover:shadow dark:border-zinc-800 dark:hover:bg-zinc-800"
                  onClick={() => setShowQRCodeDialog(true)}
                >
                  <Icon.QrCode className="w-4 h-auto mx-auto" />
                </button>
              </TooltipTrigger>
              <TooltipContent>QR Code</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {havePermission && (
            <Dropdown
              className="w-8 h-8 flex justify-center items-center border cursor-pointer rounded-full hover:bg-gray-100 hover:shadow dark:border-zinc-800 dark:hover:bg-zinc-800"
              actionsClassName="!w-32 !-right-24 dark:text-gray-500"
              actions={
                <>
                  <button
                    className="w-full px-2 flex flex-row justify-start items-center text-left leading-8 cursor-pointer rounded hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60 dark:hover:bg-zinc-800"
                    onClick={() => {
                      setState({
                        ...state,
                        showEditDrawer: true,
                      });
                    }}
                  >
                    <Icon.Edit className="w-4 h-auto mr-2" /> {t("common.edit")}
                  </button>
                  <button
                    className="w-full px-2 flex flex-row justify-start items-center text-left leading-8 cursor-pointer rounded text-red-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60 dark:hover:bg-zinc-800"
                    onClick={() => {
                      handleDeleteShortcutButtonClick(shortcut);
                    }}
                  >
                    <Icon.Trash className="w-4 h-auto mr-2" /> {t("common.delete")}
                  </button>
                </>
              }
            ></Dropdown>
          )}
        </div>
        {shortcut.description && <p className="w-full break-all mt-4 text-gray-500 dark:text-gray-400">{shortcut.description}</p>}
        <div className="mt-2 flex flex-row justify-start items-start flex-wrap gap-2">
          {shortcut.tags.map((tag) => {
            return (
              <span key={tag} className="max-w-[8rem] truncate text-gray-400 text leading-4 dark:text-gray-500">
                #{tag}
              </span>
            );
          })}
          {shortcut.tags.length === 0 && <span className="text-gray-400 text-sm leading-4 italic dark:text-gray-500">No tags</span>}
        </div>
        <div className="w-full flex mt-4 gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-auto px-2 leading-6 flex flex-row justify-start items-center border rounded-full text-gray-500 text-sm dark:border-zinc-800">
                  <Icon.User className="w-4 h-auto mr-1" />
                  <span className="max-w-[4rem] sm:max-w-[6rem] truncate">{creator.nickname}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>Creator</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-auto px-2 leading-6 flex flex-row justify-start items-center border rounded-full text-gray-500 text-sm dark:border-zinc-800">
                  <VisibilityIcon className="w-4 h-auto mr-1" visibility={shortcut.visibility} />
                  {t(`shortcut.visibility.${shortcut.visibility.toLowerCase()}.self`)}
                </div>
              </TooltipTrigger>
              <TooltipContent>{t(`shortcut.visibility.${shortcut.visibility.toLowerCase()}.description`)}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-auto px-2 leading-6 flex flex-row justify-start items-center border rounded-full text-gray-500 text-sm dark:border-zinc-800">
                  <Icon.BarChart2 className="w-4 h-auto mr-1" />
                  {shortcut.viewCount} visits
                </div>
              </TooltipTrigger>
              <TooltipContent>View count</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="w-full flex flex-col mt-8">
          <h3 id="analytics" className="pl-1 font-medium text-lg flex flex-row justify-start items-center dark:text-gray-400">
            <Icon.BarChart2 className="w-6 h-auto mr-1" />
            {t("analytics.self")}
          </h3>
          <AnalyticsView className="mt-4 w-full grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4" shortcutId={shortcut.id} />
        </div>
      </div>

      {showQRCodeDialog && <GenerateQRCodeDialog shortcut={shortcut} onClose={() => setShowQRCodeDialog(false)} />}

      {state.showEditDrawer && (
        <CreateShortcutDrawer
          shortcutId={shortcut.id}
          onClose={() =>
            setState({
              ...state,
              showEditDrawer: false,
            })
          }
        />
      )}
    </>
  );
};

export default ShortcutDetail;
