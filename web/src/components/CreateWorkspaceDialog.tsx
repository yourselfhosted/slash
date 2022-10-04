import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { useEffect, useState } from "react";
import { workspaceService } from "../services";
import useLoading from "../hooks/useLoading";
import Icon from "./Icon";
import toastHelper from "./Toast";

interface Props {
  workspaceId?: WorkspaceId;
  onClose: () => void;
  onConfirm?: (workspace: Workspace) => void;
}

interface State {
  workspaceCreate: WorkspaceCreate;
}

const CreateWorkspaceDialog: React.FC<Props> = (props: Props) => {
  const { onClose, onConfirm, workspaceId } = props;
  const [state, setState] = useState<State>({
    workspaceCreate: {
      name: "",
      description: "",
    },
  });
  const requestState = useLoading(false);

  useEffect(() => {
    if (workspaceId) {
      const workspaceTemp = workspaceService.getWorkspaceById(workspaceId);
      if (workspaceTemp) {
        setState({
          ...state,
          workspaceCreate: Object.assign(state.workspaceCreate, {
            name: workspaceTemp.name,
            description: workspaceTemp.description,
          }),
        });
      }
    }
  }, [workspaceId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const text = e.target.value as string;
    const tempObject = {} as any;
    tempObject[key] = text;

    setState({
      ...state,
      workspaceCreate: Object.assign(state.workspaceCreate, tempObject),
    });
  };

  const handleNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(e, "name");
  };

  const handleDescriptionInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(e, "description");
  };

  const handleSaveBtnClick = async () => {
    if (!state.workspaceCreate.name) {
      toastHelper.error("Name is required");
      return;
    }

    requestState.setLoading();
    try {
      let workspace;
      if (workspaceId) {
        workspace = await workspaceService.patchWorkspace({
          id: workspaceId,
          ...state.workspaceCreate,
        });
      } else {
        workspace = await workspaceService.createWorkspace({
          ...state.workspaceCreate,
        });
      }

      if (onConfirm) {
        onConfirm(workspace);
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
        <p className="text-base">{workspaceId ? "Edit Workspace" : "Create Workspace"}</p>
        <button className="rounded p-1 hover:bg-gray-100" onClick={onClose}>
          <Icon.X className="w-5 h-auto text-gray-600" />
        </button>
      </DialogTitle>
      <DialogContent>
        <div className="w-full flex flex-col justify-start items-start mb-3">
          <span className="mb-2">Name</span>
          <input
            className="w-full rounded border text-sm shadow-inner px-2 py-2"
            type="text"
            value={state.workspaceCreate.name}
            onChange={handleNameInputChange}
          />
        </div>
        <div className="w-full flex flex-col justify-start items-start mb-3">
          <span className="mb-2">Description</span>
          <input
            className="w-full rounded border text-sm shadow-inner px-2 py-2"
            type="text"
            value={state.workspaceCreate.description}
            onChange={handleDescriptionInputChange}
          />
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

export default CreateWorkspaceDialog;
