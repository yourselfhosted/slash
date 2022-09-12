import { useNavigate } from "react-router-dom";

interface Props {
  workspaceList: Workspace[];
}

const WorkspaceListView: React.FC<Props> = (props: Props) => {
  const { workspaceList } = props;
  const navigate = useNavigate();

  const gotoWorkspaceDetailPage = (workspace: Workspace) => {
    navigate(`/workspace/${workspace.id}`);
  };

  return (
    <div className="w-full flex flex-col justify-start items-start">
      {workspaceList.map((workspace) => {
        return (
          <div key={workspace.id} className="w-full flex flex-col justify-start items-start border px-6 py-4 mb-2 rounded-lg">
            <span className="text-xl font-medium" onClick={() => gotoWorkspaceDetailPage(workspace)}>
              {workspace.name}
            </span>
            <span className="text-base text-gray-600">{workspace.description}</span>
          </div>
        );
      })}
    </div>
  );
};

export default WorkspaceListView;
