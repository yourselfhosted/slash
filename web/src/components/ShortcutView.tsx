import { Tooltip } from "@mui/joy";
import copy from "copy-to-clipboard";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { shortcutService } from "../services";
import { useAppSelector } from "../stores";
import useFaviconStore from "../stores/v1/favicon";
import { absolutifyLink } from "../helpers/utils";
import { showCommonDialog } from "./Alert";
import Icon from "./Icon";
import Dropdown from "./common/Dropdown";
import VisibilityIcon from "./VisibilityIcon";

interface Props {
  shortcut: Shortcut;
  handleEdit: () => void;
}

const ShortcutView = (props: Props) => {
  const { shortcut, handleEdit } = props;
  const { t } = useTranslation();
  const user = useAppSelector((state) => state.user.user as User);
  const faviconStore = useFaviconStore();
  const [favicon, setFavicon] = useState<string | undefined>(undefined);
  const havePermission = user.role === "ADMIN" || shortcut.creatorId === user.id;
  const shortifyLink = absolutifyLink(`/s/${shortcut.name}`);

  useEffect(() => {
    faviconStore.getOrFetchUrlFavicon(shortcut.link).then((url) => {
      if (url) {
        setFavicon(url);
      }
    });
  }, [shortcut.link]);

  const gotoShortcutLink = () => {
    window.open(shortifyLink, "_blank");
  };

  const handleCopyButtonClick = () => {
    copy(shortifyLink);
    toast.success("Shortcut link copied to clipboard.");
  };

  const handleDeleteShortcutButtonClick = (shortcut: Shortcut) => {
    showCommonDialog({
      title: "Delete Shortcut",
      content: `Are you sure to delete shortcut \`${shortcut.name}\`? You can not undo this action.`,
      style: "danger",
      onConfirm: async () => {
        await shortcutService.deleteShortcutById(shortcut.id);
      },
    });
  };

  return (
    <div className="w-full flex flex-col justify-start items-start border px-4 py-3 mb-2 rounded-lg hover:shadow">
      <div className="w-full flex flex-row justify-between items-center">
        <div className="group flex flex-row justify-start items-center mr-1 shrink-0">
          <div className="w-6 h-6 mr-1.5 flex justify-center items-center overflow-clip">
            {favicon ? (
              <img className="w-[90%] h-auto rounded-full" src={favicon} decoding="async" loading="lazy" />
            ) : (
              <Icon.Globe2 className="w-5 h-auto text-gray-500" />
            )}
          </div>
          <button className="items-center cursor-pointer hover:opacity-80 hover:underline" onClick={() => gotoShortcutLink()}>
            <span className="text-gray-400">s/</span>
            {shortcut.name}
          </button>
          <button className="hidden group-hover:block ml-1 cursor-pointer hover:opacity-80" onClick={() => handleCopyButtonClick()}>
            <Icon.Clipboard className="w-4 h-auto text-gray-500" />
          </button>
          <a className="hidden group-hover:block ml-1 cursor-pointer hover:opacity-80" target="_blank" href={shortifyLink}>
            <Icon.ExternalLink className="w-4 h-auto text-gray-500" />
          </a>
        </div>
        <div className="flex flex-row justify-end items-center space-x-2">
          {havePermission && (
            <Dropdown
              actionsClassName="!w-24"
              actions={
                <>
                  <button
                    className="w-full px-2 flex flex-row justify-start items-center text-left leading-8 cursor-pointer rounded hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
                    onClick={() => handleEdit()}
                  >
                    <Icon.Edit className="w-4 h-auto mr-2" /> Edit
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
      {shortcut.description && <p className="mt-1 text-gray-400 text-sm">{shortcut.description}</p>}
      {shortcut.tags.length > 0 && (
        <div className="mt-1 flex flex-row justify-start items-start gap-2">
          <Icon.Tag className="text-gray-400 w-4 h-auto" />
          {shortcut.tags.map((tag) => {
            return (
              <span key={tag} className="text-gray-400 text-sm font-mono leading-4">
                #{tag}
              </span>
            );
          })}
        </div>
      )}
      <div className="w-full flex mt-2 gap-2">
        <Tooltip title="Creator" variant="solid" placement="top" arrow>
          <div className="w-auto px-2 leading-6 flex flex-row justify-start items-center border rounded-full text-gray-500 text-sm">
            <Icon.User className="w-4 h-auto mr-1" />
            {shortcut.creator.nickname}
          </div>
        </Tooltip>
        <Tooltip title={t(`shortcut.visibility.${shortcut.visibility.toLowerCase()}.description`)} variant="solid" placement="top" arrow>
          <div className="w-auto px-2 leading-6 flex flex-row justify-start items-center border rounded-full text-gray-500 text-sm">
            <VisibilityIcon className="w-4 h-auto mr-1" visibility={shortcut.visibility} />
            {t(`shortcut.visibility.${shortcut.visibility.toLowerCase()}.self`)}
          </div>
        </Tooltip>
        <Tooltip title="View count" variant="solid" placement="top" arrow>
          <div className="w-auto px-2 leading-6 flex flex-row justify-start items-center border rounded-full text-gray-500 text-sm">
            <Icon.BarChart2 className="w-4 h-auto mr-1" />
            {shortcut.view} visits
          </div>
        </Tooltip>
      </div>
    </div>
  );
};

export default ShortcutView;
