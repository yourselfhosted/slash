import { useColorScheme } from "@mui/joy";
import { isEqual } from "lodash-es";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import useUserStore from "../stores/v1/user";

const Root: React.FC = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { setMode } = useColorScheme();
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

    if (isEqual(currentUserSetting.locale, "LOCALE_ZH")) {
      i18n.changeLanguage("zh");
    } else {
      i18n.changeLanguage("en");
    }

    if (isEqual(currentUserSetting.colorTheme, "COLOR_THEME_DARK")) {
      setMode("dark");
      document.documentElement.classList.add("dark");
    } else {
      setMode("light");
      document.documentElement.classList.remove("dark");
    }
  }, [currentUserSetting]);

  return (
    <>
      {isInitialized && (
        <div className="w-full h-auto flex flex-col justify-start items-start dark:bg-zinc-800">
          <Header />
          <Outlet />
        </div>
      )}
    </>
  );
};

export default Root;
