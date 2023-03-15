import { Button, Input, Tooltip } from "@mui/joy";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppSelector } from "../store";
import { showCommonDialog } from "../components/Alert";
import { userService } from "../services";
import Icon from "../components/Icon";
import copy from "copy-to-clipboard";
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
      toast.error("OpenID not found");
      return;
    }

    copy(user.openId);
    toast.success("OpenID copied");
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
      <div className="mx-auto max-w-4xl w-full px-3 py-6 flex flex-col justify-start items-start space-y-4">
        <p className="text-3xl mt-2 mb-4">{user?.displayName}</p>
        <p className="leading-8 flex flex-row justify-start items-center">
          <span className="mr-3 text-gray-500 font-mono">Email: </span>
          {user?.email}
        </p>
        <div className="leading-8 flex flex-row justify-start items-center">
          <span className="mr-3 text-gray-500 font-mono">Password: </span>
          <Button variant="soft" onClick={handleChangePasswordBtnClick}>
            Change
          </Button>
        </div>
        {/* Do not display open api related field right now. */}
        {false && (
          <div className="leading-8 flex flex-row justify-start items-center">
            <span className="mr-3 text-gray-500 font-mono">OpenID:</span>
            <Input type="text" className="w-48" value={user?.openId} readOnly />
            <Tooltip title="Copy OpenID" variant="solid" placement="top">
              <button className="-ml-6 z-1 bg-white text-gray-600 hover:text-black" onClick={handleCopyOpenIdBtnClick}>
                <Icon.Clipboard className="w-4 h-auto" />
              </button>
            </Tooltip>
            <Button className="!ml-6" variant="soft" color="warning" onClick={handleResetOpenIdBtnClick}>
              Reset
            </Button>
          </div>
        )}
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
