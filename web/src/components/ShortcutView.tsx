import { Tooltip } from "@mui/joy";
import copy from "copy-to-clipboard";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { absolutifyLink } from "../helpers/utils";
import { shortcutService } from "../services";
import useFaviconStore from "../stores/v1/favicon";
import useUserStore from "../stores/v1/user";
import useViewStore from "../stores/v1/view";
import { showCommonDialog } from "./Alert";
import AnalyticsDialog from "./AnalyticsDialog";
import Dropdown from "./common/Dropdown";
import GenerateQRCodeDialog from "./GenerateQRCodeDialog";
import Icon from "./Icon";
import VisibilityIcon from "./VisibilityIcon";

interface Props {
  shortcut: Shortcut;
  handleEdit: () => void;
}

const ShortcutView = (props: Props) => {
  const { shortcut, handleEdit } = props;
  const { t } = useTranslation();
  const currentUser = useUserStore().getCurrentUser();
  const viewStore = useViewStore();
  const faviconStore = useFaviconStore();
  const [favicon, setFavicon] = useState<string | undefined>(undefined);
  const [showQRCodeDialog, setShowQRCodeDialog] = useState<boolean>(false);
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState<boolean>(false);
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
      },
    });
  };

  return (
    <>
      <div className="group w-full flex flex-col justify-start items-start border px-4 py-3 rounded-lg hover:shadow">
        <div className="w-full flex flex-row justify-between items-center">
          <div className="w-[calc(100%-16px)] flex flex-row justify-start items-center pr-2 mr-1 shrink-0">
            <Link to={`/shortcut/${shortcut.id}`} className="w-8 h-8 flex justify-center items-center overflow-clip shrink-0">
              {favicon ? (
                <img className="w-full h-auto rounded-full" src={favicon} decoding="async" loading="lazy" />
              ) : (
                <Icon.CircleSlash className="w-8 h-auto text-gray-400" />
              )}
            </Link>
            <div className="ml-1 w-[calc(100%-32px)] flex flex-col justify-start items-start">
              <div className="w-full flex flex-row justify-start items-center">
                <a
                  className="max-w-[calc(100%-32px)] flex flex-row px-1 mr-1 justify-start items-center cursor-pointer rounded-md hover:bg-gray-100 hover:shadow"
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
              <a className="ml-1 w-full text-sm truncate text-gray-400 hover:underline" href={shortcut.link} target="_blank">
                {shortcut.link}
              </a>
            </div>
          </div>
          <div className="flex flex-row justify-end items-center">
            {havePermission && (
              <Dropdown
                actionsClassName="!w-32"
                actions={
                  <>
                    <button
                      className="w-full px-2 flex flex-row justify-start items-center text-left leading-8 cursor-pointer rounded hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
                      onClick={() => handleEdit()}
                    >
                      <Icon.Edit className="w-4 h-auto mr-2" /> Edit
                    </button>
                    <button
                      className="w-full px-2 flex flex-row justify-start items-center text-left leading-8 cursor-pointer rounded hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
                      onClick={() => setShowQRCodeDialog(true)}
                    >
                      <Icon.QrCode className="w-4 h-auto mr-2" /> QR Code
                    </button>
                    <button
                      className="w-full px-2 flex flex-row justify-start items-center text-left leading-8 cursor-pointer rounded hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
                      onClick={() => setShowAnalyticsDialog(true)}
                    >
                      <Icon.BarChart2 className="w-4 h-auto mr-2" /> Analytics
                    </button>
                    <button
                      className="w-full px-2 flex flex-row justify-start items-center text-left leading-8 cursor-pointer rounded text-red-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
                      onClick={() => {
                        handleDeleteShortcutButtonClick(shortcut);
                      }}
                    >
                      <Icon.Trash className="w-4 h-auto mr-2" /> Delete
                    </button>
                  </>
                }
              ></Dropdown>
            )}
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
            <div
              className="w-auto px-2 leading-6 flex flex-row justify-start items-center border rounded-full cursor-pointer text-gray-500 text-sm"
              onClick={() => setShowAnalyticsDialog(true)}
            >
              <Icon.BarChart2 className="w-4 h-auto mr-1" />
              {shortcut.view} visits
            </div>
          </Tooltip>
        </div>
      </div>

      {showQRCodeDialog && <GenerateQRCodeDialog shortcut={shortcut} onClose={() => setShowQRCodeDialog(false)} />}

      {showAnalyticsDialog && <AnalyticsDialog shortcutId={shortcut.id} onClose={() => setShowAnalyticsDialog(false)} />}
    </>
  );
};

export default ShortcutView;
