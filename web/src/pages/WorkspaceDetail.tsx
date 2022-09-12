import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  const navigate = useNavigate();
  const params = useParams();
  const { shortcutList } = useAppSelector((state) => state.shortcut);
  const [state, setState] = useState<State>({
    workspace: unknownWorkspace,
  });
  const loadingState = useLoading();

  useEffect(() => {
    const workspace = workspaceService.getWorkspaceById(Number(params.workspaceId));
    if (!workspace) {
      toastHelper.error("workspace not found");
      return;
    }

    setState({
      ...state,
      workspace,
    });
    Promise.all([shortcutService.fetchWorkspaceShortcuts(workspace.id)]).finally(() => {
      loadingState.setFinish();
    });
  }, []);

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="w-full h-full flex flex-col justify-start items-start">
      <Header />
      {loadingState.isLoading ? null : (
        <div className="mx-auto max-w-4xl w-full px-3 py-6 flex flex-col justify-start items-start">
          <div className="w-full flex flex-row justify-start items-center mb-4">
            <div
              className="flex flex-row justify-start items-center text-gray-600 border rounded-md px-2 py-1 cursor-pointer"
              onClick={() => handleBackToHome()}
            >
              <Icon.ChevronLeft className="w-5 h-auto" /> Back to Home
            </div>
            <span className="ml-4 font-mono text-gray-600">Workspace: {state?.workspace.name}</span>
          </div>
          <p className="font-mono mb-2 text-gray-400">Shortcut List</p>
          <ShortcutListView workspaceId={state.workspace.id} shortcutList={shortcutList} />
          <div
            className="flex flex-row justify-start items-center border px-3 py-3 rounded-lg cursor-pointer"
            onClick={() => showCreateShortcutDialog(state.workspace.id)}
          >
            <Icon.Plus className="w-5 h-auto mr-1" /> Create Shortcut
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceDetail;
