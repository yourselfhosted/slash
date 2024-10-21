import { Button, Divider } from "@mui/joy";
import React from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import PasswordAuthForm from "@/components/PasswordAuthForm";
import { absolutifyLink } from "@/helpers/utils";
import { useWorkspaceStore } from "@/stores";
import { IdentityProvider, IdentityProvider_Type } from "@/types/proto/api/v1/workspace_service";

const SignIn: React.FC = () => {
  const { t } = useTranslation();
  const workspaceStore = useWorkspaceStore();

  const handleSignInWithIdentityProvider = async (identityProvider: IdentityProvider) => {
    const stateQueryParameter = identityProvider.id;
    if (identityProvider.type === IdentityProvider_Type.OAUTH2) {
      const redirectUri = absolutifyLink("/auth/callback");
      const oauth2Config = identityProvider.config?.oauth2;
      if (!oauth2Config) {
        toast.error("Identity provider configuration is invalid.");
        return;
      }
      const authUrl = `${oauth2Config.authUrl}?client_id=${
        oauth2Config.clientId
      }&redirect_uri=${redirectUri}&state=${stateQueryParameter}&response_type=code&scope=${encodeURIComponent(
        oauth2Config.scopes.join(" "),
      )}`;
      window.location.href = authUrl;
    }
  };

  return (
    <div className="flex flex-row justify-center items-center w-full h-auto pt-12 sm:pt-24 bg-white dark:bg-zinc-900">
      <div className="w-80 max-w-full h-full py-4 flex flex-col justify-start items-center">
        <div className="w-full py-4 grow flex flex-col justify-center items-center">
          <div className="flex flex-row justify-start items-center w-auto mx-auto gap-y-2 mb-4">
            <Logo className="mr-2" />
            <span className="text-3xl opacity-80 dark:text-gray-500">Slash</span>
          </div>
          {!workspaceStore.setting.disallowPasswordAuth ? (
            <PasswordAuthForm />
          ) : (
            <p className="w-full text-2xl mt-2 dark:text-gray-500">Password auth is not allowed.</p>
          )}
          {!workspaceStore.setting.disallowUserRegistration && !workspaceStore.setting.disallowPasswordAuth && (
            <p className="w-full mt-4 text-sm">
              <span className="dark:text-gray-500">{"Don't have an account yet?"}</span>
              <Link className="cursor-pointer ml-2 text-blue-600 hover:underline" to="/auth/signup" viewTransition>
                {t("auth.sign-up")}
              </Link>
            </p>
          )}
          {workspaceStore.setting.identityProviders.length > 0 && (
            <>
              <Divider className="!my-4">{t("common.or")}</Divider>
              <div className="w-full flex flex-col space-y-2">
                {workspaceStore.setting.identityProviders.map((identityProvider) => (
                  <Button
                    key={identityProvider.id}
                    variant="outlined"
                    color="neutral"
                    className="w-full"
                    size="md"
                    onClick={() => handleSignInWithIdentityProvider(identityProvider)}
                  >
                    {t("auth.sign-in-with", { provider: identityProvider.title })}
                  </Button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignIn;
