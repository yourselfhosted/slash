import { useState } from "react";
import { useTranslation } from "react-i18next";
import useNavigateTo from "@/hooks/useNavigateTo";
import { useShortcutStore, useUserStore } from "@/stores";
import { Shortcut } from "@/types/proto/api/v1/shortcut_service";
import { Role } from "@/types/proto/api/v1/user_service";
import { showCommonDialog } from "./Alert";
import CreateShortcutDrawer from "./CreateShortcutDrawer";
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
  const shortcutStore = useShortcutStore();
  const currentUser = useUserStore().getCurrentUser();
  const [showEditDrawer, setShowEditDrawer] = useState<boolean>(false);
  const [showQRCodeDialog, setShowQRCodeDialog] = useState<boolean>(false);
  const havePermission = currentUser.role === Role.ADMIN || shortcut.creatorId === currentUser.id;

  const handleDeleteShortcutButtonClick = (shortcut: Shortcut) => {
    showCommonDialog({
      title: "Delete Shortcut",
      content: `Are you sure to delete shortcut \`${shortcut.name}\`? You cannot undo this action.`,
      style: "danger",
      onConfirm: async () => {
        await shortcutStore.deleteShortcut(shortcut.id);
      },
    });
  };

  const gotoAnalytics = () => {
    navigateTo(`/shortcut/${shortcut.id}#analytics`);
  };

  return (
    <>
      <Dropdown
        actionsClassName="!w-32 text-sm"
        actions={
          <>
            {havePermission && (
              <button
                className="w-full px-2 flex flex-row justify-start items-center text-left text-foreground leading-8 cursor-pointer rounded hover:bg-accent disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60"
                onClick={() => setShowEditDrawer(true)}
              >
                <Icon.Edit className="w-4 h-auto mr-2 opacity-70" /> {t("common.edit")}
              </button>
            )}
            <button
              className="w-full px-2 flex flex-row justify-start items-center text-left text-foreground leading-8 cursor-pointer rounded hover:bg-accent disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60"
              onClick={() => setShowQRCodeDialog(true)}
            >
              <Icon.QrCode className="w-4 h-auto mr-2 opacity-70" /> QR Code
            </button>
            <button
              className="w-full px-2 flex flex-row justify-start items-center text-left text-foreground leading-8 cursor-pointer rounded hover:bg-accent disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60"
              onClick={gotoAnalytics}
            >
              <Icon.BarChart2 className="w-4 h-auto mr-2 opacity-70" /> {t("analytics.self")}
            </button>
            {havePermission && (
              <button
                className="w-full px-2 flex flex-row justify-start items-center text-left leading-8 cursor-pointer rounded text-destructive hover:bg-accent disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60"
                onClick={() => {
                  handleDeleteShortcutButtonClick(shortcut);
                }}
              >
                <Icon.Trash className="w-4 h-auto mr-2 opacity-70" /> {t("common.delete")}
              </button>
            )}
          </>
        }
      ></Dropdown>

      {showEditDrawer && (
        <CreateShortcutDrawer
          shortcutId={shortcut.id}
          onClose={() => setShowEditDrawer(false)}
          onConfirm={() => setShowEditDrawer(false)}
        />
      )}

      {showQRCodeDialog && <GenerateQRCodeDialog shortcut={shortcut} onClose={() => setShowQRCodeDialog(false)} />}
    </>
  );
};

export default ShortcutActionsDropdown;
