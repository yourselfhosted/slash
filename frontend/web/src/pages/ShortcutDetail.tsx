import { Tooltip } from "@mui/joy";
import classNames from "classnames";
import copy from "copy-to-clipboard";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useLoaderData } from "react-router-dom";
import useNavigateTo from "@/hooks/useNavigateTo";
import { showCommonDialog } from "../components/Alert";
import AnalyticsView from "../components/AnalyticsView";
import CreateShortcutDialog from "../components/CreateShortcutDialog";
import GenerateQRCodeDialog from "../components/GenerateQRCodeDialog";
import Icon from "../components/Icon";
import VisibilityIcon from "../components/VisibilityIcon";
import Dropdown from "../components/common/Dropdown";
import { absolutifyLink } from "../helpers/utils";
import { shortcutService } from "../services";
import useFaviconStore from "../stores/v1/favicon";
import useUserStore from "../stores/v1/user";

interface State {
  showEditModal: boolean;
}

const ShortcutDetail = () => {
  const { t } = useTranslation();
  const navigateTo = useNavigateTo();
  const shortcutId = (useLoaderData() as Shortcut).id;
  const shortcut = shortcutService.getShortcutById(shortcutId) as Shortcut;
  const currentUser = useUserStore().getCurrentUser();
  const faviconStore = useFaviconStore();
  const [state, setState] = useState<State>({
    showEditModal: false,
  });
  const [favicon, setFavicon] = useState<string | undefined>(undefined);
  const [showQRCodeDialog, setShowQRCodeDialog] = useState<boolean>(false);
  const havePermission = currentUser.role === "ADMIN" || shortcut.creatorId === currentUser.id;
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

  const handleDeleteShortcutButtonClick = (shortcut: Shortcut) => {
    showCommonDialog({
      title: "Delete Shortcut",
      content: `Are you sure to delete shortcut \`${shortcut.name}\`? You cannot undo this action.`,
      style: "danger",
      onConfirm: async () => {
        await shortcutService.deleteShortcutById(shortcut.id);
        navigateTo("/", {
          replace: true,
        });
      },
    });
  };

  return (
    <>
      <div className="mx-auto max-w-6xl w-full px-3 md:px-12 pt-4 pb-6 flex flex-col justify-start items-start">
        <div className="mt-8 w-12 h-12 flex justify-center items-center overflow-clip">
          {favicon ? (
            <img className="w-full h-auto rounded-full" src={favicon} decoding="async" loading="lazy" />
          ) : (
            <Icon.CircleSlash className="w-full h-auto text-gray-400" />
          )}
        </div>
        <a
          className={classNames(
            "group max-w-full flex flex-row px-1 mr-1 justify-start items-center cursor-pointer rounded-md hover:underline"
          )}
          href={shortcutLink}
          target="_blank"
        >
          <div className="truncate text-3xl">
            <span>{shortcut.title}</span>
            {shortcut.title ? (
              <span className="text-gray-400">(s/{shortcut.name})</span>
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
          <Tooltip title="Copy" variant="solid" placement="top" arrow>
            <button
              className="w-8 h-8 cursor-pointer border rounded-full text-gray-500 hover:bg-gray-100 hover:shadow dark:border-zinc-800 dark:hover:bg-zinc-800"
              onClick={() => handleCopyButtonClick()}
            >
              <Icon.Clipboard className="w-4 h-auto mx-auto" />
            </button>
          </Tooltip>
          <Tooltip title="QR Code" variant="solid" placement="top" arrow>
            <button
              className="w-8 h-8 cursor-pointer border rounded-full text-gray-500 hover:bg-gray-100 hover:shadow dark:border-zinc-800 dark:hover:bg-zinc-800"
              onClick={() => setShowQRCodeDialog(true)}
            >
              <Icon.QrCode className="w-4 h-auto mx-auto" />
            </button>
          </Tooltip>
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
                        showEditModal: true,
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
        {shortcut.description && <p className="w-full break-all mt-2 text-gray-400 text-sm dark:text-gray-500">{shortcut.description}</p>}
        <div className="mt-4 ml-1 flex flex-row justify-start items-start flex-wrap gap-2">
          {shortcut.tags.map((tag) => {
            return (
              <span key={tag} className="max-w-[8rem] truncate text-gray-400 text font-mono leading-4 dark:text-gray-500">
                #{tag}
              </span>
            );
          })}
          {shortcut.tags.length === 0 && (
            <span className="text-gray-400 text-sm font-mono leading-4 italic dark:text-gray-500">No tags</span>
          )}
        </div>
        <div className="w-full flex mt-4 gap-2">
          <Tooltip title="Creator" variant="solid" placement="top" arrow>
            <div className="w-auto px-2 leading-6 flex flex-row justify-start items-center border rounded-full text-gray-500 text-sm dark:border-zinc-800">
              <Icon.User className="w-4 h-auto mr-1" />
              <span className="max-w-[4rem] sm:max-w-[6rem] truncate">{shortcut.creator.nickname}</span>
            </div>
          </Tooltip>
          <Tooltip title={t(`shortcut.visibility.${shortcut.visibility.toLowerCase()}.description`)} variant="solid" placement="top" arrow>
            <div className="w-auto px-2 leading-6 flex flex-row justify-start items-center border rounded-full text-gray-500 text-sm dark:border-zinc-800">
              <VisibilityIcon className="w-4 h-auto mr-1" visibility={shortcut.visibility} />
              {t(`shortcut.visibility.${shortcut.visibility.toLowerCase()}.self`)}
            </div>
          </Tooltip>
          <Tooltip title="View count" variant="solid" placement="top" arrow>
            <div className="w-auto px-2 leading-6 flex flex-row justify-start items-center border rounded-full text-gray-500 text-sm dark:border-zinc-800">
              <Icon.BarChart2 className="w-4 h-auto mr-1" />
              {shortcut.view} visits
            </div>
          </Tooltip>
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

      {state.showEditModal && (
        <CreateShortcutDialog
          shortcutId={shortcut.id}
          onClose={() =>
            setState({
              ...state,
              showEditModal: false,
            })
          }
        />
      )}
    </>
  );
};

export default ShortcutDetail;
