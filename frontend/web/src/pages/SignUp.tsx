import { Button, Input } from "@mui/joy";
import React, { FormEvent, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { authServiceClient } from "@/grpcweb";
import useNavigateTo from "@/hooks/useNavigateTo";
import useUserStore from "@/stores/v1/user";
import useWorkspaceStore from "@/stores/v1/workspace";
import { setAccessToken } from "@/utils/auth";
import useLoading from "../hooks/useLoading";

const SignUp: React.FC = () => {
  const { t } = useTranslation();
  const navigateTo = useNavigateTo();
  const workspaceStore = useWorkspaceStore();
  const userStore = useUserStore();
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const actionBtnLoadingState = useLoading(false);
  const allowConfirm = email.length > 0 && nickname.length > 0 && password.length > 0;

  useEffect(() => {
    if (!workspaceStore.profile.enableSignup) {
      return navigateTo("/auth", {
        replace: true,
      });
    }
  }, []);

  const handleEmailInputChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value as string;
    setEmail(text);
  };

  const handleNicknameInputChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value as string;
    setNickname(text);
  };

  const handlePasswordInputChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value as string;
    setPassword(text);
  };

  const handleSignupBtnClick = async (e: FormEvent) => {
    e.preventDefault();
    if (actionBtnLoadingState.isLoading) {
      return;
    }

    try {
      actionBtnLoadingState.setLoading();
      const { user, accessToken } = await authServiceClient.signUp({
        email,
        nickname,
        password,
      });
      if (user) {
        userStore.setCurrentUserId(user.id);
        setAccessToken(accessToken);
        await userStore.fetchCurrentUser();
        navigateTo("/");
      } else {
        toast.error("Signup failed");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response.data.message);
    }
    actionBtnLoadingState.setFinish();
  };

  return (
    <div className="flex flex-row justify-center items-center w-full h-auto mt-12 sm:mt-24 bg-white dark:bg-zinc-900">
      <div className="w-80 max-w-full h-full py-4 flex flex-col justify-start items-center">
        <div className="w-full py-4 grow flex flex-col justify-center items-center">
          <div className="flex flex-row justify-start items-center w-auto mx-auto gap-y-2 mb-4">
            <img id="logo-img" src="/logo.png" className="w-12 h-auto mr-2 -mt-1 rounded-full shadow" alt="logo" />
            <span className="text-3xl opacity-80 dark:text-gray-500">Slash</span>
          </div>
          <p className="w-full text-2xl mt-6 dark:text-gray-500">{t("auth.create-your-account")}</p>
          <form className="w-full mt-4" onSubmit={handleSignupBtnClick}>
            <div className={`flex flex-col justify-start items-start w-full ${actionBtnLoadingState.isLoading ? "opacity-80" : ""}`}>
              <div className="w-full flex flex-col mb-2">
                <span className="leading-8 mb-1 text-gray-600">{t("common.email")}</span>
                <Input
                  className="w-full py-3"
                  type="email"
                  value={email}
                  placeholder="steven@slash.com"
                  onChange={handleEmailInputChanged}
                />
              </div>
              <div className="w-full flex flex-col mb-2">
                <span className="leading-8 text-gray-600">Nickname</span>
                <Input className="w-full py-3" type="text" value={nickname} placeholder="steven" onChange={handleNicknameInputChanged} />
              </div>
              <div className="w-full flex flex-col mb-2">
                <span className="leading-8 text-gray-600">{t("common.password")}</span>
                <Input className="w-full py-3" type="password" value={password} placeholder="····" onChange={handlePasswordInputChanged} />
              </div>
            </div>
            <div className="w-full flex flex-row justify-end items-center mt-4 space-x-2">
              <Button
                className="w-full"
                type="submit"
                color="primary"
                loading={actionBtnLoadingState.isLoading}
                disabled={actionBtnLoadingState.isLoading || !allowConfirm}
                onClick={handleSignupBtnClick}
              >
                {t("auth.sign-up")}
              </Button>
            </div>
          </form>
          <p className="w-full mt-4 text-sm">
            <span className="dark:text-gray-500">{"Already has an account?"}</span>
            <Link to="/auth" className="cursor-pointer ml-2 text-blue-600 hover:underline">
              {t("auth.sign-in")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
