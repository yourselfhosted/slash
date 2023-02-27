import { Button, Input, Modal, ModalDialog } from "@mui/joy";
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
      title: "",
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
            title: workspaceTemp.title,
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

  const handleSaveBtnClick = async () => {
    if (!state.workspaceCreate.name) {
      toastHelper.error("ID is required");
      return;
    }
    if (!state.workspaceCreate.title) {
      toastHelper.error("Title is required");
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
      toastHelper.error(JSON.stringify(error.response.data));
    }
    requestState.setFinish();
  };

  return (
    <Modal open={true}>
      <ModalDialog>
        <div className="flex flex-row justify-between items-center w-80">
          <span className="text-lg font-medium">{workspaceId ? "Edit Workspace" : "Create Workspace"}</span>
          <Button variant="plain" onClick={onClose}>
            <Icon.X className="w-5 h-auto text-gray-600" />
          </Button>
        </div>
        <div>
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">
              ID <span className="text-red-600">*</span>
            </span>
            <Input
              className="w-full"
              type="text"
              placeholder="Workspace ID is an unique identifier for your workspace."
              value={state.workspaceCreate.name}
              onChange={(e) => handleInputChange(e, "name")}
            />
          </div>
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">
              Name <span className="text-red-600">*</span>
            </span>
            <Input className="w-full" type="text" value={state.workspaceCreate.title} onChange={(e) => handleInputChange(e, "title")} />
          </div>
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">Description</span>
            <Input
              className="w-full"
              type="text"
              value={state.workspaceCreate.description}
              onChange={(e) => handleInputChange(e, "description")}
            />
          </div>
          <div className="w-full flex flex-row justify-end items-center mt-4 space-x-2">
            <Button color="neutral" variant="plain" disabled={requestState.isLoading} loading={requestState.isLoading} onClick={onClose}>
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

export default CreateWorkspaceDialog;
