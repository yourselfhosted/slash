import { Button, Input, Modal, ModalDialog, Radio, RadioGroup } from "@mui/joy";
import { isUndefined } from "lodash-es";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Role, User } from "@/types/proto/api/v2/user_service";
import useLoading from "../hooks/useLoading";
import useUserStore from "../stores/v1/user";
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

  const handleRoleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPartialState({
      userCreate: Object.assign(state.userCreate, {
        role: e.target.value,
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
        if (user.email !== state.userCreate.email) {
          userPatch.email = state.userCreate.email;
        }
        if (user.nickname !== state.userCreate.nickname) {
          userPatch.nickname = state.userCreate.nickname;
        }
        if (user.role !== state.userCreate.role) {
          userPatch.role = state.userCreate.role;
        }
        await userStore.patchUser(userPatch);
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
    <Modal open={true}>
      <ModalDialog>
        <div className="flex flex-row justify-between items-center w-80 sm:w-96">
          <span className="text-lg font-medium">{isCreating ? "Create User" : "Edit User"}</span>
          <Button variant="plain" onClick={onClose}>
            <Icon.X className="w-5 h-auto text-gray-600" />
          </Button>
        </div>
        <div>
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">
              Email <span className="text-red-600">*</span>
            </span>
            <div className="relative w-full">
              <Input
                className="w-full"
                type="email"
                placeholder="Unique user email"
                value={state.userCreate.email}
                onChange={handleEmailInputChange}
              />
            </div>
          </div>
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">
              Nickname <span className="text-red-600">*</span>
            </span>
            <Input
              className="w-full"
              type="text"
              placeholder="Nickname"
              value={state.userCreate.nickname}
              onChange={handleNicknameInputChange}
            />
          </div>
          {isCreating && (
            <div className="w-full flex flex-col justify-start items-start mb-3">
              <span className="mb-2">
                Password <span className="text-red-600">*</span>
              </span>
              <Input
                className="w-full"
                type="password"
                placeholder=""
                value={state.userCreate.password}
                onChange={handlePasswordInputChange}
              />
            </div>
          )}
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">
              Role <span className="text-red-600">*</span>
            </span>
            <div className="w-full flex flex-row justify-start items-center text-base">
              <RadioGroup orientation="horizontal" value={state.userCreate.role} onChange={handleRoleInputChange}>
                <Radio value={Role.USER} label={"User"} />
                <Radio value={Role.ADMIN} label={"Admin"} />
              </RadioGroup>
            </div>
          </div>
          <div className="w-full flex flex-row justify-end items-center mt-4 space-x-2">
            <Button color="neutral" variant="plain" disabled={requestState.isLoading} loading={requestState.isLoading} onClick={onClose}>
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

export default CreateUserDialog;
