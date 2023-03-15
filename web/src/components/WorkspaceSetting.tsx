import { Button } from "@mui/joy";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { deleteWorkspaceUser } from "../helpers/api";
import useLoading from "../hooks/useLoading";
import { workspaceService } from "../services";
import { useAppSelector } from "../store";
import { unknownWorkspace, unknownWorkspaceUser } from "../store/modules/workspace";
import { showCommonDialog } from "./Alert";
import Icon from "./Icon";
import CreateWorkspaceDialog from "./CreateWorkspaceDialog";
import UpsertWorkspaceUserDialog from "./UpsertWorkspaceUserDialog";
import MemberListView from "./MemberListView";

interface Props {
  workspaceId: WorkspaceId;
}

interface State {
  showEditWorkspaceDialog: boolean;
  showUpsertWorkspaceUserDialog: boolean;
}

const WorkspaceSetting: React.FC<Props> = (props: Props) => {
  const { workspaceId } = props;
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.user.user) as User;
  const [state, setState] = useState<State>({
    showEditWorkspaceDialog: false,
    showUpsertWorkspaceUserDialog: false,
  });
  const { workspaceList } = useAppSelector((state) => state.workspace);
  const loadingState = useLoading();
  const workspace = workspaceList.find((workspace) => workspace.id === workspaceId) ?? unknownWorkspace;
  const workspaceUser = workspace.workspaceUserList.find((workspaceUser) => workspaceUser.userId === user.id) ?? unknownWorkspaceUser;

  useEffect(() => {
    const workspace = workspaceService.getWorkspaceById(workspaceId);
    if (!workspace) {
      toast.error("workspace not found");
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

  const handleUpsertWorkspaceMemberButtonClick = () => {
    setState({
      ...state,
      showUpsertWorkspaceUserDialog: true,
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
        <span className="mb-4 text-gray-500">Basic</span>
        <p className="text-3xl mb-4">
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

      <div className="w-full flex flex-col justify-start items-start">
        <div className="w-full flex flex-row justify-between items-center">
          <span className="mt-8 mb-4 text-gray-500">Member list</span>
          {workspaceUser.role === "ADMIN" && (
            <Button variant="soft" onClick={handleUpsertWorkspaceMemberButtonClick}>
              <Icon.Plus className="w-4 h-auto mr-1" />
              New member
            </Button>
          )}
        </div>
        <MemberListView workspaceId={workspaceId} />
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

      {state.showUpsertWorkspaceUserDialog && (
        <UpsertWorkspaceUserDialog
          workspaceId={workspace.id}
          onClose={() => {
            setState({
              ...state,
              showUpsertWorkspaceUserDialog: false,
            });
          }}
          onConfirm={async () => {
            setState({
              ...state,
              showUpsertWorkspaceUserDialog: false,
            });
            if (location.hash !== "#members") {
              navigate("#members");
            }
          }}
        />
      )}
    </>
  );
};

export default WorkspaceSetting;
