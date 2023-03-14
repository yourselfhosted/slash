import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userService, workspaceService } from "../services";
import { useAppSelector } from "../store";
import useLoading from "../hooks/useLoading";
import Icon from "../components/Icon";
import WorkspaceListView from "../components/WorkspaceListView";
import CreateWorkspaceDialog from "../components/CreateWorkspaceDialog";

interface State {
  showCreateWorkspaceDialog: boolean;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { workspaceList } = useAppSelector((state) => state.workspace);
  const [state, setState] = useState<State>({
    showCreateWorkspaceDialog: false,
  });
  const loadingState = useLoading();

  useEffect(() => {
    if (!userService.getState().user) {
      navigate("/user/auth");
      return;
    }

    Promise.all([workspaceService.fetchWorkspaceList()]).finally(() => {
      const workspaceList = workspaceService.getState().workspaceList;
      if (workspaceList.length > 0) {
        navigate(`/${workspaceList[0].name}`);
        return;
      }
      loadingState.setFinish();
    });
  }, []);

  const handleCreateWorkspaceButtonClick = () => {
    setState({
      ...state,
      showCreateWorkspaceDialog: true,
    });
  };

  return (
    <>
      <div className="mx-auto max-w-4xl w-full px-3 py-6 flex flex-col justify-start items-start">
        <div className="mb-4 w-full flex flex-row justify-between items-center">
          <span className="font-mono text-gray-400">Workspace List</span>
        </div>
        {loadingState.isLoading ? (
          <div className="py-4 w-full flex flex-row justify-center items-center">
            <Icon.Loader className="mr-2 w-5 h-auto animate-spin" />
            loading
          </div>
        ) : workspaceList.length === 0 ? (
          <div className="w-full flex flex-col justify-center items-center">
            <Icon.Frown className="mt-8 w-16 h-auto text-gray-400" />
            <p className="mt-4 text-xl text-gray-600">Oops, no workspace.</p>
            <button
              className="mt-4 text-lg flex flex-row justify-start items-center border px-3 py-2 rounded-lg cursor-pointer hover:shadow"
              onClick={handleCreateWorkspaceButtonClick}
            >
              <Icon.Plus className="w-5 h-auto mr-1" /> Create Workspace
            </button>
          </div>
        ) : (
          <WorkspaceListView workspaceList={workspaceList} />
        )}
      </div>

      {state.showCreateWorkspaceDialog && (
        <CreateWorkspaceDialog
          onClose={() => {
            setState({
              ...state,
              showCreateWorkspaceDialog: false,
            });
          }}
          onConfirm={(workspace: Workspace) => {
            setState({
              ...state,
              showCreateWorkspaceDialog: false,
            });
            navigate(`/${workspace.name}`);
          }}
        />
      )}
    </>
  );
};

export default Home;
