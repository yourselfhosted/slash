import { useNavigate } from "react-router-dom";
import { workspaceService } from "../services";
import Dropdown from "./common/Dropdown";
import showCreateWorkspaceDialog from "./CreateWorkspaceDialog";

interface Props {
  workspaceList: Workspace[];
}

const WorkspaceListView: React.FC<Props> = (props: Props) => {
  const { workspaceList } = props;
  const navigate = useNavigate();

  const gotoWorkspaceDetailPage = (workspace: Workspace) => {
    navigate(`/workspace/${workspace.id}`);
  };

  const handleDeleteWorkspaceButtonClick = (workspace: Workspace) => {
    workspaceService.deleteWorkspaceById(workspace.id);
  };

  return (
    <div className="w-full flex flex-col justify-start items-start">
      {workspaceList.map((workspace) => {
        return (
          <div key={workspace.id} className="w-full flex flex-row justify-between items-start border px-6 py-4 mb-3 rounded-lg">
            <div className="flex flex-col justify-start items-start">
              <span className="text-lg font-medium cursor-pointer hover:underline" onClick={() => gotoWorkspaceDetailPage(workspace)}>
                {workspace.name}
              </span>
              <span className="text-base text-gray-600">{workspace.description}</span>
            </div>
            <Dropdown
              actions={
                <>
                  <span
                    className="w-full px-2 leading-8 cursor-pointer rounded hover:bg-gray-100"
                    onClick={() => showCreateWorkspaceDialog(workspace.id)}
                  >
                    Edit
                  </span>
                  <span
                    className="w-full px-2 leading-8 cursor-pointer rounded text-red-600 hover:bg-gray-100"
                    onClick={() => {
                      handleDeleteWorkspaceButtonClick(workspace);
                    }}
                  >
                    Delete
                  </span>
                </>
              }
            ></Dropdown>
          </div>
        );
      })}
    </div>
  );
};

export default WorkspaceListView;
