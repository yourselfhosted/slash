import { Button, IconButton } from "@mui/joy";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { workspaceServiceClient } from "@/grpcweb";
import { useWorkspaceStore } from "@/stores";
import { FeatureType } from "@/stores/workspace";
import { IdentityProvider } from "@/types/proto/api/v1/workspace_service";
import CreateIdentityProviderDrawer from "../CreateIdentityProviderDrawer";
import FeatureBadge from "../FeatureBadge";
import Icon from "../Icon";

interface EditState {
  open: boolean;
  // Leave empty to create new identity provider.
  identityProvider: IdentityProvider | undefined;
}

const SSOSection = () => {
  const { t } = useTranslation();
  const workspaceStore = useWorkspaceStore();
  const [identityProviderList, setIdentityProviderList] = useState<IdentityProvider[]>([]);
  const [editState, setEditState] = useState<EditState>({ open: false, identityProvider: undefined });
  const isSSOFeatureEnabled = workspaceStore.checkFeatureAvailable(FeatureType.SSO);

  useEffect(() => {
    fetchIdentityProviderList();
  }, []);

  const fetchIdentityProviderList = async () => {
    const setting = workspaceStore.fetchWorkspaceSetting();
    setIdentityProviderList((await setting).identityProviders);
  };

  const handleDeleteIdentityProvider = async (identityProvider: IdentityProvider) => {
    const confirmed = window.confirm(`Are you sure you want to delete ${identityProvider.title}?`);
    if (confirmed) {
      try {
        await workspaceServiceClient.updateWorkspaceSetting({
          setting: {
            identityProviders: identityProviderList.filter((idp) => idp.id !== identityProvider.id),
          },
          updateMask: ["identity_providers"],
        });
      } catch (error: any) {
        console.error(error);
        toast.error(error.details);
      }
      await fetchIdentityProviderList();
    }
  };

  return (
    <>
      <div className="w-full flex flex-col gap-2 pt-2 pb-4">
        <div className="w-full flex flex-row justify-between items-center gap-1">
          <div className="flex flex-row justify-start items-center">
            <span className="font-medium dark:text-gray-400">SSO</span>
            <FeatureBadge className="w-5 h-auto ml-1 text-blue-600" feature={FeatureType.SSO} />
            <a
              className="text-blue-600 text-sm hover:underline flex flex-row justify-center items-center ml-2"
              href="https://github.com/yourselfhosted/slash/blob/main/docs/getting-started/sso.md"
              target="_blank"
            >
              <span>Learn more</span>
              <Icon.ExternalLink className="ml-1 w-4 h-auto inline" />
            </a>
          </div>
          <Button
            variant="outlined"
            color="neutral"
            disabled={!isSSOFeatureEnabled}
            onClick={() =>
              setEditState({
                open: true,
                identityProvider: undefined,
              })
            }
          >
            {t("common.create")}
          </Button>
        </div>
        {identityProviderList.length > 0 && (
          <div className="mt-2 flow-root">
            <div className="overflow-x-auto">
              <div className="inline-block border rounded-lg border-gray-300 dark:border-zinc-700 min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-300 dark:divide-zinc-700">
                  <thead>
                    <tr>
                      <th scope="col" className="py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-500">
                        ID
                      </th>
                      <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900 dark:text-gray-500">
                        Title
                      </th>
                      <th scope="col" className="relative py-2 pl-3 pr-4">
                        <span className="sr-only">{t("common.edit")}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                    {identityProviderList.map((identityProvider) => (
                      <tr key={identityProvider.id}>
                        <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm text-gray-900 dark:text-gray-500">{identityProvider.id}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">{identityProvider.title}</td>
                        <td className="relative whitespace-nowrap py-2 pl-3 pr-4 text-right text-sm">
                          <IconButton
                            size="sm"
                            variant="plain"
                            onClick={() =>
                              setEditState({
                                open: true,
                                identityProvider: identityProvider,
                              })
                            }
                          >
                            <Icon.PenBox className="w-4 h-auto" />
                          </IconButton>
                          <IconButton
                            size="sm"
                            color="danger"
                            variant="plain"
                            onClick={() => handleDeleteIdentityProvider(identityProvider)}
                          >
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
        )}
      </div>

      {editState.open && (
        <CreateIdentityProviderDrawer
          identityProvider={editState.identityProvider}
          onClose={() => setEditState({ open: false, identityProvider: undefined })}
          onConfirm={() => {
            setEditState({ open: false, identityProvider: undefined });
            fetchIdentityProviderList();
          }}
        />
      )}
    </>
  );
};

export default SSOSection;
