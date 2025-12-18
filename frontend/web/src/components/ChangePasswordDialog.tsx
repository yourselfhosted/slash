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
      userStore.patchUser(
        {
          id: userStore.getCurrentUser().id,
          password: newPassword,
        },
        ["password"],
      );
      onClose();
      toast.success("Password changed");
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
            <span>Change Password</span>
            <Button variant="ghost" size="icon" onClick={handleCloseBtnClick}>
              <Icon.X className="w-5 h-auto" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" value={newPassword} onChange={handleNewPasswordChanged} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password-again">New Password Again</Label>
            <Input id="new-password-again" type="password" value={newPasswordAgain} onChange={handleNewPasswordAgainChanged} />
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

export default ChangePasswordDialog;
