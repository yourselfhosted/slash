import { Button, Input, Modal, ModalDialog } from "@mui/joy";
import { useState } from "react";
import { toast } from "react-hot-toast";
import useLoading from "../hooks/useLoading";
import { userService } from "../services";
import Icon from "./Icon";
import { useAppSelector } from "../stores";

interface Props {
  onClose: () => void;
}

const EditUserinfoDialog: React.FC<Props> = (props: Props) => {
  const { onClose } = props;
  const user = useAppSelector((state) => state.user.user as User);
  const [email, setEmail] = useState(user.email);
  const [nickname, setNickname] = useState(user.nickname);
  const requestState = useLoading(false);

  const handleCloseBtnClick = () => {
    onClose();
  };

  const handleEmailChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value as string;
    setEmail(text);
  };

  const handleNicknameChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value as string;
    setNickname(text);
  };

  const handleSaveBtnClick = async () => {
    if (email === "" || nickname === "") {
      toast.error("Please fill all fields");
      return;
    }

    requestState.setLoading();
    try {
      const user = userService.getState().user as User;
      await userService.patchUser({
        id: user.id,
        email,
        nickname,
      });
      onClose();
      toast("Password changed");
    } catch (error: any) {
      console.error(error);
      toast.error(JSON.stringify(error.response.data));
    }
    requestState.setFinish();
  };

  return (
    <Modal open={true}>
      <ModalDialog>
        <div className="flex flex-row justify-between items-center w-80 mb-4">
          <span className="text-lg font-medium">Edit Userinfo</span>
          <Button variant="plain" onClick={handleCloseBtnClick}>
            <Icon.X className="w-5 h-auto text-gray-600" />
          </Button>
        </div>
        <div>
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">Email</span>
            <Input className="w-full" type="text" value={email} onChange={handleEmailChanged} />
          </div>
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">Nickname</span>
            <Input className="w-full" type="text" value={nickname} onChange={handleNicknameChanged} />
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

export default EditUserinfoDialog;
