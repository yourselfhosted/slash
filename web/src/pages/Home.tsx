import { useEffect } from "react";
import { workspaceService } from "../services";
import { useAppSelector } from "../store";
import useLoading from "../hooks/useLoading";
import Icon from "../components/Icon";
import Header from "../components/Header";
import WorkspaceListView from "../components/WorkspaceListView";
import showCreateWorkspaceDialog from "../components/CreateWorkspaceDialog";

const Home: React.FC = () => {
  const { workspaceList } = useAppSelector((state) => state.workspace);
  const loadingState = useLoading();

  useEffect(() => {
    Promise.all([workspaceService.fetchWorkspaceList()]).finally(() => {
      loadingState.setFinish();
    });
  }, []);

  return (
    <div className="w-full h-full flex flex-col justify-start items-start">
      <Header />
      <div className="mx-auto max-w-4xl w-full px-3 py-6 flex flex-col justify-start items-start">
        <div className="mb-4 w-full flex flex-row justify-between items-center">
          <span className="font-mono text-gray-400">Workspace List</span>
          <div
            className="text-sm flex flex-row justify-start items-center border px-3 py-2 rounded-lg cursor-pointer hover:shadow"
            onClick={() => showCreateWorkspaceDialog()}
          >
            <Icon.Plus className="w-5 h-auto mr-1" /> Create Workspace
          </div>
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
  );
};

export default Home;
