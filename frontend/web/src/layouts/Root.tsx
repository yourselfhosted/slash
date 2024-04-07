import { useColorScheme } from "@mui/joy";
import { isEqual } from "lodash-es";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router-dom";
import Header from "@/components/Header";
import Navigator from "@/components/Navigator";
import useNavigateTo from "@/hooks/useNavigateTo";
import { useUserStore } from "@/stores";
import { UserSetting_ColorTheme, UserSetting_Locale } from "@/types/proto/api/v1/user_setting_service";

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

    if (isEqual(currentUserSetting.locale, UserSetting_Locale.LOCALE_ZH)) {
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
    isInitialized && (
      <div className="w-full h-auto flex flex-col justify-start items-start dark:bg-zinc-900">
        <Header />
        <Navigator />
        <Outlet />
      </div>
    )
  );
};

export default Root;
