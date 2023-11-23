import { Button, Input, Modal, ModalDialog } from "@mui/joy";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import useLoading from "../hooks/useLoading";
import useUserStore from "../stores/v1/user";
import Icon from "./Icon";

interface Props {
  onClose: () => void;
}

const ChangePasswordDialog: React.FC<Props> = (props: Props) => {
  const { onClose } = props;
  const { t } = useTranslation();
  const userStore = useUserStore();
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordAgain, setNewPasswordAgain] = useState("");
  const requestState = useLoading(false);

  const handleCloseBtnClick = () => {
    onClose();
  };

  const handleNewPasswordChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value as string;
    setNewPassword(text);
  };

  const handleNewPasswordAgainChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value as string;
    setNewPasswordAgain(text);
  };

  const handleSaveBtnClick = async () => {
    if (newPassword === "" || newPasswordAgain === "") {
      toast.error("Please fill all inputs");
      return;
    }

    if (newPassword !== newPasswordAgain) {
      toast.error("Not matched");
      setNewPasswordAgain("");
      return;
    }

    requestState.setLoading();
    try {
      userStore.patchUser({
        id: userStore.getCurrentUser().id,
        password: newPassword,
      });
      onClose();
      toast("Password changed");
    } catch (error: any) {
      console.error(error);
      toast.error(error.details);
    }
    requestState.setFinish();
  };

  return (
    <Modal open={true}>
      <ModalDialog>
        <div className="flex flex-row justify-between items-center w-80 mb-4">
          <span className="text-lg font-medium">Change Password</span>
          <Button variant="plain" onClick={handleCloseBtnClick}>
            <Icon.X className="w-5 h-auto text-gray-600" />
          </Button>
        </div>
        <div>
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">New Password</span>
            <Input className="w-full" type="text" value={newPassword} onChange={handleNewPasswordChanged} />
          </div>
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">New Password Again</span>
            <Input className="w-full" type="text" value={newPasswordAgain} onChange={handleNewPasswordAgainChanged} />
          </div>
          <div className="w-full flex flex-row justify-end items-center space-x-2">
            <Button variant="plain" disabled={requestState.isLoading} onClick={handleCloseBtnClick}>
              {t("common.cancel")}
            </Button>
            <Button color="primary" disabled={requestState.isLoading} loading={requestState.isLoading} onClick={handleSaveBtnClick}>
              {t("common.save")}
            </Button>
          </div>
        </div>
      </ModalDialog>
    </Modal>
  );
};

export default ChangePasswordDialog;
