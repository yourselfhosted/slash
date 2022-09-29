import { Dialog, DialogContent, DialogTitle } from "@mui/material";
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
    <Dialog open={true}>
      <DialogTitle className="flex flex-row justify-between items-center w-80">
        <p className="text-base">Change Password</p>
        <button className="rounded p-1 hover:bg-gray-100" onClick={handleCloseBtnClick}>
          <Icon.X className="w-5 h-auto text-gray-600" />
        </button>
      </DialogTitle>
      <DialogContent>
        <div className="w-full flex flex-col justify-start items-start mb-3">
          <span className="mb-2">New Password</span>
          <input
            className="w-full rounded border text-sm shadow-inner px-2 py-2"
            type="text"
            value={newPassword}
            onChange={handleNewPasswordChanged}
          />
        </div>
        <div className="w-full flex flex-col justify-start items-start mb-3">
          <span className="mb-2">New Password Again</span>
          <input
            className="w-full rounded border text-sm shadow-inner px-2 py-2"
            type="text"
            value={newPasswordAgain}
            onChange={handleNewPasswordAgainChanged}
          />
        </div>
        <div className="w-full flex flex-row justify-end items-center">
          <button
            disabled={requestState.isLoading}
            className={`rounded px-3 py-2 mr-2 hover:opacity-80 ${requestState.isLoading ? "opacity-80" : ""}`}
            onClick={handleCloseBtnClick}
          >
            Cancel
          </button>
          <button
            disabled={requestState.isLoading}
            className={`rounded px-3 py-2 shadow bg-green-600 text-white hover:bg-green-700 ${requestState.isLoading ? "opacity-80" : ""}`}
            onClick={handleSaveBtnClick}
          >
            Save
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;
