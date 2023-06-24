import { Button, Input } from "@mui/joy";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import * as api from "../helpers/api";
import { userService } from "../services";
import useLoading from "../hooks/useLoading";
import Icon from "../components/Icon";

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const actionBtnLoadingState = useLoading(false);

  useEffect(() => {
    userService.doSignOut();
  }, []);

  const handleEmailInputChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value as string;
    setEmail(text);
  };

  const handlePasswordInputChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value as string;
    setPassword(text);
  };

  const handleSigninBtnClick = async () => {
    if (actionBtnLoadingState.isLoading) {
      return;
    }

    try {
      actionBtnLoadingState.setLoading();
      await api.signin(email, password);
      const user = await userService.doSignIn();
      if (user) {
        navigate("/", {
          replace: true,
        });
      } else {
        toast.error("Signin failed");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(JSON.stringify(error.response.data));
    }
    actionBtnLoadingState.setFinish();
  };

  const handleSignupBtnClick = async () => {
    if (actionBtnLoadingState.isLoading) {
      return;
    }

    try {
      actionBtnLoadingState.setLoading();
      await api.signup(email, password);
      const user = await userService.doSignIn();
      if (user) {
        navigate("/", {
          replace: true,
        });
      } else {
        toast.error("Signup failed");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(JSON.stringify(error.response.data));
    }
    actionBtnLoadingState.setFinish();
  };

  return (
    <div className="flex flex-row justify-center items-center w-full h-screen bg-white">
      <div className="w-80 max-w-full h-full py-4 flex flex-col justify-start items-center">
        <div className="w-full py-4 grow flex flex-col justify-center items-center">
          <div className="flex flex-row justify-start items-center w-full mb-4">
            <img src="/logo.png" className="w-14 h-auto mr-1" alt="" />
            <div className="text-3xl font-medium font-mono flex flex-row justify-start items-center">
              Shortify
              {actionBtnLoadingState.isLoading && <Icon.Loader className="ml-2 w-5 h-auto animate-spin" />}
            </div>
          </div>
          <div className={`flex flex-col justify-start items-start w-full ${actionBtnLoadingState.isLoading ? "opacity-80" : ""}`}>
            <div className="w-full flex flex-col mb-2">
              <span className="leading-8 mb-1 text-gray-600">Email</span>
              <Input className="w-full py-3" type="email" value={email} onChange={handleEmailInputChanged} />
            </div>
            <div className="w-full flex flex-col mb-2">
              <span className="leading-8 text-gray-600">Password</span>
              <Input className="w-full py-3" type="password" value={password} onChange={handlePasswordInputChanged} />
            </div>
          </div>
          <div className="w-full flex flex-row justify-end items-center mt-4 space-x-2">
            <Button variant="plain" disabled={actionBtnLoadingState.isLoading} onClick={() => handleSignupBtnClick()}>
              Sign up
            </Button>
            <Button color="primary" disabled={actionBtnLoadingState.isLoading} onClick={() => handleSigninBtnClick()}>
              Sign in
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
