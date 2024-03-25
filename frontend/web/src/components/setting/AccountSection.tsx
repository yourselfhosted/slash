import { Button } from "@mui/joy";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Role } from "@/types/proto/api/v1/user_service";
import useUserStore from "../../stores/v1/user";
import ChangePasswordDialog from "../ChangePasswordDialog";
import EditUserinfoDialog from "../EditUserinfoDialog";

const AccountSection: React.FC = () => {
  const { t } = useTranslation();
  const currentUser = useUserStore().getCurrentUser();
  const [showEditUserinfoDialog, setShowEditUserinfoDialog] = useState<boolean>(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState<boolean>(false);
  const isAdmin = currentUser.role === Role.ADMIN;

  return (
    <>
      <div className="w-full flex flex-col justify-start items-start gap-y-2">
        <p className="text-2xl shrink-0 font-semibold text-gray-900 dark:text-gray-500">{t("common.account")}</p>
        <p className="flex flex-row justify-start items-center mt-2 dark:text-gray-400">
          <span className="text-xl">{currentUser.nickname}</span>
          {isAdmin && <span className="ml-2 bg-blue-600 text-white px-2 leading-6 text-sm rounded-full">Admin</span>}
        </p>
        <p className="flex flex-row justify-start items-center dark:text-gray-400">
          <span className="mr-3 text-gray-500">{t("common.email")}: </span>
          {currentUser.email}
        </p>
        <div className="flex flex-row justify-start items-center gap-2 mt-2">
          <Button variant="outlined" color="neutral" onClick={() => setShowEditUserinfoDialog(true)}>
            {t("common.edit")}
          </Button>
          <Button variant="outlined" color="neutral" onClick={() => setShowChangePasswordDialog(true)}>
            Change password
          </Button>
        </div>
      </div>

      {showEditUserinfoDialog && <EditUserinfoDialog onClose={() => setShowEditUserinfoDialog(false)} />}

      {showChangePasswordDialog && <ChangePasswordDialog onClose={() => setShowChangePasswordDialog(false)} />}
    </>
  );
};

export default AccountSection;
