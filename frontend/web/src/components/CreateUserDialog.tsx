import { isUndefined } from "lodash-es";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import useLoading from "@/hooks/useLoading";
import { useUserStore } from "@/stores";
import { Role, User } from "@/types/proto/api/v1/user_service";
import Icon from "./Icon";

interface Props {
  user?: User;
  onClose: () => void;
  onConfirm?: () => void;
}

interface State {
  userCreate: Pick<User, "email" | "nickname" | "password" | "role">;
}

const CreateUserDialog: React.FC<Props> = (props: Props) => {
  const { onClose, onConfirm, user } = props;
  const { t } = useTranslation();
  const userStore = useUserStore();
  const [state, setState] = useState<State>({
    userCreate: {
      email: "",
      nickname: "",
      password: "",
      role: Role.USER,
    },
  });
  const requestState = useLoading(false);
  const isCreating = isUndefined(user);

  useEffect(() => {
    if (user) {
      setState({
        ...state,
        userCreate: Object.assign(state.userCreate, {
          email: user.email,
          nickname: user.nickname,
          password: "",
          role: user.role,
        }),
      });
    }
  }, [user]);

  const setPartialState = (partialState: Partial<State>) => {
    setState({
      ...state,
      ...partialState,
    });
  };

  const handleEmailInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPartialState({
      userCreate: Object.assign(state.userCreate, {
        email: e.target.value.toLowerCase(),
      }),
    });
  };

  const handleNicknameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPartialState({
      userCreate: Object.assign(state.userCreate, {
        nickname: e.target.value,
      }),
    });
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPartialState({
      userCreate: Object.assign(state.userCreate, {
        password: e.target.value,
      }),
    });
  };

  const handleRoleChange = (value: string) => {
    setPartialState({
      userCreate: Object.assign(state.userCreate, {
        role: value,
      }),
    });
  };

  const handleSaveBtnClick = async () => {
    if (isCreating && (!state.userCreate.email || !state.userCreate.nickname || !state.userCreate.password)) {
      toast.error("Please fill all inputs");
      return;
    }

    try {
      if (user) {
        const userPatch: Partial<User> = {
          id: user.id,
        };
        const updateMask: string[] = [];
        if (user.email !== state.userCreate.email) {
          userPatch.email = state.userCreate.email;
          updateMask.push("email");
        }
        if (user.nickname !== state.userCreate.nickname) {
          userPatch.nickname = state.userCreate.nickname;
          updateMask.push("nickname");
        }
        if (user.role !== state.userCreate.role) {
          userPatch.role = state.userCreate.role;
          updateMask.push("role");
        }
        await userStore.patchUser(userPatch, updateMask);
      } else {
        await userStore.createUser(state.userCreate);
      }

      if (onConfirm) {
        onConfirm();
      } else {
        onClose();
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.details);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-80 sm:w-96">
        <DialogHeader>
          <DialogTitle className="flex flex-row justify-between items-center">
            <span>{isCreating ? "Create User" : "Edit User"}</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Icon.X className="w-5 h-auto" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Unique user email"
              value={state.userCreate.email}
              onChange={handleEmailInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nickname">
              Nickname <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nickname"
              type="text"
              placeholder="Nickname"
              value={state.userCreate.nickname}
              onChange={handleNicknameInputChange}
            />
          </div>
          {isCreating && (
            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-destructive">*</span>
              </Label>
              <Input id="password" type="password" placeholder="" value={state.userCreate.password} onChange={handlePasswordInputChange} />
            </div>
          )}
          <div className="space-y-2">
            <Label>
              Role <span className="text-destructive">*</span>
            </Label>
            <RadioGroup value={state.userCreate.role} onValueChange={handleRoleChange}>
              <div className="flex flex-row space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={Role.USER} id="role-user" />
                  <Label htmlFor="role-user" className="font-normal cursor-pointer">
                    User
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={Role.ADMIN} id="role-admin" />
                  <Label htmlFor="role-admin" className="font-normal cursor-pointer">
                    Admin
                  </Label>
                </div>
              </div>
            </RadioGroup>
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

export default CreateUserDialog;
