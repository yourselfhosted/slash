import { Button } from "@mui/joy";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteWorkspaceUser } from "../helpers/api";
import useLoading from "../hooks/useLoading";
import { workspaceService } from "../services";
import { useAppSelector } from "../store";
import { unknownWorkspace, unknownWorkspaceUser } from "../store/modules/workspace";
import { showCommonDialog } from "./Alert";
import toastHelper from "./Toast";
import CreateWorkspaceDialog from "./CreateWorkspaceDialog";
import Icon from "./Icon";

interface Props {
  workspaceId: WorkspaceId;
}

interface State {
  showEditWorkspaceDialog: boolean;
}

const WorkspaceSetting: React.FC<Props> = (props: Props) => {
  const { workspaceId } = props;
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.user.user) as User;
  const [state, setState] = useState<State>({
    showEditWorkspaceDialog: false,
  });
  const { workspaceList } = useAppSelector((state) => state.workspace);
  const loadingState = useLoading();
  const workspace = workspaceList.find((workspace) => workspace.id === workspaceId) ?? unknownWorkspace;
  const workspaceUser = workspace.workspaceUserList.find((workspaceUser) => workspaceUser.userId === user.id) ?? unknownWorkspaceUser;

  useEffect(() => {
    const workspace = workspaceService.getWorkspaceById(workspaceId);
    if (!workspace) {
      toastHelper.error("workspace not found");
      return;
    }

    loadingState.setFinish();
  }, []);

  const handleEditWorkspaceButtonClick = () => {
    setState({
      ...state,
      showEditWorkspaceDialog: true,
    });
  };

  const handleEditWorkspaceDialogConfirm = async () => {
    setState({
      ...state,
      showEditWorkspaceDialog: false,
    });
    const workspace = await workspaceService.fetchWorkspaceById(workspaceId);
    navigate(`/${workspace.name}#setting`);
  };

  const handleDeleteWorkspaceButtonClick = () => {
    showCommonDialog({
      title: "Delete Workspace",
      content: `Are you sure to delete workspace \`${workspace.name}\`?`,
      style: "danger",
      onConfirm: async () => {
        await workspaceService.deleteWorkspaceById(workspace.id);
        navigate("/");
      },
    });
  };

  const handleExitWorkspaceButtonClick = () => {
    showCommonDialog({
      title: "Exit Workspace",
      content: `Are you sure to exit workspace \`${workspace.name}\`?`,
      style: "danger",
      onConfirm: async () => {
        await deleteWorkspaceUser({
          workspaceId: workspace.id,
          userId: workspaceUser.userId,
        });
        navigate("/");
      },
    });
  };

  return (
    <>
      <div className="w-full flex flex-col justify-start items-start">
        <p className="text-3xl mt-4 mb-4">
          {workspace.title}
          <span className="text-lg ml-1 font-mono text-gray-400">({workspace.name})</span>
        </p>
        <p className="mb-4">{workspace.description || "No description."}</p>
        <div className="border-t pt-4 flex flex-row justify-start items-center">
          <div className="flex flex-row justify-start items-center space-x-2">
            {workspaceUser.role === "ADMIN" ? (
              <>
                <Button variant="soft" onClick={handleEditWorkspaceButtonClick}>
                  <Icon.Edit className="w-4 h-auto mr-1" />
                  Edit
                </Button>
                <Button variant="soft" color="danger" onClick={handleDeleteWorkspaceButtonClick}>
                  <Icon.Trash className="w-4 h-auto mr-1" />
                  Delete
                </Button>
              </>
            ) : (
              <>
                <Button variant="soft" color="danger" onClick={handleExitWorkspaceButtonClick}>
                  Exit
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {state.showEditWorkspaceDialog && (
        <CreateWorkspaceDialog
          workspaceId={workspace.id}
          onClose={() => {
            setState({
              ...state,
              showEditWorkspaceDialog: false,
            });
          }}
          onConfirm={() => handleEditWorkspaceDialogConfirm()}
        />
      )}
    </>
  );
};

export default WorkspaceSetting;
