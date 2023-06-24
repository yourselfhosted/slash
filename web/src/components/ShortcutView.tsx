import copy from "copy-to-clipboard";
import { absolutifyLink } from "../helpers/utils";
import toast from "react-hot-toast";
import { showCommonDialog } from "./Alert";
import { shortcutService } from "../services";
import { Tooltip } from "@mui/joy";
import Icon from "./Icon";
import Dropdown from "./common/Dropdown";
import { useAppSelector } from "../stores";

interface Props {
  shortcut: Shortcut;
  handleEdit: () => void;
}

const ShortcutView = (props: Props) => {
  const { shortcut, handleEdit } = props;
  const user = useAppSelector((state) => state.user.user as User);

  const havePermission = (shortcut: Shortcut) => {
    return user.role === "ADMIN" || shortcut.creatorId === user.id;
  };

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
    <div className="w-full flex flex-col justify-start items-start border px-4 py-3 mb-2 rounded-lg">
      <div className="w-full flex flex-row justify-between items-center">
        <p className="text-lg mr-1 shrink-0">
          <span className="cursor-pointer hover:opacity-80" onClick={() => handleCopyButtonClick(shortcut)}>
            <span className="text-gray-400">o/</span>
            {shortcut.name}
          </span>
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
          <Dropdown
            actionsClassName="!w-24"
            actions={
              <>
                <button
                  disabled={!havePermission(shortcut)}
                  className="w-full px-2 text-left leading-8 cursor-pointer rounded hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
                  onClick={() => handleEdit()}
                >
                  Edit
                </button>
                <button
                  disabled={!havePermission(shortcut)}
                  className="w-full px-2 text-left leading-8 cursor-pointer rounded text-red-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
                  onClick={() => {
                    handleDeleteShortcutButtonClick(shortcut);
                  }}
                >
                  Delete
                </button>
              </>
            }
          ></Dropdown>
        </div>
      </div>
      {shortcut.description && <p className="mt-1 text-gray-400 text-sm">{shortcut.description}</p>}
      {shortcut.tags.length > 0 && false && (
        <div className="mt-2 flex flex-row justify-start items-start gap-2">
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
          <div className="w-auto px-2 pr-3 leading-6 flex flex-row justify-start items-center border rounded-full text-gray-500 font-mono text-sm">
            <Icon.User className="w-4 h-auto mr-1" />
            {shortcut.creator.nickname}
          </div>
        </Tooltip>
        <Tooltip title="View count" variant="solid" placement="top" arrow>
          <div className="w-auto px-2 pr-3 leading-6 flex flex-row justify-start items-center border rounded-full text-gray-500 font-mono text-sm">
            <Icon.Eye className="w-4 h-auto mr-1" />
            {shortcut.view}
          </div>
        </Tooltip>
      </div>
    </div>
  );
};

export default ShortcutView;
