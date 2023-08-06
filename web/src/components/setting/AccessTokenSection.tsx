import { Button } from "@mui/joy";
import axios from "axios";
import { useEffect, useState } from "react";
import useUserStore from "../../stores/v1/user";
import { ListUserAccessTokensResponse, UserAccessToken } from "../../types/proto/api/v2/user_service_pb";
import { showCommonDialog } from "../Alert";
import CreateAccessTokenDialog from "../CreateAccessTokenDialog";

const listAccessTokens = async (userId: number) => {
  const { data } = await axios.get<ListUserAccessTokensResponse>(`/api/v2/users/${userId}/access_tokens`);
  return data.accessTokens;
};

const AccessTokenSection = () => {
  const currentUser = useUserStore().getCurrentUser();
  const [userAccessTokens, setUserAccessTokens] = useState<UserAccessToken[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState<boolean>(false);

  useEffect(() => {
    listAccessTokens(currentUser.id).then((accessTokens) => {
      setUserAccessTokens(accessTokens);
    });
  }, []);

  const handleCreateAccessTokenDialogClose = async () => {
    const accessTokens = await listAccessTokens(currentUser.id);
    setUserAccessTokens(accessTokens);
  };

  const handleDeleteAccessToken = async (accessToken: string) => {
    showCommonDialog({
      title: "Delete Access Token",
      content: `Are you sure to delete access token \`${getFormatedAccessToken(accessToken)}\`? You cannot undo this action.`,
      style: "danger",
      onConfirm: async () => {
        await axios.delete(`/api/v2/users/${currentUser.id}/access_tokens/${accessToken}`);
        setUserAccessTokens(userAccessTokens.filter((token) => token.accessToken !== accessToken));
      },
    });
  };

  const getFormatedAccessToken = (accessToken: string) => {
    return `${accessToken.slice(0, 4)}****${accessToken.slice(-4)}`;
  };

  return (
    <>
      <div className="mx-auto max-w-6xl w-full px-3 md:px-12 py-6 flex flex-col justify-start items-start space-y-4">
        <div className="w-full">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <p className="text-base font-semibold leading-6 text-gray-900">Access Tokens</p>
              <p className="mt-2 text-sm text-gray-700">A list of all access tokens for your account.</p>
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
              <Button
                variant="outlined"
                color="neutral"
                onClick={() => {
                  setShowCreateDialog(true);
                }}
              >
                Create
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
                        Description
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Token
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Created At
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Expires At
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4">
                        <span className="sr-only">Delete</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {userAccessTokens.map((userAccessToken) => (
                      <tr key={userAccessToken.accessToken}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">{userAccessToken.description}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {getFormatedAccessToken(userAccessToken.accessToken)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{String(userAccessToken.issuedAt)}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{String(userAccessToken.expiresAt)}</td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                          <button
                            className="text-indigo-600 hover:text-indigo-900"
                            onClick={() => {
                              handleDeleteAccessToken(userAccessToken.accessToken);
                            }}
                          >
                            Delete
                          </button>
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
        <CreateAccessTokenDialog onClose={() => setShowCreateDialog(false)} onConfirm={handleCreateAccessTokenDialogClose} />
      )}
    </>
  );
};

export default AccessTokenSection;
