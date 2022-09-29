import { useEffect, useState } from "react";
import { deleteWorkspaceUser, upsertWorkspaceUser } from "../helpers/api";
import useLoading from "../hooks/useLoading";
import { workspaceService } from "../services";
import toastHelper from "./Toast";
import Dropdown from "./common/Dropdown";
import { showCommonDialog } from "./Alert";
import Icon from "./Icon";

const userRoles = ["Admin", "User"];

interface Props {
  workspaceId: WorkspaceId;
  workspaceUser: WorkspaceUser;
  userList: WorkspaceUser[];
}

interface State {
  workspaceUserList: WorkspaceUser[];
}

const MemberListView: React.FC<Props> = (props: Props) => {
  const { workspaceId, workspaceUser: currentUser } = props;
  const [state, setState] = useState<State>({
    workspaceUserList: [],
  });
  const loadingState = useLoading();

  const fetchWorkspaceUserList = async () => {
    loadingState.setLoading();
    try {
      const [workspaceUserList] = await Promise.all([workspaceService.getWorkspaceUserList(workspaceId)]);
      setState({
        workspaceUserList: workspaceUserList,
      });
    } finally {
      loadingState.setFinish();
    }
  };

  useEffect(() => {
    fetchWorkspaceUserList();
  }, [props]);

  const handleWorkspaceUserRoleChange = async (workspaceUser: WorkspaceUser, role: Role) => {
    if (workspaceUser.userId === currentUser.userId) {
      toastHelper.error("Cannot change yourself.");
      return;
    }

    await upsertWorkspaceUser({
      workspaceId: workspaceId,
      userId: workspaceUser.userId,
      role,
    });
    await fetchWorkspaceUserList();
  };

  const handleDeleteWorkspaceUserButtonClick = (workspaceUser: WorkspaceUser) => {
    showCommonDialog({
      title: "Delete Workspace Member",
      content: `Are you sure to delete member \`${workspaceUser.user.name}\` in this workspace?`,
      style: "warning",
      onConfirm: async () => {
        await deleteWorkspaceUser({
          workspaceId: workspaceId,
          userId: workspaceUser.userId,
        });
        await fetchWorkspaceUserList();
      },
    });
  };

  return (
    <div className="w-full flex flex-col justify-start items-start">
      {loadingState.isLoading ? (
        <></>
      ) : (
        state.workspaceUserList.map((workspaceUser) => {
          return (
            <div key={workspaceUser.userId} className="w-full flex flex-row justify-between items-start border px-6 py-4 mb-3 rounded-lg">
              <div className="flex flex-row justify-start items-center mr-4">
                <span>{workspaceUser.user.name}</span>
                {currentUser.userId === workspaceUser.userId && <span className="ml-2 text-gray-400">(yourself)</span>}
              </div>
              <div className="flex flex-row justify-end items-center">
                {currentUser.role === "ADMIN" ? (
                  <>
                    <Dropdown
                      className="mr-4"
                      trigger={
                        <button className="flex flex-row justify-end items-center cursor-pointer">
                          <span className="font-mono">{workspaceUser.role}</span>
                          <Icon.ChevronDown className="ml-1 w-5 h-auto text-gray-600" />
                        </button>
                      }
                      actions={
                        <>
                          {userRoles.map((role) => {
                            return (
                              <button
                                key={role}
                                className="w-full px-3 leading-10 flex flex-row justify-between items-center text-left cursor-pointer rounded whitespace-nowrap hover:bg-gray-100"
                                onClick={() => handleWorkspaceUserRoleChange(workspaceUser, role.toUpperCase() as Role)}
                              >
                                <span className="truncate">{role}</span>
                                {workspaceUser.role === role.toLocaleUpperCase() && <Icon.Check className="w-4 h-auto ml-1 shrink-0" />}
                              </button>
                            );
                          })}
                        </>
                      }
                      actionsClassName="!w-28 !-left-4"
                    ></Dropdown>
                    <Dropdown
                      actions={
                        <>
                          <button
                            className="w-full px-3 text-left leading-10 cursor-pointer rounded text-red-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
                            onClick={() => {
                              handleDeleteWorkspaceUserButtonClick(workspaceUser);
                            }}
                          >
                            Delete
                          </button>
                        </>
                      }
                      actionsClassName="!w-24"
                    ></Dropdown>
                  </>
                ) : (
                  <>
                    <span className="font-mono">{workspaceUser.role}</span>
                  </>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default MemberListView;
