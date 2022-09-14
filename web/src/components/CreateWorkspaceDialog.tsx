import { useEffect, useState } from "react";
import { workspaceService } from "../services";
import useLoading from "../hooks/useLoading";
import Icon from "./Icon";
import { generateDialog } from "./Dialog";
import toastHelper from "./Toast";

interface Props extends DialogProps {
  workspaceId?: WorkspaceId;
}

interface State {
  workspaceCreate: WorkspaceCreate;
}

const CreateWorkspaceDialog: React.FC<Props> = (props: Props) => {
  const { destroy, workspaceId } = props;
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

    try {
      if (workspaceId) {
        await workspaceService.patchWorkspace({
          id: workspaceId,
          ...state.workspaceCreate,
        });
      } else {
        await workspaceService.createWorkspace({
          ...state.workspaceCreate,
        });
      }
    } catch (error: any) {
      console.error(error);
      toastHelper.error(error.response.data.message);
    }
    destroy();
  };

  return (
    <>
      <div className="max-w-full w-80 flex flex-row justify-between items-center mb-4">
        <p className="text-base">{workspaceId ? "Edit Workspace" : "Create Workspace"}</p>
        <button className="rounded p-1 hover:bg-gray-100" onClick={destroy}>
          <Icon.X className="w-5 h-auto text-gray-600" />
        </button>
      </div>
      <div className="w-full flex flex-col justify-start items-start">
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
            className={`rounded px-3 py-2 shadow bg-green-600 text-white hover:bg-green-700 ${requestState.isLoading ? "opacity-80" : ""}`}
            onClick={handleSaveBtnClick}
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
};

export default function showCreateWorkspaceDialog(workspaceId?: WorkspaceId): void {
  generateDialog(
    {
      className: "px-2 sm:px-0",
    },
    CreateWorkspaceDialog,
    {
      workspaceId,
    }
  );
}
