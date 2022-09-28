import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteWorkspaceUser } from "../helpers/api";
import useLoading from "../hooks/useLoading";
import { workspaceService } from "../services";
import { useAppSelector } from "../store";
import { unknownWorkspace, unknownWorkspaceUser } from "../store/modules/workspace";
import showCreateWorkspaceDialog from "./CreateWorkspaceDialog";
import { showCommonDialog } from "./Dialog/CommonDialog";
import toastHelper from "./Toast";

interface Props {
  workspaceId: WorkspaceId;
}

interface State {
  workspace: Workspace;
  workspaceUser: WorkspaceUser;
}

const WorkspaceSetting: React.FC<Props> = (props: Props) => {
  const { workspaceId } = props;
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.user.user) as User;
  const [state, setState] = useState<State>({
    workspace: unknownWorkspace,
    workspaceUser: unknownWorkspaceUser,
  });
  const loadingState = useLoading();

  useEffect(() => {
    const workspace = workspaceService.getWorkspaceById(workspaceId);
    if (!workspace) {
      toastHelper.error("workspace not found");
      return;
    }

    loadingState.setLoading();
    Promise.all([workspaceService.getWorkspaceUser(workspace.id, user.id)])
      .then(([workspaceUser]) => {
        setState({
          workspace,
          workspaceUser,
        });
      })
      .finally(() => {
        loadingState.setFinish();
      });
  }, []);

  const handleEditWorkspaceButtonClick = () => {
    showCreateWorkspaceDialog(state.workspace.id);
  };

  const handleDeleteWorkspaceButtonClick = () => {
    showCommonDialog({
      title: "Delete Workspace",
      content: `Are you sure to delete workspace \`${state.workspace.name}\`?`,
      style: "warning",
      onConfirm: async () => {
        await workspaceService.deleteWorkspaceById(state.workspace.id);
        navigate("/");
      },
    });
  };

  const handleExitWorkspaceButtonClick = () => {
    showCommonDialog({
      title: "Exit Workspace",
      content: `Are you sure to exit workspace \`${state.workspace.name}\`?`,
      style: "warning",
      onConfirm: async () => {
        await deleteWorkspaceUser({
          workspaceId: state.workspace.id,
          userId: state.workspaceUser.userId,
        });
        navigate("/");
      },
    });
  };

  return (
    <div className="w-full flex flex-col justify-start items-start">
      <p className="text-3xl mt-2 mb-4">{state.workspace.name}</p>
      <p>{state.workspace.description}</p>

      <div className="border-t pt-4 mt-2 flex flex-row justify-start items-center">
        <span className="text-gray-400 mr-2">Actions:</span>
        <div className="flex flex-row justify-start items-center space-x-2">
          {state.workspaceUser.role === "ADMIN" ? (
            <>
              <button className="border rounded-md px-3 leading-8 hover:shadow" onClick={handleEditWorkspaceButtonClick}>
                Edit
              </button>
              <button
                className="border rounded-md px-3 leading-8 border-red-600 text-red-600 bg-red-50 hover:shadow"
                onClick={handleDeleteWorkspaceButtonClick}
              >
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                className="border rounded-md px-3 leading-8 border-red-600 text-red-600 bg-red-50 hover:shadow"
                onClick={handleExitWorkspaceButtonClick}
              >
                Exit
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSetting;
