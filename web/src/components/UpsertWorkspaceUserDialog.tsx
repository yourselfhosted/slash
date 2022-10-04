import { Dialog, DialogContent, DialogTitle } from "@mui/material";
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
      toastHelper.error(error.response.data.error || error.response.data.message);
    }
    requestState.setFinish();
  };

  return (
    <Dialog open={true}>
      <DialogTitle className="flex flex-row justify-between items-center w-80">
        <p className="text-base">Create Workspace Member</p>
        <button className="rounded p-1 hover:bg-gray-100" onClick={onClose}>
          <Icon.X className="w-5 h-auto text-gray-600" />
        </button>
      </DialogTitle>
      <DialogContent>
        <div className="w-full flex flex-col justify-start items-start mb-3">
          <span className="mb-2">User ID</span>
          <input
            className="w-full rounded border text-sm shadow-inner px-2 py-2"
            type="number"
            value={state.workspaceUserUpsert.userId}
            onChange={handleUserIdInputChange}
          />
        </div>
        <div className="w-full flex flex-col justify-start items-start mb-3">
          <span className="mb-2">Role</span>
          <div>
            <input
              type="radio"
              name="role"
              id="role-user"
              value="USER"
              onChange={handleUserRoleInputChange}
              checked={state.workspaceUserUpsert.role === "USER"}
            />
            <label htmlFor="role-user" className="ml-1 mr-4">
              User
            </label>
            <input
              type="radio"
              name="role"
              id="role-admin"
              value="ADMIN"
              onChange={handleUserRoleInputChange}
              checked={state.workspaceUserUpsert.role === "ADMIN"}
            />
            <label htmlFor="role-admin" className="ml-1">
              Admin
            </label>
          </div>
        </div>
        <div className="w-full flex flex-row justify-end items-center">
          <button
            disabled={requestState.isLoading}
            className={`rounded px-3 leading-9 shadow bg-green-600 text-white hover:bg-green-700 ${
              requestState.isLoading ? "opacity-80" : ""
            }`}
            onClick={handleSaveBtnClick}
          >
            Save
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpsertWorkspaceUserDialog;
