import { Button, IconButton } from "@mui/joy";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { showCommonDialog } from "@/components/Alert";
import CreateUserDialog from "@/components/CreateUserDialog";
import Icon from "@/components/Icon";
import { useUserStore } from "@/stores";
import { User } from "@/types/proto/api/v1/user_service";
import { convertRoleFromPb } from "@/utils/user";

const WorkspaceMembersSection = () => {
  const { t } = useTranslation();
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
          toast.error(`Failed to delete user \`${user.nickname}\`: ${error.details}`);
        }
      },
    });
  };

  return (
    <>
      <div className="w-full flex flex-col sm:flex-row justify-start items-start gap-4 sm:gap-x-16">
        <p className="sm:w-1/4 text-2xl shrink-0 font-semibold text-gray-900 dark:text-gray-500">Members</p>
        <div className="w-full sm:w-auto grow flex flex-col justify-start items-start gap-4">
          <div className="w-full flex justify-end">
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => {
                setShowCreateUserDialog(true);
                setCurrentEditingUser(undefined);
              }}
            >
              {t("user.action.add-user")}
            </Button>
          </div>
          <div className="w-full flow-root">
            <div className="overflow-x-auto">
              <div className="inline-block border rounded-lg border-gray-300 dark:border-zinc-700 min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-300 dark:divide-zinc-700">
                  <thead>
                    <tr>
                      <th scope="col" className="py-3 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-500">
                        {t("user.nickname")}
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-500">
                        {t("user.email")}
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-500">
                        {t("user.role")}
                      </th>
                      <th scope="col" className="relative py-3 pl-3 pr-4">
                        <span className="sr-only">{t("common.edit")}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                    {userList.map((user) => (
                      <tr key={user.email}>
                        <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm text-gray-900 dark:text-gray-500">{user.nickname}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">{user.email}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">{convertRoleFromPb(user.role)}</td>
                        <td className="relative whitespace-nowrap py-2 pl-3 pr-4 text-right text-sm">
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

export default WorkspaceMembersSection;
