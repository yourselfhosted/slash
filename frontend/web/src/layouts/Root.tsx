import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useNavigate } from "react-router-dom";
import { UserSetting_Locale } from "@/types/proto/api/v2/user_setting_service_pb";
import Header from "../components/Header";
import useUserStore from "../stores/v1/user";

const Root: React.FC = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const userStore = useUserStore();
  const currentUser = userStore.getCurrentUser();
  const currentUserSetting = userStore.getCurrentUserSetting();

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

    if (currentUserSetting.locale === UserSetting_Locale.EN) {
      i18n.changeLanguage("en");
    } else if (currentUserSetting.locale === UserSetting_Locale.ZH) {
      i18n.changeLanguage("zh");
    }
  }, [currentUserSetting]);

  return (
    <>
      {currentUser && (
        <div className="w-full h-auto flex flex-col justify-start items-start">
          <Header />
          <Outlet />
        </div>
      )}
    </>
  );
};

export default Root;
