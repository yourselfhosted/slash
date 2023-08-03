import { useState } from "react";
import { shortcutService } from "../services";
import useUserStore from "../stores/v1/user";
import { showCommonDialog } from "./Alert";
import AnalyticsDialog from "./AnalyticsDialog";
import Dropdown from "./common/Dropdown";
import CreateShortcutDialog from "./CreateShortcutDialog";
import GenerateQRCodeDialog from "./GenerateQRCodeDialog";
import Icon from "./Icon";

interface Props {
  shortcut: Shortcut;
}

const ShortcutActionsDropdown = (props: Props) => {
  const { shortcut } = props;
  const currentUser = useUserStore().getCurrentUser();
  const [showEditDialog, setShowEditDialog] = useState<boolean>(false);
  const [showQRCodeDialog, setShowQRCodeDialog] = useState<boolean>(false);
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState<boolean>(false);
  const havePermission = currentUser.role === "ADMIN" || shortcut.creatorId === currentUser.id;

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
      <Dropdown
        actionsClassName="!w-32"
        actions={
          <>
            {havePermission && (
              <button
                className="w-full px-2 flex flex-row justify-start items-center text-left leading-8 cursor-pointer rounded hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
                onClick={() => setShowEditDialog(true)}
              >
                <Icon.Edit className="w-4 h-auto mr-2" /> Edit
              </button>
            )}
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
            {havePermission && (
              <button
                className="w-full px-2 flex flex-row justify-start items-center text-left leading-8 cursor-pointer rounded text-red-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
                onClick={() => {
                  handleDeleteShortcutButtonClick(shortcut);
                }}
              >
                <Icon.Trash className="w-4 h-auto mr-2" /> Delete
              </button>
            )}
          </>
        }
      ></Dropdown>

      {showEditDialog && (
        <CreateShortcutDialog
          shortcutId={shortcut.id}
          onClose={() => setShowEditDialog(false)}
          onConfirm={() => setShowEditDialog(false)}
        />
      )}

      {showQRCodeDialog && <GenerateQRCodeDialog shortcut={shortcut} onClose={() => setShowQRCodeDialog(false)} />}

      {showAnalyticsDialog && <AnalyticsDialog shortcutId={shortcut.id} onClose={() => setShowAnalyticsDialog(false)} />}
    </>
  );
};

export default ShortcutActionsDropdown;
