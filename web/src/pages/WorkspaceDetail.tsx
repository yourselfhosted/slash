import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate, useParams } from "react-router-dom";
import { shortcutService, userService } from "../services";
import { useAppSelector } from "../store";
import { unknownWorkspace, unknownWorkspaceUser } from "../store/modules/workspace";
import useLoading from "../hooks/useLoading";
import Icon from "../components/Icon";
import toastHelper from "../components/Toast";
import Dropdown from "../components/common/Dropdown";
import ShortcutListView from "../components/ShortcutListView";
import MemberListView from "../components/MemberListView";
import WorkspaceSetting from "../components/WorkspaceSetting";
import CreateShortcutDialog from "../components/CreateShortcutDialog";
import UpsertWorkspaceUserDialog from "../components/UpsertWorkspaceUserDialog";

interface State {
  showCreateShortcutDialog: boolean;
  showUpsertWorkspaceUserDialog: boolean;
}

const WorkspaceDetail: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const user = useAppSelector((state) => state.user.user) as User;
  const { workspaceList } = useAppSelector((state) => state.workspace);
  const { shortcutList } = useAppSelector((state) => state.shortcut);
  const [state, setState] = useState<State>({
    showCreateShortcutDialog: false,
    showUpsertWorkspaceUserDialog: false,
  });
  const loadingState = useLoading();
  const workspace = workspaceList.find((workspace) => workspace.name === params.workspaceName) ?? unknownWorkspace;
  const workspaceUser = workspace.workspaceUserList.find((workspaceUser) => workspaceUser.userId === user.id) ?? unknownWorkspaceUser;

  useEffect(() => {
    if (!userService.getState().user) {
      navigate("/user/auth");
      return;
    }

    if (!workspace) {
      toastHelper.error("workspace not found");
      return;
    }

    Promise.all([shortcutService.fetchWorkspaceShortcuts(workspace.id)]).finally(() => {
      loadingState.setFinish();
    });
  }, [params.workspaceName]);

  useEffect(() => {
    if (location.hash !== "#shortcuts" && location.hash !== "#members" && location.hash !== "#setting") {
      navigate("#shortcuts");
    }
  }, [location.hash]);

  const handleCreateShortcutButtonClick = () => {
    setState({
      ...state,
      showCreateShortcutDialog: true,
    });
  };

  const handleUpsertWorkspaceMemberButtonClick = () => {
    setState({
      ...state,
      showUpsertWorkspaceUserDialog: true,
    });
  };

  return (
    <>
      <div className="mx-auto max-w-4xl w-full px-3 pb-6 flex flex-col justify-start items-start">
        <div className="w-full flex flex-row justify-between items-center mt-4 mb-4">
          <div className="flex flex-row justify-start items-center space-x-3 sm:space-x-4">
            <NavLink
              to="#shortcuts"
              className={`py-1 text-gray-400 border-b-2 border-b-transparent ${
                location.hash === "#shortcuts" && "!border-b-black text-black"
              }`}
            >
              Shortcuts
            </NavLink>
            <NavLink
              to="#members"
              className={`py-1 text-gray-400 border-b-2 border-b-transparent ${
                location.hash === "#members" && "!border-b-black text-black"
              }`}
            >
              Members
            </NavLink>
            <NavLink
              to="#setting"
              className={`py-1 text-gray-400 border-b-2 border-b-transparent ${
                location.hash === "#setting" && "!border-b-black text-black"
              }`}
            >
              Setting
            </NavLink>
          </div>
          <div>
            <Dropdown
              trigger={
                <button className="w-32 flex flex-row justify-start items-center border px-3 leading-10 rounded-lg cursor-pointer hover:shadow">
                  <Icon.Plus className="w-4 h-auto mr-1" /> Add new...
                </button>
              }
              actions={
                <>
                  <button
                    className="w-full flex flex-row justify-start items-center px-3 leading-10 rounded cursor-pointer hover:bg-gray-100"
                    onClick={handleCreateShortcutButtonClick}
                  >
                    Shortcut
                  </button>
                  {workspaceUser.role === "ADMIN" && (
                    <button
                      className="w-full flex flex-row justify-start items-center px-3 leading-10 rounded cursor-pointer hover:bg-gray-100"
                      onClick={handleUpsertWorkspaceMemberButtonClick}
                    >
                      Member
                    </button>
                  )}
                </>
              }
              actionsClassName="!w-32"
            />
          </div>
        </div>
        {loadingState.isLoading ? (
          <div className="py-4 w-full flex flex-row justify-center items-center">
            <Icon.Loader className="mr-2 w-5 h-auto animate-spin" />
            loading
          </div>
        ) : (
          <>
            {location.hash === "#shortcuts" &&
              (shortcutList.length === 0 ? (
                <div className="w-full flex flex-col justify-center items-center">
                  <Icon.Frown className="mt-8 w-16 h-auto text-gray-400" />
                  <p className="mt-4 text-xl text-gray-600">Oops, no shortcut.</p>
                  <button
                    className="mt-4 text-lg flex flex-row justify-start items-center border px-3 py-2 rounded-lg cursor-pointer hover:shadow"
                    onClick={handleCreateShortcutButtonClick}
                  >
                    <Icon.Plus className="w-5 h-auto mr-1" /> Create Shortcut
                  </button>
                </div>
              ) : (
                <ShortcutListView workspaceId={workspace.id} shortcutList={shortcutList} />
              ))}
            {location.hash === "#members" && <MemberListView workspaceId={workspace.id} />}
            {location.hash === "#setting" && <WorkspaceSetting workspaceId={workspace.id} />}
          </>
        )}
      </div>

      {state.showCreateShortcutDialog && (
        <CreateShortcutDialog
          workspaceId={workspace.id}
          onClose={() => {
            setState({
              ...state,
              showCreateShortcutDialog: false,
            });
          }}
          onConfirm={() => {
            setState({
              ...state,
              showCreateShortcutDialog: false,
            });
            if (location.hash !== "#shortcuts") {
              navigate("#shortcuts");
            }
          }}
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

export default WorkspaceDetail;
