import { Button, IconButton } from "@mui/joy";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import useUserStore from "../../stores/v1/user";
import { showCommonDialog } from "../Alert";
import CreateUserDialog from "../CreateUserDialog";
import Icon from "../Icon";

const MemberSection = () => {
  const userStore = useUserStore();
  const [showCreateUserDialog, setShowCreateUserDialog] = useState<boolean>(false);
  const [currentEditingUser, setCurrentEditingUser] = useState<User | undefined>(undefined);
  const userList = Object.values(userStore.userMapById);

  useEffect(() => {
    userStore.fetchUserList();
  }, []);

  const handleCreateUserDialogClose = () => {
    setShowCreateUserDialog(false);
    setCurrentEditingUser(undefined);
  };

  const handleDeleteUser = async (user: User) => {
    showCommonDialog({
      title: "Delete User",
      content: `Are you sure to delete user \`${user.nickname}\`? You cannot undo this action.`,
      style: "danger",
      onConfirm: async () => {
        try {
          await userStore.deleteUser(user.id);
          toast.success(`User \`${user.nickname}\` deleted successfully`);
        } catch (error: any) {
          toast.error(`Failed to delete user \`${user.nickname}\`: ${error.response.data.message}`);
        }
      },
    });
  };

  return (
    <>
      <div className="w-full flex flex-col justify-start items-start space-y-4">
        <div className="w-full">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <p className="text-base font-semibold leading-6 text-gray-900">Users</p>
              <p className="mt-2 text-sm text-gray-700">
                A list of all the users in your workspace including their nickname, email and role.
              </p>
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
              <Button
                variant="outlined"
                color="neutral"
                onClick={() => {
                  setShowCreateUserDialog(true);
                  setCurrentEditingUser(undefined);
                }}
              >
                Add user
              </Button>
            </div>
          </div>
          <div className="mt-2 flow-root">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full py-2 align-middle">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                        Nickname
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Email
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Role
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4">
                        <span className="sr-only">Edit</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {userList.map((user) => (
                      <tr key={user.email}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">{user.nickname}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.email}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.role}</td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm">
                          <IconButton
                            size="sm"
                            variant="plain"
                            onClick={() => {
                              setCurrentEditingUser(user);
                              setShowCreateUserDialog(true);
                            }}
                          >
                            <Icon.PenBox className="w-4 h-auto" />
                          </IconButton>
                          <IconButton size="sm" color="danger" variant="plain" onClick={() => handleDeleteUser(user)}>
                            <Icon.Trash className="w-4 h-auto" />
                          </IconButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCreateUserDialog && <CreateUserDialog user={currentEditingUser} onClose={handleCreateUserDialogClose} />}
    </>
  );
};

export default MemberSection;
