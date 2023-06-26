import { Tooltip } from "@mui/joy";
import copy from "copy-to-clipboard";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { shortcutService } from "../services";
import { useAppSelector } from "../stores";
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
  const havePermission = user.role === "ADMIN" || shortcut.creatorId === user.id;

  const handleCopyButtonClick = (shortcut: Shortcut) => {
    copy(absolutifyLink(`/s/${shortcut.name}`));
    toast.success("Shortcut link copied to clipboard.");
  };

  const handleDeleteShortcutButtonClick = (shortcut: Shortcut) => {
    showCommonDialog({
      title: "Delete Shortcut",
      content: `Are you sure to delete shortcut \`${shortcut.name}\` in this workspace?`,
      style: "danger",
      onConfirm: async () => {
        await shortcutService.deleteShortcutById(shortcut.id);
      },
    });
  };

  return (
    <div className="w-full flex flex-col justify-start items-start border px-4 py-3 mb-2 rounded-lg hover:shadow">
      <div className="w-full flex flex-row justify-between items-center">
        <p className="text-lg mr-1 shrink-0">
          <button className="cursor-pointer hover:opacity-80" onClick={() => handleCopyButtonClick(shortcut)}>
            <span className="text-gray-400">s/</span>
            {shortcut.name}
          </button>
        </p>
        <div className="flex flex-row justify-end items-center space-x-2">
          <Tooltip title="Copy link" variant="solid" placement="top" arrow>
            <button className="cursor-pointer hover:opacity-80" onClick={() => handleCopyButtonClick(shortcut)}>
              <Icon.Copy className="w-5 h-auto text-gray-600" />
            </button>
          </Tooltip>
          <Tooltip title="Go to link" variant="solid" placement="top" arrow>
            <a className="cursor-pointer hover:opacity-80" target="_blank" href={shortcut.link}>
              <Icon.ExternalLink className="w-5 h-auto text-gray-600" />
            </a>
          </Tooltip>
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
            <Icon.Eye className="w-4 h-auto mr-1" />
            {shortcut.view} visits
          </div>
        </Tooltip>
      </div>
    </div>
  );
};

export default ShortcutView;
