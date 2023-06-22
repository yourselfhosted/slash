import { Tooltip } from "@mui/joy";
import copy from "copy-to-clipboard";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { UNKNOWN_ID } from "../helpers/consts";
import { shortcutService } from "../services";
import { useAppSelector } from "../store";
import { absolutifyLink } from "../helpers/utils";
import { showCommonDialog } from "./Alert";
import Icon from "./Icon";
import Dropdown from "./common/Dropdown";
import CreateShortcutDialog from "./CreateShortcutDialog";

interface Props {
  shortcutList: Shortcut[];
}

interface State {
  currentEditingShortcutId: ShortcutId;
}

const ShortcutListView: React.FC<Props> = (props: Props) => {
  const { shortcutList } = props;
  const user = useAppSelector((state) => state.user.user as User);
  const [state, setState] = useState<State>({
    currentEditingShortcutId: UNKNOWN_ID,
  });

  const havePermission = (shortcut: Shortcut) => {
    return user.role === "ADMIN" || shortcut.creatorId === user.id;
  };

  const handleCopyButtonClick = (shortcut: Shortcut) => {
    copy(absolutifyLink(`/${shortcut.name}`));
    toast.success("Shortcut link copied to clipboard.");
  };

  const handleEditShortcutButtonClick = (shortcut: Shortcut) => {
    setState({
      ...state,
      currentEditingShortcutId: shortcut.id,
    });
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
    <>
      <div className="w-full flex flex-col justify-start items-start">
        {shortcutList.map((shortcut) => {
          return (
            <div key={shortcut.id} className="w-full flex flex-row justify-between items-start border px-6 py-4 mb-3 rounded-lg">
              <div className="flex flex-row justify-start items-center mr-4">
                <span>{shortcut.name}</span>
                <span className="text-gray-400 text-sm ml-2">({shortcut.description})</span>
              </div>
              <div className="flex flex-row justify-end items-center">
                <span className="w-16 truncate mr-2 text-gray-600">{shortcut.creator.nickname}</span>
                <Tooltip title="Copy link" variant="solid" placement="top">
                  <button
                    className="cursor-pointer mr-4 hover:opacity-80"
                    onClick={() => {
                      handleCopyButtonClick(shortcut);
                    }}
                  >
                    <Icon.Copy className="w-5 h-auto" />
                  </button>
                </Tooltip>
                <Tooltip title="Go to link" variant="solid" placement="top">
                  <a className="cursor-pointer mr-4 hover:opacity-80" target="_blank" href={shortcut.link}>
                    <Icon.ExternalLink className="w-5 h-auto" />
                  </a>
                </Tooltip>
                <Dropdown
                  actions={
                    <>
                      <button
                        disabled={!havePermission(shortcut)}
                        className="w-full px-3 text-left leading-10 cursor-pointer rounded hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
                        onClick={() => handleEditShortcutButtonClick(shortcut)}
                      >
                        Edit
                      </button>
                      <button
                        disabled={!havePermission(shortcut)}
                        className="w-full px-3 text-left leading-10 cursor-pointer rounded text-red-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
                        onClick={() => {
                          handleDeleteShortcutButtonClick(shortcut);
                        }}
                      >
                        Delete
                      </button>
                    </>
                  }
                  actionsClassName="!w-24"
                ></Dropdown>
              </div>
            </div>
          );
        })}
      </div>

      {state.currentEditingShortcutId !== UNKNOWN_ID && (
        <CreateShortcutDialog
          shortcutId={state.currentEditingShortcutId}
          onClose={() => {
            setState({
              ...state,
              currentEditingShortcutId: UNKNOWN_ID,
            });
          }}
          onConfirm={() => {
            setState({
              ...state,
              currentEditingShortcutId: UNKNOWN_ID,
            });
          }}
        />
      )}
    </>
  );
};

export default ShortcutListView;
