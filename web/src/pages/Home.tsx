import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userService, workspaceService } from "../services";
import { useAppSelector } from "../store";
import useLoading from "../hooks/useLoading";
import Icon from "../components/Icon";
import Header from "../components/Header";
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
      <div className="w-full h-full flex flex-col justify-start items-start">
        <Header />
        <div className="mx-auto max-w-4xl w-full px-3 py-6 flex flex-col justify-start items-start">
          <div className="mb-4 w-full flex flex-row justify-between items-center">
            <span className="font-mono text-gray-400">Workspace List</span>
            <button
              className="text-sm flex flex-row justify-start items-center border px-3 leading-10 rounded-lg cursor-pointer hover:shadow"
              onClick={handleCreateWorkspaceButtonClick}
            >
              <Icon.Plus className="w-5 h-auto mr-1" /> Create Workspace
            </button>
          </div>
          {loadingState.isLoading ? (
            <div className="py-4 w-full flex flex-row justify-center items-center">
              <Icon.Loader className="mr-2 w-5 h-auto animate-spin" />
              loading
            </div>
          ) : (
            <WorkspaceListView workspaceList={workspaceList} />
          )}
        </div>
      </div>

      {state.showCreateWorkspaceDialog && (
        <CreateWorkspaceDialog
          onClose={() => {
            setState({
              ...state,
              showCreateWorkspaceDialog: false,
            });
          }}
        />
      )}
    </>
  );
};

export default Home;
