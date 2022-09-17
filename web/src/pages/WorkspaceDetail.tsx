import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { shortcutService, workspaceService } from "../services";
import { useAppSelector } from "../store";
import useLoading from "../hooks/useLoading";
import Icon from "../components/Icon";
import toastHelper from "../components/Toast";
import Header from "../components/Header";
import ShortcutListView from "../components/ShortcutListView";
import { unknownWorkspace } from "../store/modules/workspace";
import showCreateShortcutDialog from "../components/CreateShortcutDialog";

interface State {
  workspace: Workspace;
}

const WorkspaceDetail: React.FC = () => {
  const params = useParams();
  const { shortcutList } = useAppSelector((state) => state.shortcut);
  const [state, setState] = useState<State>({
    workspace: unknownWorkspace,
  });
  const loadingState = useLoading();

  useEffect(() => {
    const workspace = workspaceService.getWorkspaceByName(params.workspaceName ?? "");
    if (!workspace) {
      toastHelper.error("workspace not found");
      return;
    }

    setState({
      ...state,
      workspace,
    });
    loadingState.setLoading();
    Promise.all([shortcutService.fetchWorkspaceShortcuts(workspace.id)]).finally(() => {
      loadingState.setFinish();
    });
  }, [params.workspaceName]);

  return (
    <div className="w-full h-full flex flex-col justify-start items-start">
      <Header />
      <div className="mx-auto max-w-4xl w-full px-3 py-6 flex flex-col justify-start items-start">
        <div className="w-full flex flex-row justify-between items-center mb-4">
          <span className="font-mono text-gray-400">Shortcut List</span>
          <button
            className="text-sm flex flex-row justify-start items-center border px-3 py-2 rounded-lg cursor-pointer hover:shadow"
            onClick={() => showCreateShortcutDialog(state.workspace.id)}
          >
            <Icon.Plus className="w-5 h-auto mr-1" /> Create Shortcut
          </button>
        </div>
        {loadingState.isLoading ? (
          <div className="py-4 w-full flex flex-row justify-center items-center">
            <Icon.Loader className="mr-2 w-5 h-auto animate-spin" />
            loading
          </div>
        ) : (
          <ShortcutListView workspaceId={state.workspace.id} shortcutList={shortcutList} />
        )}
      </div>
    </div>
  );
};

export default WorkspaceDetail;
