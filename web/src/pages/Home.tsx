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
      {loadingState.isLoading ? null : (
        <div className="mx-auto max-w-4xl w-full px-3 py-6 flex flex-col justify-start items-start">
          <p className="font-mono mb-2 text-gray-400">Workspace List</p>
          <WorkspaceListView workspaceList={workspaceList} />
          <div
            className="flex flex-row justify-start items-center border px-3 py-3 rounded-lg cursor-pointer"
            onClick={() => showCreateWorkspaceDialog()}
          >
            <Icon.Plus className="w-5 h-auto mr-1" /> Create Workspace
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
