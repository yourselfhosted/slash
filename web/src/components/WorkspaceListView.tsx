import { useState } from "react";
import { Link } from "react-router-dom";
import { UNKNOWN_ID } from "../helpers/consts";
import { workspaceService } from "../services";
import { showCommonDialog } from "./Alert";
import Dropdown from "./common/Dropdown";
import CreateWorkspaceDialog from "./CreateWorkspaceDialog";

interface Props {
  workspaceList: Workspace[];
}

interface State {
  currentEditingWorkspaceId: WorkspaceId;
}

const WorkspaceListView: React.FC<Props> = (props: Props) => {
  const { workspaceList } = props;
  const [state, setState] = useState<State>({
    currentEditingWorkspaceId: UNKNOWN_ID,
  });

  const handleEditWorkspaceButtonClick = (workspaceId: WorkspaceId) => {
    setState({
      ...state,
      currentEditingWorkspaceId: workspaceId,
    });
  };

  const handleDeleteWorkspaceButtonClick = (workspace: Workspace) => {
    showCommonDialog({
      title: "Delete Workspace",
      content: `Are you sure to delete workspace \`${workspace.name}\`?`,
      style: "danger",
      onConfirm: async () => {
        await workspaceService.deleteWorkspaceById(workspace.id);
      },
    });
  };

  return (
    <>
      <div className="w-full flex flex-col justify-start items-start">
        {workspaceList.map((workspace) => {
          return (
            <div key={workspace.id} className="w-full flex flex-row justify-between items-start border px-6 py-4 mb-3 rounded-lg">
              <div className="flex flex-col justify-start items-start">
                <Link to={`/${workspace.name}`} className="text-lg cursor-pointer hover:underline">
                  {workspace.name}
                </Link>
                <span className="text-sm mt-1 text-gray-600">{workspace.description}</span>
              </div>
              <Dropdown
                actions={
                  <>
                    <button
                      className="w-full px-3 text-left leading-10 cursor-pointer rounded hover:bg-gray-100"
                      onClick={() => handleEditWorkspaceButtonClick(workspace.id)}
                    >
                      Edit
                    </button>
                    <button
                      className="w-full px-3 text-left leading-10 cursor-pointer rounded text-red-600 hover:bg-gray-100"
                      onClick={() => {
                        handleDeleteWorkspaceButtonClick(workspace);
                      }}
                    >
                      Delete
                    </button>
                  </>
                }
                actionsClassName="!w-24"
              ></Dropdown>
            </div>
          );
        })}
      </div>

      {state.currentEditingWorkspaceId !== UNKNOWN_ID && (
        <CreateWorkspaceDialog
          workspaceId={state.currentEditingWorkspaceId}
          onClose={() => {
            setState({
              ...state,
              currentEditingWorkspaceId: UNKNOWN_ID,
            });
          }}
        />
      )}
    </>
  );
};

export default WorkspaceListView;
