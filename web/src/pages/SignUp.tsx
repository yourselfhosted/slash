import { Button, Input } from "@mui/joy";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import * as api from "../helpers/api";
import { userService } from "../services";
import useLoading from "../hooks/useLoading";
import Icon from "../components/Icon";

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const actionBtnLoadingState = useLoading(false);
  const allowConfirm = email.length > 0 && nickname.length > 0 && password.length > 0;

  useEffect(() => {
    userService.doSignOut();
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

  const handleSignupBtnClick = async () => {
    if (actionBtnLoadingState.isLoading) {
      return;
    }

    try {
      actionBtnLoadingState.setLoading();
      await api.signup(email, nickname, password);
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
      toast.error(error.response.data.message);
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
          <p className="w-full mb-4 mt-2 text-2xl">Create your account</p>
          <form className="w-full" onSubmit={handleSignupBtnClick}>
            <div className={`flex flex-col justify-start items-start w-full ${actionBtnLoadingState.isLoading ? "opacity-80" : ""}`}>
              <div className="w-full flex flex-col mb-2">
                <span className="leading-8 mb-1 text-gray-600">Email</span>
                <Input
                  className="w-full py-3"
                  type="email"
                  value={email}
                  placeholder="steven@shortify.com"
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
