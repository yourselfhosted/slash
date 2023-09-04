import { isEqual } from "lodash-es";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import useUserStore from "../stores/v1/user";

const Root: React.FC = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const userStore = useUserStore();
  const currentUser = userStore.getCurrentUser();
  const currentUserSetting = userStore.getCurrentUserSetting();
  const isInitialized = Boolean(currentUser) && Boolean(currentUserSetting);

  useEffect(() => {
    if (!currentUser) {
      navigate("/auth", {
        replace: true,
      });
      return;
    }

    // Prepare user setting.
    userStore.fetchUserSetting(currentUser.id);
  }, []);

  useEffect(() => {
    if (!currentUserSetting) {
      return;
    }

    if (isEqual(currentUserSetting.locale, "LOCALE_EN")) {
      i18n.changeLanguage("en");
    } else if (isEqual(currentUserSetting.locale, "LOCALE_ZH")) {
      i18n.changeLanguage("zh");
    }
  }, [currentUserSetting]);

  return (
    <>
      {isInitialized && (
        <div className="w-full h-auto flex flex-col justify-start items-start">
          <Header />
          <Outlet />
        </div>
      )}
    </>
  );
};

export default Root;
