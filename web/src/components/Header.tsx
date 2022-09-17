import { Link, useNavigate, useParams } from "react-router-dom";
import { useAppSelector } from "../store";
import { userService } from "../services";
import Icon from "./Icon";
import Dropdown from "./common/Dropdown";
import Only from "./common/OnlyWhen";
import showCreateWorkspaceDialog from "./CreateWorkspaceDialog";

const Header: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.user);
  const { workspaceList } = useAppSelector((state) => state.workspace);
  const activedWorkspace = workspaceList.find((workspace) => workspace.name === params.workspaceName ?? "");

  const handleSignOutButtonClick = async () => {
    await userService.doSignOut();
    navigate("/user/auth");
  };

  return (
    <div className="w-full bg-amber-50">
      <div className="w-full max-w-4xl mx-auto px-3 py-4 flex flex-row justify-between items-center">
        <div className="flex flex-row justify-start items-center">
          <Link to={"/"} className="text-base font-mono font-medium cursor-pointer">
            Corgi
          </Link>
          <Only when={workspaceList.length > 0 && activedWorkspace !== undefined}>
            <>
              <span className="font-mono mx-2 text-gray-200">/</span>
              <Dropdown
                trigger={
                  <button className="flex flex-row justify-end items-center cursor-pointer">
                    <span className="font-mono">{activedWorkspace?.name}</span>
                    <Icon.ChevronDown className="ml-1 w-5 h-auto text-gray-600" />
                  </button>
                }
                actions={
                  <>
                    {workspaceList.map((workspace) => {
                      return (
                        <Link
                          key={workspace.id}
                          to={`/${workspace.name}`}
                          className="w-full px-3 leading-10 flex flex-row justify-between items-center text-left cursor-pointer rounded whitespace-nowrap hover:bg-gray-100"
                        >
                          <span className="truncate">{workspace.name}</span>
                          <Only when={workspace.name === activedWorkspace?.name}>
                            <Icon.Check className="w-4 h-auto ml-1 shrink-0" />
                          </Only>
                        </Link>
                      );
                    })}
                    <hr className="w-full border-t my-1 border-t-gray-100" />
                    <button
                      className="w-full flex flex-row justify-start items-center px-3 leading-10 rounded cursor-pointer hover:bg-gray-100"
                      onClick={() => showCreateWorkspaceDialog()}
                    >
                      <Icon.Plus className="w-4 h-auto mr-1" /> Create Workspace
                    </button>
                  </>
                }
                actionsClassName="!w-48 !-left-4"
              ></Dropdown>
            </>
          </Only>
        </div>
        <div className="relative">
          {user ? (
            <Dropdown
              trigger={
                <button className="flex flex-row justify-end items-center cursor-pointer">
                  <span>{user?.name}</span>
                  <Icon.ChevronDown className="ml-1 w-5 h-auto text-gray-600" />
                </button>
              }
              actions={
                <>
                  <Link
                    to={`/user/${user?.id}`}
                    className="w-full flex flex-row justify-start items-center px-3 leading-10 text-left cursor-pointer rounded whitespace-nowrap hover:bg-gray-100"
                  >
                    <Icon.User className="w-4 h-auto mr-1" /> My Account
                  </Link>
                  <button
                    className="w-full flex flex-row justify-start items-center px-3 leading-10 text-left cursor-pointer rounded whitespace-nowrap hover:bg-gray-100"
                    onClick={() => handleSignOutButtonClick()}
                  >
                    <Icon.LogOut className="w-4 h-auto mr-1" /> Sign out
                  </button>
                </>
              }
              actionsClassName="!w-40"
            ></Dropdown>
          ) : (
            <span className="cursor-pointer" onClick={() => navigate("/user/auth")}>
              Sign in
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
