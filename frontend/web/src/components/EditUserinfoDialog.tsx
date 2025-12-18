import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useLoading from "@/hooks/useLoading";
import { useUserStore } from "@/stores";
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
      await userStore.patchUser(
        {
          id: currentUser.id,
          email,
          nickname,
        },
        ["email", "nickname"],
      );
      onClose();
      toast.success("User information updated");
    } catch (error: any) {
      console.error(error);
      toast.error(error.details);
    }
    requestState.setFinish();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-80 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex flex-row justify-between items-center">
            <span>Edit Userinfo</span>
            <Button variant="ghost" size="icon" onClick={handleCloseBtnClick}>
              <Icon.X className="w-5 h-auto" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("common.email")}</Label>
            <Input id="email" type="text" value={email} onChange={handleEmailChanged} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nickname">{t("user.nickname")}</Label>
            <Input id="nickname" type="text" value={nickname} onChange={handleNicknameChanged} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" disabled={requestState.isLoading} onClick={handleCloseBtnClick}>
            {t("common.cancel")}
          </Button>
          <Button disabled={requestState.isLoading} onClick={handleSaveBtnClick}>
            {requestState.isLoading ? "Saving..." : t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserinfoDialog;
