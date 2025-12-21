import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useLoading from "@/hooks/useLoading";
import { useUserStore } from "@/stores";

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
          <DialogTitle>Change Password</DialogTitle>
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
          <Button variant="outline" disabled={requestState.isLoading} onClick={onClose}>
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
