import { useColorScheme } from "@mui/joy";
import { isEqual } from "lodash-es";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router-dom";
import useNavigateTo from "@/hooks/useNavigateTo";
import { UserSetting_ColorTheme } from "@/types/proto/api/v2/user_setting_service";
import Header from "../components/Header";
import useUserStore from "../stores/v1/user";

const Root: React.FC = () => {
  const navigateTo = useNavigateTo();
  const { setMode } = useColorScheme();
  const { i18n } = useTranslation();
  const userStore = useUserStore();
  const currentUser = userStore.getCurrentUser();
  const currentUserSetting = userStore.getCurrentUserSetting();
  const isInitialized = Boolean(currentUser) && Boolean(currentUserSetting);

  useEffect(() => {
    if (!currentUser) {
      navigateTo("/auth", {
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

    if (currentUserSetting.colorTheme === UserSetting_ColorTheme.COLOR_THEME_LIGHT) {
      setMode("light");
    } else if (currentUserSetting.colorTheme === UserSetting_ColorTheme.COLOR_THEME_DARK) {
      setMode("dark");
    } else {
      setMode("system");
    }
  }, [currentUserSetting]);

  return (
    <>
      {isInitialized && (
        <div className="w-full h-auto flex flex-col justify-start items-start dark:bg-zinc-900">
          <Header />
          <Outlet />
        </div>
      )}
    </>
  );
};

export default Root;
