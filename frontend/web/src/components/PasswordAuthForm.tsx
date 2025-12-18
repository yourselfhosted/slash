import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { authServiceClient } from "@/grpcweb";
import useLoading from "@/hooks/useLoading";
import useNavigateTo from "@/hooks/useNavigateTo";
import { useUserStore } from "@/stores";

const PasswordAuthForm = () => {
  const { t } = useTranslation();
  const navigateTo = useNavigateTo();
  const userStore = useUserStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const actionBtnLoadingState = useLoading(false);
  const allowConfirm = email.length > 0 && password.length > 0;

  const handleEmailInputChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value as string;
    setEmail(text);
  };

  const handlePasswordInputChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value as string;
    setPassword(text);
  };

  const handleSigninBtnClick = async (e: FormEvent) => {
    e.preventDefault();
    if (actionBtnLoadingState.isLoading) {
      return;
    }

    try {
      actionBtnLoadingState.setLoading();
      const user = await authServiceClient.signIn({ email, password });
      if (user) {
        userStore.setCurrentUserId(user.id);
        await userStore.fetchCurrentUser();
        navigateTo("/");
      } else {
        toast.error("Signin failed");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.details);
    }
    actionBtnLoadingState.setFinish();
  };

  return (
    <form className="w-full mt-6" onSubmit={handleSigninBtnClick}>
      <div className={`flex flex-col justify-start items-start w-full ${actionBtnLoadingState.isLoading ? "opacity-80" : ""}`}>
        <div className="w-full flex flex-col mb-2">
          <span className="leading-8 mb-1 text-gray-600">{t("common.email")}</span>
          <Input
            className="w-full py-3"
            type="email"
            value={email}
            placeholder="slash@yourselfhosted.com"
            onChange={handleEmailInputChanged}
          />
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
          disabled={actionBtnLoadingState.isLoading || !allowConfirm}
          onClick={handleSigninBtnClick}
        >
          {actionBtnLoadingState.isLoading ? "Loading..." : t("auth.sign-in")}
        </Button>
      </div>
    </form>
  );
};

export default PasswordAuthForm;
