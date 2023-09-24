import { useState } from "react";
import { useTranslation } from "react-i18next";
import useNavigateTo from "@/hooks/useNavigateTo";
import { shortcutService } from "../services";
import useUserStore from "../stores/v1/user";
import { showCommonDialog } from "./Alert";
import CreateShortcutDialog from "./CreateShortcutDialog";
import GenerateQRCodeDialog from "./GenerateQRCodeDialog";
import Icon from "./Icon";
import Dropdown from "./common/Dropdown";

interface Props {
  shortcut: Shortcut;
}

const ShortcutActionsDropdown = (props: Props) => {
  const { shortcut } = props;
  const { t } = useTranslation();
  const navigateTo = useNavigateTo();
  const currentUser = useUserStore().getCurrentUser();
  const [showEditDialog, setShowEditDialog] = useState<boolean>(false);
  const [showQRCodeDialog, setShowQRCodeDialog] = useState<boolean>(false);
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

  const gotoAnalytics = () => {
    navigateTo(`/shortcut/${shortcut.id}#analytics`);
  };

  return (
    <>
      <Dropdown
        actionsClassName="!w-32 dark:text-gray-500"
        actions={
          <>
            {havePermission && (
              <button
                className="w-full px-2 flex flex-row justify-start items-center text-left leading-8 cursor-pointer rounded hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60 dark:hover:bg-zinc-800"
                onClick={() => setShowEditDialog(true)}
              >
                <Icon.Edit className="w-4 h-auto mr-2" /> {t("common.edit")}
              </button>
            )}
            <button
              className="w-full px-2 flex flex-row justify-start items-center text-left leading-8 cursor-pointer rounded hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60 dark:hover:bg-zinc-800"
              onClick={() => setShowQRCodeDialog(true)}
            >
              <Icon.QrCode className="w-4 h-auto mr-2" /> QR Code
            </button>
            <button
              className="w-full px-2 flex flex-row justify-start items-center text-left leading-8 cursor-pointer rounded hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60 dark:hover:bg-zinc-800"
              onClick={gotoAnalytics}
            >
              <Icon.BarChart2 className="w-4 h-auto mr-2" /> {t("analytics.self")}
            </button>
            {havePermission && (
              <button
                className="w-full px-2 flex flex-row justify-start items-center text-left leading-8 cursor-pointer rounded text-red-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60 dark:hover:bg-zinc-800"
                onClick={() => {
                  handleDeleteShortcutButtonClick(shortcut);
                }}
              >
                <Icon.Trash className="w-4 h-auto mr-2" /> {t("common.delete")}
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
    </>
  );
};

export default ShortcutActionsDropdown;
