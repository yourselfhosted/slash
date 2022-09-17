import { useState } from "react";
import { validate, ValidatorConfig } from "../helpers/validator";
import useLoading from "../hooks/useLoading";
import { userService } from "../services";
import Icon from "./Icon";
import { generateDialog } from "./Dialog";
import toastHelper from "./Toast";

const validateConfig: ValidatorConfig = {
  minLength: 3,
  maxLength: 24,
  noSpace: true,
  noChinese: true,
};

type Props = DialogProps;

const ChangePasswordDialog: React.FC<Props> = ({ destroy }: Props) => {
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordAgain, setNewPasswordAgain] = useState("");
  const requestState = useLoading(false);

  const handleCloseBtnClick = () => {
    destroy();
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
      toastHelper.info("Password changed");
      handleCloseBtnClick();
    } catch (error: any) {
      console.error(error);
      toastHelper.error(error.response.data.message);
    }
    requestState.setFinish();
  };

  return (
    <>
      <div className="max-w-full w-80 flex flex-row justify-between items-center mb-4">
        <p className="text-base">Change Password</p>
        <button className="rounded p-1 hover:bg-gray-100" onClick={destroy}>
          <Icon.X className="w-5 h-auto text-gray-600" />
        </button>
      </div>
      <div className="w-full flex flex-col justify-start items-start">
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
            className={`rounded px-3 py-2 ${requestState.isLoading ? "opacity-80" : ""}`}
            onClick={destroy}
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
      </div>
    </>
  );
};

function showChangePasswordDialog() {
  generateDialog({}, ChangePasswordDialog);
}

export default showChangePasswordDialog;
