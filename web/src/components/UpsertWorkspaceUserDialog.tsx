import { Button, Input, Modal, ModalDialog, Radio, RadioGroup } from "@mui/joy";
import { useState } from "react";
import { workspaceService } from "../services";
import { UNKNOWN_ID } from "../helpers/consts";
import { upsertWorkspaceUser } from "../helpers/api";
import useLoading from "../hooks/useLoading";
import Icon from "./Icon";
import toastHelper from "./Toast";

interface Props {
  workspaceId: WorkspaceId;
  onClose: () => void;
  onConfirm?: () => void;
}

interface State {
  workspaceUserUpsert: WorkspaceUserUpsert;
}

const UpsertWorkspaceUserDialog: React.FC<Props> = (props: Props) => {
  const { onClose, onConfirm, workspaceId } = props;
  const [state, setState] = useState<State>({
    workspaceUserUpsert: {
      workspaceId: workspaceId,
      userId: UNKNOWN_ID,
      role: "USER",
    },
  });
  const requestState = useLoading(false);

  const handleUserIdInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value as string;

    setState({
      workspaceUserUpsert: Object.assign(state.workspaceUserUpsert, {
        userId: Number(text),
      }),
    });
  };

  const handleUserRoleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value as string;

    setState({
      workspaceUserUpsert: Object.assign(state.workspaceUserUpsert, {
        role: text,
      }),
    });
  };

  const handleSaveBtnClick = async () => {
    if (!state.workspaceUserUpsert.userId) {
      toastHelper.error("User ID is required");
      return;
    }

    requestState.setLoading();
    try {
      await upsertWorkspaceUser({
        ...state.workspaceUserUpsert,
      });

      await workspaceService.fetchWorkspaceById(workspaceId);

      if (onConfirm) {
        onConfirm();
      } else {
        onClose();
      }
    } catch (error: any) {
      console.error(error);
      toastHelper.error(JSON.stringify(error.response.data));
    }
    requestState.setFinish();
  };

  return (
    <Modal open={true}>
      <ModalDialog>
        <div className="flex flex-row justify-between items-center w-80">
          <span className="text-lg font-medium">Create Workspace Member</span>
          <Button variant="plain" onClick={onClose}>
            <Icon.X className="w-5 h-auto text-gray-600" />
          </Button>
        </div>
        <div>
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">User ID</span>
            <Input
              className="w-full"
              type="number"
              value={state.workspaceUserUpsert.userId <= 0 ? "" : state.workspaceUserUpsert.userId}
              onChange={handleUserIdInputChange}
            />
          </div>
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">Role</span>
            <div>
              <RadioGroup orientation="horizontal" value={state.workspaceUserUpsert.role} onChange={handleUserRoleInputChange}>
                <Radio value="USER" label="User" />
                <Radio value="ADMIN" label="Admin" />
              </RadioGroup>
            </div>
          </div>
          <div className="w-full flex flex-row justify-end items-center">
            <Button color="primary" disabled={requestState.isLoading} loading={requestState.isLoading} onClick={handleSaveBtnClick}>
              Save
            </Button>
          </div>
        </div>
      </ModalDialog>
    </Modal>
  );
};

export default UpsertWorkspaceUserDialog;
