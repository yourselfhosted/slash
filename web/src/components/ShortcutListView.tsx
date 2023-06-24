import { Tooltip } from "@mui/joy";
import copy from "copy-to-clipboard";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { shortcutService } from "../services";
import { useAppSelector } from "../stores";
import { absolutifyLink } from "../helpers/utils";
import { showCommonDialog } from "./Alert";
import Icon from "./Icon";
import Dropdown from "./common/Dropdown";
import CreateShortcutDialog from "./CreateShortcutDialog";

interface Props {
  shortcutList: Shortcut[];
}

const ShortcutListView: React.FC<Props> = (props: Props) => {
  const { shortcutList } = props;
  const user = useAppSelector((state) => state.user.user as User);
  const [editingShortcutId, setEditingShortcutId] = useState<ShortcutId | undefined>();

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
    <>
      <div className="w-full flex flex-col justify-start items-start">
        {shortcutList.map((shortcut) => {
          return (
            <div key={shortcut.id} className="w-full flex flex-row justify-between items-start border px-4 py-3 mb-2 rounded-lg">
              <div className="flex flex-col justify-start items-start mr-4">
                <p>
                  <span className="cursor-pointer hover:opacity-80" onClick={() => handleCopyButtonClick(shortcut)}>
                    <span className="text-gray-400">o/</span>
                    {shortcut.name}
                  </span>
                </p>
                {shortcut.description && <p className="mt-1 text-gray-400 text-sm">{shortcut.description}</p>}
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
              </div>
              <div className="flex flex-row justify-end items-center space-x-2">
                <Tooltip title="Copy link" variant="solid" placement="top">
                  <button className="cursor-pointer hover:opacity-80" onClick={() => handleCopyButtonClick(shortcut)}>
                    <Icon.Copy className="w-5 h-auto text-gray-600" />
                  </button>
                </Tooltip>
                <Tooltip title="Go to link" variant="solid" placement="top">
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
                        onClick={() => setEditingShortcutId(shortcut.id)}
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
          );
        })}
      </div>

      {editingShortcutId && (
        <CreateShortcutDialog
          shortcutId={editingShortcutId}
          onClose={() => setEditingShortcutId(undefined)}
          onConfirm={() => setEditingShortcutId(undefined)}
        />
      )}
    </>
  );
};

export default ShortcutListView;
