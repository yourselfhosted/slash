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

const EditUserinfoDialog: React.FC<Props> = (props: Props) => {
  const { onClose } = props;
  const { t } = useTranslation();
  const userStore = useUserStore();
  const currentUser = userStore.getCurrentUser();
  const [email, setEmail] = useState(currentUser.email);
  const [nickname, setNickname] = useState(currentUser.nickname);
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
      await userStore.patchUser({
        id: currentUser.id,
        email,
        nickname,
      });
      onClose();
      toast("User information updated");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response.data.message);
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

export default EditUserinfoDialog;
