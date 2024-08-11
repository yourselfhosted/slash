import { Button, DialogActions, DialogContent, DialogTitle, Divider, Drawer, Input, ModalClose } from "@mui/joy";
import { isUndefined } from "lodash-es";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { workspaceServiceClient } from "@/grpcweb";
import { absolutifyLink } from "@/helpers/utils";
import useLoading from "@/hooks/useLoading";
import { useWorkspaceStore } from "@/stores";
import { IdentityProvider, IdentityProvider_Type, IdentityProviderConfig_OAuth2Config } from "@/types/proto/api/v1/workspace_service";

interface Props {
  identityProvider?: IdentityProvider;
  onClose: () => void;
  onConfirm?: () => void;
}

interface State {
  identityProviderCreate: IdentityProvider;
}

const CreateIdentityProviderDrawer: React.FC<Props> = (props: Props) => {
  const { onClose, onConfirm, identityProvider } = props;
  const { t } = useTranslation();
  const workspaceStore = useWorkspaceStore();
  const [state, setState] = useState<State>({
    identityProviderCreate: IdentityProvider.fromPartial(
      identityProvider || {
        type: IdentityProvider_Type.OAUTH2,
        config: {
          oauth2: IdentityProviderConfig_OAuth2Config.fromPartial({
            scopes: [],
            fieldMapping: {},
          }),
        },
      },
    ),
  });
  const isCreating = isUndefined(identityProvider);
  const requestState = useLoading(false);

  const setPartialState = (partialState: Partial<State>) => {
    setState({
      ...state,
      ...partialState,
    });
  };

  const handleNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPartialState({
      identityProviderCreate: Object.assign(state.identityProviderCreate, {
        name: e.target.value,
      }),
    });
  };

  const handleTitleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPartialState({
      identityProviderCreate: Object.assign(state.identityProviderCreate, {
        title: e.target.value,
      }),
    });
  };

  const handleOAuth2ConfigChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (!state.identityProviderCreate.config || !state.identityProviderCreate.config.oauth2) {
      return;
    }

    const value = field === "scopes" ? e.target.value.split(" ") : e.target.value;
    setPartialState({
      identityProviderCreate: Object.assign(state.identityProviderCreate, {
        config: Object.assign(state.identityProviderCreate.config, {
          oauth2: Object.assign(state.identityProviderCreate.config.oauth2, {
            [field]: value,
          }),
        }),
      }),
    });
  };

  const handleFieldMappingChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (
      !state.identityProviderCreate.config ||
      !state.identityProviderCreate.config.oauth2 ||
      !state.identityProviderCreate.config.oauth2.fieldMapping
    ) {
      return;
    }

    setPartialState({
      identityProviderCreate: Object.assign(state.identityProviderCreate, {
        config: Object.assign(state.identityProviderCreate.config, {
          oauth2: Object.assign(state.identityProviderCreate.config.oauth2, {
            fieldMapping: Object.assign(state.identityProviderCreate.config.oauth2.fieldMapping, {
              [field]: e.target.value,
            }),
          }),
        }),
      }),
    });
  };

  const onSave = async () => {
    if (!state.identityProviderCreate.name || !state.identityProviderCreate.title) {
      toast.error("Please fill in required fields.");
      return;
    }

    try {
      if (!isCreating) {
        await workspaceServiceClient.updateWorkspaceSetting({
          setting: {
            identityProviders: workspaceStore.setting.identityProviders.map((idp) =>
              idp.name === state.identityProviderCreate.name ? state.identityProviderCreate : idp,
            ),
          },
          updateMask: ["identity_providers"],
        });
      } else {
        await workspaceServiceClient.updateWorkspaceSetting({
          setting: {
            identityProviders: [...workspaceStore.setting.identityProviders, state.identityProviderCreate],
          },
          updateMask: ["identity_providers"],
        });
      }

      if (onConfirm) {
        onConfirm();
      } else {
        onClose();
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.details);
    }
  };

  return (
    <Drawer anchor="right" open={true} onClose={onClose}>
      <DialogTitle>{isCreating ? "Create Identity Provider" : "Edit Identity Provider"}</DialogTitle>
      <ModalClose />
      <DialogContent className="w-full max-w-full">
        <div className="overflow-y-auto w-full mt-2 px-4 pb-4 sm:w-[24rem]">
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">
              Name <span className="text-red-600">*</span>
            </span>
            <Input
              className="w-full"
              type="text"
              placeholder="The unique name of your identity provider"
              value={state.identityProviderCreate.name}
              onChange={handleNameInputChange}
            />
          </div>
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">
              Title <span className="text-red-600">*</span>
            </span>
            <div className="relative w-full">
              <Input
                className="w-full"
                type="text"
                placeholder="A short title will be displayed in the UI"
                value={state.identityProviderCreate.title}
                onChange={handleTitleInputChange}
              />
            </div>
          </div>
          {isCreating && (
            <p className="border rounded-md p-2 text-sm w-full mb-2 break-all">Redirect URL: {absolutifyLink("/auth/callback")}</p>
          )}
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">
              Client ID <span className="text-red-600">*</span>
            </span>
            <div className="relative w-full">
              <Input
                className="w-full"
                type="text"
                placeholder="Client ID of the OAuth2 provider"
                value={state.identityProviderCreate.config?.oauth2?.clientId}
                onChange={(e) => handleOAuth2ConfigChange(e, "clientId")}
              />
            </div>
          </div>
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">
              Client Secret <span className="text-red-600">*</span>
            </span>
            <div className="relative w-full">
              <Input
                className="w-full"
                type="text"
                placeholder="Client Secret of the OAuth2 provider"
                value={state.identityProviderCreate.config?.oauth2?.clientSecret}
                onChange={(e) => handleOAuth2ConfigChange(e, "clientSecret")}
              />
            </div>
          </div>
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">
              Authorization endpoint <span className="text-red-600">*</span>
            </span>
            <div className="relative w-full">
              <Input
                className="w-full"
                type="text"
                placeholder="Authorization endpoint of the OAuth2 provider"
                value={state.identityProviderCreate.config?.oauth2?.authUrl}
                onChange={(e) => handleOAuth2ConfigChange(e, "authUrl")}
              />
            </div>
          </div>
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">
              Token endpoint <span className="text-red-600">*</span>
            </span>
            <div className="relative w-full">
              <Input
                className="w-full"
                type="text"
                placeholder="Token endpoint of the OAuth2 provider"
                value={state.identityProviderCreate.config?.oauth2?.tokenUrl}
                onChange={(e) => handleOAuth2ConfigChange(e, "tokenUrl")}
              />
            </div>
          </div>
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">
              User endpoint <span className="text-red-600">*</span>
            </span>
            <div className="relative w-full">
              <Input
                className="w-full"
                type="text"
                placeholder="User endpoint of the OAuth2 provider"
                value={state.identityProviderCreate.config?.oauth2?.userInfoUrl}
                onChange={(e) => handleOAuth2ConfigChange(e, "userInfoUrl")}
              />
            </div>
          </div>
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">
              Scopes <span className="text-red-600">*</span>
            </span>
            <div className="relative w-full">
              <Input
                className="w-full"
                type="text"
                placeholder="Scopes of the OAuth2 provider, separated by space"
                value={state.identityProviderCreate.config?.oauth2?.scopes.join(" ")}
                onChange={(e) => handleOAuth2ConfigChange(e, "scopes")}
              />
            </div>
          </div>
          <Divider className="!mb-3" />
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">
              Identifier <span className="text-red-600">*</span>
            </span>
            <div className="relative w-full">
              <Input
                className="w-full"
                type="text"
                placeholder="The field in the user info response to identify the user"
                value={state.identityProviderCreate.config?.oauth2?.fieldMapping?.identifier}
                onChange={(e) => handleFieldMappingChange(e, "identifier")}
              />
            </div>
          </div>
          <div className="w-full flex flex-col justify-start items-start">
            <span className="mb-2">Display name</span>
            <div className="relative w-full">
              <Input
                className="w-full"
                type="text"
                placeholder="The field in the user info response to display the user"
                value={state.identityProviderCreate.config?.oauth2?.fieldMapping?.displayName}
                onChange={(e) => handleFieldMappingChange(e, "displayName")}
              />
            </div>
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <div className="w-full flex flex-row justify-end items-center px-3 py-4 space-x-2">
          <Button color="neutral" variant="plain" disabled={requestState.isLoading} loading={requestState.isLoading} onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button color="primary" disabled={requestState.isLoading} loading={requestState.isLoading} onClick={onSave}>
            {t("common.save")}
          </Button>
        </div>
      </DialogActions>
    </Drawer>
  );
};

export default CreateIdentityProviderDrawer;
