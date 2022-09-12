import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../helpers/api";
import { validate, ValidatorConfig } from "../helpers/validator";
import { userService } from "../services";
import useLoading from "../hooks/useLoading";
import Icon from "../components/Icon";
import Only from "../components/common/OnlyWhen";
import toastHelper from "../components/Toast";

const validateConfig: ValidatorConfig = {
  minLength: 4,
  maxLength: 24,
  noSpace: true,
  noChinese: true,
};

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const actionBtnLoadingState = useLoading(false);

  useEffect(() => {
    if (userService.getState().user) {
      navigate("/");
      return;
    }

    api.getSystemStatus().then(({ data }) => {
      const { data: status } = data;
      if (status.profile.mode === "dev") {
        setEmail("demo@iamcorgi.com");
        setPassword("secret");
      }
    });
  }, []);

  const handleEmailInputChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value as string;
    setEmail(text);
  };

  const handlePasswordInputChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value as string;
    setPassword(text);
  };

  const handleSigninBtnsClick = async () => {
    if (actionBtnLoadingState.isLoading) {
      return;
    }

    const emailValidResult = validate(email, validateConfig);
    if (!emailValidResult.result) {
      toastHelper.error("Email: " + emailValidResult.reason);
      return;
    }

    const passwordValidResult = validate(password, validateConfig);
    if (!passwordValidResult.result) {
      toastHelper.error("Password: " + passwordValidResult.reason);
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
        toastHelper.error("Signin failed");
      }
    } catch (error: any) {
      console.error(error);
      toastHelper.error(error.response.data.message);
    }
    actionBtnLoadingState.setFinish();
  };

  const handleSignupBtnsClick = async () => {
    if (actionBtnLoadingState.isLoading) {
      return;
    }

    const emailValidResult = validate(email, validateConfig);
    if (!emailValidResult.result) {
      toastHelper.error("Email: " + emailValidResult.reason);
      return;
    }

    const passwordValidResult = validate(password, validateConfig);
    if (!passwordValidResult.result) {
      toastHelper.error("Password: " + passwordValidResult.reason);
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
        toastHelper.error("Signup failed");
      }
    } catch (error: any) {
      console.error(error);
      toastHelper.error(error.response.data.message);
    }
    actionBtnLoadingState.setFinish();
  };

  return (
    <div className="flex flex-row justify-center items-center w-full h-screen bg-white">
      <div className="w-80 max-w-full h-full py-4 flex flex-col justify-start items-center">
        <div className="w-full py-4 grow flex flex-col justify-center items-center">
          <div className="flex flex-col justify-start items-start w-full mb-4">
            <div className="text-3xl font-medium font-mono flex flex-row justify-start items-center">
              Corgi
              <Only when={actionBtnLoadingState.isLoading}>
                <Icon.Loader className="ml-2 w-5 h-auto animate-spin" />
              </Only>
            </div>
          </div>
          <div className={`flex flex-col justify-start items-start w-full ${actionBtnLoadingState.isLoading ? "opacity-80" : ""}`}>
            <div className="w-full flex flex-col mb-2">
              <span className="leading-8 mb-1 text-gray-600">Email</span>
              <input
                className="border rounded-md px-3 p-2 leading-7 focus:border-blue-600"
                type="email"
                value={email}
                onChange={handleEmailInputChanged}
              />
            </div>
            <div className="w-full flex flex-col mb-2">
              <span className="leading-8 text-gray-600">Password</span>
              <input
                className="border rounded-md px-3 p-2 leading-7 focus:border-blue-600"
                type="password"
                value={password}
                onChange={handlePasswordInputChanged}
              />
            </div>
          </div>
          <div className="w-full flex flex-row justify-end items-center mt-4">
            <button
              className={`mr-4 text-gray-600 hover:text-black ${actionBtnLoadingState.isLoading ? "opacity-80 cursor-wait" : ""}`}
              onClick={() => handleSignupBtnsClick()}
            >
              Sign up
            </button>
            <button
              className={`border rounded-md border-green-600 bg-green-600 text-white px-3 py-2 leading-6 hover:bg-green-700 ${
                actionBtnLoadingState.isLoading ? "opacity-80 cursor-wait" : ""
              }`}
              onClick={() => handleSigninBtnsClick()}
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
