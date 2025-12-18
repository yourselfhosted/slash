import copy from "copy-to-clipboard";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { showCommonDialog } from "@/components/Alert";
import CreateAccessTokenDialog from "@/components/CreateAccessTokenDialog";
import Icon from "@/components/Icon";
import { Button } from "@/components/ui/button";
import { userServiceClient } from "@/grpcweb";
import { useUserStore } from "@/stores";
import { UserAccessToken } from "@/types/proto/api/v1/user_service";

const listAccessTokens = async (userId: number) => {
  const { accessTokens } = await userServiceClient.listUserAccessTokens({
    id: userId,
  });
  return accessTokens;
};

const AccessTokenSection = () => {
  const { t } = useTranslation();
  const currentUser = useUserStore().getCurrentUser();
  const [userAccessTokens, setUserAccessTokens] = useState<UserAccessToken[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState<boolean>(false);

  useEffect(() => {
    listAccessTokens(currentUser.id).then((accessTokens) => {
      setUserAccessTokens(accessTokens);
    });
  }, []);

  const handleCreateAccessTokenDialogConfirm = async () => {
    const accessTokens = await listAccessTokens(currentUser.id);
    setUserAccessTokens(accessTokens);
  };

  const copyAccessToken = (accessToken: string) => {
    copy(accessToken);
    toast.success("Access token copied to clipboard");
  };

  const handleDeleteAccessToken = async (accessToken: string) => {
    showCommonDialog({
      title: "Delete Access Token",
      content: `Are you sure to delete access token \`${getFormatedAccessToken(accessToken)}\`? You cannot undo this action.`,
      style: "danger",
      onConfirm: async () => {
        await userServiceClient.deleteUserAccessToken({
          id: currentUser.id,
          accessToken: accessToken,
        });
        setUserAccessTokens(userAccessTokens.filter((token) => token.accessToken !== accessToken));
      },
    });
  };

  const getFormatedAccessToken = (accessToken: string) => {
    return `${accessToken.slice(0, 4)}****${accessToken.slice(-4)}`;
  };

  return (
    <>
      <div className="w-full flex flex-col justify-start items-start space-y-4">
        <div className="w-full">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <p className="text-2xl shrink-0 font-semibold text-gray-900 dark:text-gray-500">Access Tokens</p>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-600">A list of all access tokens for your account.</p>
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
              <Button
                variant="outlined"
                color="neutral"
                onClick={() => {
                  setShowCreateDialog(true);
                }}
              >
                {t("common.create")}
              </Button>
            </div>
          </div>
          <div className="mt-2 flow-root">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full py-2 align-middle">
                <table className="min-w-full divide-y divide-gray-300 dark:divide-zinc-700">
                  <thead>
                    <tr>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-500">
                        Token
                      </th>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-500">
                        Description
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-500">
                        Created At
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-500">
                        Expires At
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4">
                        <span className="sr-only">{t("common.delete")}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                    {userAccessTokens.map((userAccessToken) => (
                      <tr key={userAccessToken.accessToken}>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 flex flex-row justify-start items-center gap-x-1 dark:text-gray-500">
                          <span className="font-mono">{getFormatedAccessToken(userAccessToken.accessToken)}</span>
                          <Button color="neutral" variant="plain" size="sm" onClick={() => copyAccessToken(userAccessToken.accessToken)}>
                            <Icon.Clipboard className="w-4 h-auto text-gray-500" />
                          </Button>
                        </td>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 dark:text-gray-500">
                          {userAccessToken.description}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{userAccessToken.issuedAt?.toLocaleString()}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {userAccessToken.expiresAt?.toLocaleString() ?? "Never"}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm">
                          <Button
                            color="danger"
                            variant="plain"
                            size="sm"
                            onClick={() => {
                              handleDeleteAccessToken(userAccessToken.accessToken);
                            }}
                          >
                            <Icon.Trash className="w-4 h-auto" />
                          </Button>
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

      {showCreateDialog && (
        <CreateAccessTokenDialog onClose={() => setShowCreateDialog(false)} onConfirm={handleCreateAccessTokenDialogConfirm} />
      )}
    </>
  );
};

export default AccessTokenSection;
