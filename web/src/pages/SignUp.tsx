import { Button, Input } from "@mui/joy";
import React, { FormEvent, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import * as api from "../helpers/api";
import useLoading from "../hooks/useLoading";
import { globalService } from "../services";
import useUserStore from "../stores/v1/user";

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const userStore = useUserStore();
  const {
    workspaceProfile: { disallowSignUp },
  } = globalService.getState();
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const actionBtnLoadingState = useLoading(false);
  const allowConfirm = email.length > 0 && nickname.length > 0 && password.length > 0;

  useEffect(() => {
    if (userStore.getCurrentUser()) {
      return navigate("/", {
        replace: true,
      });
    }

    if (disallowSignUp) {
      return navigate("/auth", {
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
      await api.signup(email, nickname, password);
      const user = await userStore.fetchCurrentUser();
      if (user) {
        navigate("/", {
          replace: true,
        });
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
    <div className="flex flex-row justify-center items-center w-full h-auto mt-12 sm:mt-24 bg-white">
      <div className="w-80 max-w-full h-full py-4 flex flex-col justify-start items-center">
        <div className="w-full py-4 grow flex flex-col justify-center items-center">
          <div className="flex flex-row justify-start items-center w-auto mx-auto gap-y-2 mb-4">
            <img src="/logo.png" className="w-12 h-auto mr-2 -mt-1" alt="logo" />
            <span className="text-3xl font-medium font-mono opacity-80">Slash</span>
          </div>
          <p className="w-full text-2xl mt-6">Create your account</p>
          <form className="w-full mt-4" onSubmit={handleSignupBtnClick}>
            <div className={`flex flex-col justify-start items-start w-full ${actionBtnLoadingState.isLoading ? "opacity-80" : ""}`}>
              <div className="w-full flex flex-col mb-2">
                <span className="leading-8 mb-1 text-gray-600">Email</span>
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
                <span className="leading-8 text-gray-600">Password</span>
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
                Sign up
              </Button>
            </div>
          </form>
          <p className="w-full mt-4 text-sm">
            <span>{"Already has an account?"}</span>
            <Link to="/auth" className="cursor-pointer ml-2 text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
