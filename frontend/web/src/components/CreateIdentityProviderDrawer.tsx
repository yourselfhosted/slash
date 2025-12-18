import { isUndefined } from "lodash-es";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
        id: uuidv4(),
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
    if (!state.identityProviderCreate.id || !state.identityProviderCreate.title) {
      toast.error("Please fill in required fields.");
      return;
    }

    try {
      if (!isCreating) {
        await workspaceServiceClient.updateWorkspaceSetting({
          setting: {
            identityProviders: workspaceStore.setting.identityProviders.map((idp) =>
              idp.id === state.identityProviderCreate.id ? state.identityProviderCreate : idp,
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
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isCreating ? "Create Identity Provider" : "Edit Identity Provider"}</SheetTitle>
          <SheetDescription>
            {isCreating ? "Configure a new OAuth2 identity provider" : "Edit your identity provider settings"}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="A short title will be displayed in the UI"
              value={state.identityProviderCreate.title}
              onChange={handleTitleInputChange}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm font-medium">Identity provider information</p>
            {isCreating && (
              <div className="rounded-md py-2 px-3 bg-secondary text-sm w-full break-all">
                <span className="text-muted-foreground">Redirect URL</span>
                <br />
                <code className="text-xs">{absolutifyLink("/auth/callback")}</code>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-id">
              Client ID <span className="text-destructive">*</span>
            </Label>
            <Input
              id="client-id"
              type="text"
              placeholder="Client ID of the OAuth2 provider"
              value={state.identityProviderCreate.config?.oauth2?.clientId}
              onChange={(e) => handleOAuth2ConfigChange(e, "clientId")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-secret">
              Client Secret <span className="text-destructive">*</span>
            </Label>
            <Input
              id="client-secret"
              type="text"
              placeholder="Client Secret of the OAuth2 provider"
              value={state.identityProviderCreate.config?.oauth2?.clientSecret}
              onChange={(e) => handleOAuth2ConfigChange(e, "clientSecret")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="auth-url">
              Authorization endpoint <span className="text-destructive">*</span>
            </Label>
            <Input
              id="auth-url"
              type="text"
              placeholder="Authorization endpoint of the OAuth2 provider"
              value={state.identityProviderCreate.config?.oauth2?.authUrl}
              onChange={(e) => handleOAuth2ConfigChange(e, "authUrl")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="token-url">
              Token endpoint <span className="text-destructive">*</span>
            </Label>
            <Input
              id="token-url"
              type="text"
              placeholder="Token endpoint of the OAuth2 provider"
              value={state.identityProviderCreate.config?.oauth2?.tokenUrl}
              onChange={(e) => handleOAuth2ConfigChange(e, "tokenUrl")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-info-url">
              User endpoint <span className="text-destructive">*</span>
            </Label>
            <Input
              id="user-info-url"
              type="text"
              placeholder="User endpoint of the OAuth2 provider"
              value={state.identityProviderCreate.config?.oauth2?.userInfoUrl}
              onChange={(e) => handleOAuth2ConfigChange(e, "userInfoUrl")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scopes">
              Scopes <span className="text-destructive">*</span>
            </Label>
            <Input
              id="scopes"
              type="text"
              placeholder="Scopes of the OAuth2 provider, separated by space"
              value={state.identityProviderCreate.config?.oauth2?.scopes.join(" ")}
              onChange={(e) => handleOAuth2ConfigChange(e, "scopes")}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm font-medium">Field mapping</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="identifier">
              Identifier <span className="text-destructive">*</span>
            </Label>
            <Input
              id="identifier"
              type="text"
              placeholder="The field in the user info response to identify the user"
              value={state.identityProviderCreate.config?.oauth2?.fieldMapping?.identifier}
              onChange={(e) => handleFieldMappingChange(e, "identifier")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="display-name">Display name</Label>
            <Input
              id="display-name"
              type="text"
              placeholder="The field in the user info response to display the user"
              value={state.identityProviderCreate.config?.oauth2?.fieldMapping?.displayName}
              onChange={(e) => handleFieldMappingChange(e, "displayName")}
            />
          </div>
        </div>

        <SheetFooter className="mt-6">
          <Button variant="outline" disabled={requestState.isLoading} onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button disabled={requestState.isLoading} onClick={onSave}>
            {requestState.isLoading ? "Saving..." : t("common.save")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CreateIdentityProviderDrawer;
