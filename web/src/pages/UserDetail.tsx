import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store";
import Header from "../components/Header";
import { showCommonDialog } from "../components/Alert";
import { userService } from "../services";
import Icon from "../components/Icon";
import copy from "copy-to-clipboard";
import toastHelper from "../components/Toast";
import ChangePasswordDialog from "../components/ChangePasswordDialog";

interface State {
  showChangePasswordDialog: boolean;
}

const UserDetail: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.user);
  const [state, setState] = useState<State>({
    showChangePasswordDialog: false,
  });

  useEffect(() => {
    if (!userService.getState().user) {
      navigate("/user/auth");
      return;
    }
  }, []);

  const handleChangePasswordBtnClick = async () => {
    setState({
      ...state,
      showChangePasswordDialog: true,
    });
  };

  const handleCopyOpenIdBtnClick = async () => {
    if (!user?.openId) {
      toastHelper.error("OpenID not found");
      return;
    }

    copy(user.openId);
    toastHelper.success("OpenID copied");
  };

  const handleResetOpenIdBtnClick = async () => {
    showCommonDialog({
      title: "Reset Open API",
      content: "❗️The existing API will be invalidated and a new one will be generated, are you sure you want to reset?",
      style: "warning",
      onConfirm: async () => {
        await userService.patchUser({
          id: user?.id as UserId,
          resetOpenId: true,
        });
      },
    });
  };

  return (
    <>
      <div className="w-full h-full flex flex-col justify-start items-start">
        <Header />
        <div className="mx-auto max-w-4xl w-full px-3 py-6 flex flex-col justify-start items-start space-y-4">
          <p className="text-3xl mt-2 mb-4">{user?.name}</p>
          <p className="leading-8 flex flex-row justify-start items-center">
            <span className="mr-3 text-gray-500 font-mono">Email: </span>
            {user?.email}
          </p>
          <p className="leading-8 flex flex-row justify-start items-center">
            <span className="mr-3 text-gray-500 font-mono">Password: </span>
            <button className="border rounded-md px-2 leading-8 hover:shadow" onClick={handleChangePasswordBtnClick}>
              Change
            </button>
          </p>
          <p className="leading-8 flex flex-row justify-start items-center">
            <span className="mr-3 text-gray-500 font-mono">OpenID:</span>
            <input className="border shrink w-48 rounded-md px-3 pr-5 shadow-inner truncate" type="text" value={user?.openId} readOnly />
            <button className="-ml-6 bg-white text-gray-600 hover:text-black" onClick={handleCopyOpenIdBtnClick}>
              <Icon.Clipboard className="w-4 h-auto" />
            </button>
            <button
              className="border ml-4 rounded-md px-2 leading-8 border-red-600 text-red-600 bg-red-50 hover:shadow"
              onClick={handleResetOpenIdBtnClick}
            >
              Reset
            </button>
          </p>
        </div>
      </div>
      {state.showChangePasswordDialog && (
        <ChangePasswordDialog
          onClose={() => {
            setState({
              ...state,
              showChangePasswordDialog: false,
            });
          }}
        />
      )}
    </>
  );
};

export default UserDetail;
