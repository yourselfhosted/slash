import { useAppSelector } from "../store";
import Header from "../components/Header";
import { showCommonDialog } from "../components/Dialog/CommonDialog";
import { userService } from "../services";
import Icon from "../components/Icon";
import copy from "copy-to-clipboard";
import toastHelper from "../components/Toast";
import showChangePasswordDialog from "../components/ChangePasswordDialog";

const UserDetail: React.FC = () => {
  const { user } = useAppSelector((state) => state.user);

  const handleChangePasswordBtnClick = async () => {
    showChangePasswordDialog();
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
    <div className="w-full h-full flex flex-col justify-start items-start">
      <Header />
      <div className="mx-auto max-w-4xl w-full px-3 py-6 flex flex-col justify-start items-start space-y-3">
        <p className="text-3xl mt-2 mb-4">{user?.name}</p>
        <p className="leading-10 flex flex-row justify-start items-center">
          <span className="mr-3 text-gray-500 font-mono">Email: </span>
          {user?.email}
        </p>
        <p className="leading-10 flex flex-row justify-start items-center">
          <span className="mr-3 text-gray-500 font-mono">Password: </span>
          <button className="border rounded-md px-3 hover:shadow" onClick={handleChangePasswordBtnClick}>
            Change
          </button>
        </p>
        <p className="leading-10 flex flex-row justify-start items-center">
          <span className="mr-3 text-gray-500 font-mono">OpenID:</span>
          <input type="text" value={user?.openId} readOnly className="border rounded-md px-3 pr-5 shadow-inner truncate" />
          <button className="-ml-6 bg-white text-gray-600 hover:text-black" onClick={handleCopyOpenIdBtnClick}>
            <Icon.Clipboard className="w-4 h-auto" />
          </button>
          <button
            className="border ml-4 rounded-md px-3 border-red-600 text-red-600 bg-red-50 hover:shadow"
            onClick={handleResetOpenIdBtnClick}
          >
            Reset
          </button>
        </p>
      </div>
    </div>
  );
};

export default UserDetail;
