import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../helpers/api";
import { validate, ValidatorConfig } from "../helpers/validator";
import { userService } from "../services";
import useLoading from "../hooks/useLoading";
import Icon from "../components/Icon";
import Only from "../components/common/OnlyWhen";
import toastHelper from "../components/Toast";
import "../less/auth.less";

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
        toastHelper.error("Login failed");
      }
    } catch (error: any) {
      console.error(error);
      toastHelper.error(error.response.data.message);
    }
    actionBtnLoadingState.setFinish();
  };

  return (
    <div className="page-wrapper auth">
      <div className="page-container">
        <div className="auth-form-wrapper">
          <div className="page-header-container">
            <div className="title-container">
              <img className="logo-img" src="/logo-full.webp" alt="" />
            </div>
            <p className="slogan-text">Corgi</p>
          </div>
          <div className={`page-content-container ${actionBtnLoadingState.isLoading ? "requesting" : ""}`}>
            <div className="form-item-container input-form-container">
              <span className={`normal-text ${email ? "not-null" : ""}`}>Email</span>
              <input type="email" value={email} onChange={handleEmailInputChanged} />
            </div>
            <div className="form-item-container input-form-container">
              <span className={`normal-text ${password ? "not-null" : ""}`}>Password</span>
              <input type="password" value={password} onChange={handlePasswordInputChanged} />
            </div>
          </div>
          <div className="action-btns-container">
            <button
              className={`btn signin-btn ${actionBtnLoadingState.isLoading ? "requesting" : ""}`}
              onClick={() => handleSigninBtnsClick()}
            >
              <Only when={actionBtnLoadingState.isLoading}>
                <Icon.Loader className="img-icon" />
              </Only>
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
