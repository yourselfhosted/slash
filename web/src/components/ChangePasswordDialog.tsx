import { Button, Input, Modal, ModalDialog } from "@mui/joy";
import { useState } from "react";
import { validate, ValidatorConfig } from "../helpers/validator";
import useLoading from "../hooks/useLoading";
import { userService } from "../services";
import Icon from "./Icon";
import toastHelper from "./Toast";

const validateConfig: ValidatorConfig = {
  minLength: 3,
  maxLength: 24,
  noSpace: true,
  noChinese: true,
};

interface Props {
  onClose: () => void;
}

const ChangePasswordDialog: React.FC<Props> = (props: Props) => {
  const { onClose } = props;
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
      toastHelper.error("Please fill all inputs");
      return;
    }

    if (newPassword !== newPasswordAgain) {
      toastHelper.error("Not matched");
      setNewPasswordAgain("");
      return;
    }

    const passwordValidResult = validate(newPassword, validateConfig);
    if (!passwordValidResult.result) {
      toastHelper.error("New password is invalid");
      return;
    }

    requestState.setLoading();
    try {
      const user = userService.getState().user as User;
      await userService.patchUser({
        id: user.id,
        password: newPassword,
      });
      onClose();
      toastHelper.info("Password changed");
    } catch (error: any) {
      console.error(error);
      toastHelper.error(error.response.data.message);
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
              Cancel
            </Button>
            <Button color="primary" disabled={requestState.isLoading} loading={requestState.isLoading} onClick={handleSaveBtnClick}>
              Save
            </Button>
          </div>
        </div>
      </ModalDialog>
    </Modal>
  );
};

export default ChangePasswordDialog;
