import { Option, Select } from "@mui/joy";
import { useTranslation } from "react-i18next";
import { UserSetting, UserSetting_ColorTheme, UserSetting_Locale } from "@/types/proto/api/v2/user_setting_service";
import useUserStore from "../../stores/v1/user";
import BetaBadge from "../BetaBadge";

const PreferenceSection: React.FC = () => {
  const { t } = useTranslation();
  const userStore = useUserStore();
  const userSetting = userStore.getCurrentUserSetting();
  const language = userSetting.locale;
  const colorTheme = userSetting.colorTheme;

  const languageOptions = [
    {
      value: UserSetting_Locale.LOCALE_EN,
      label: "English",
    },
    {
      value: UserSetting_Locale.LOCALE_ZH,
      label: "中文",
    },
  ];

  const colorThemeOptions = [
    {
      value: UserSetting_ColorTheme.COLOR_THEME_SYSTEM,
      label: "System",
    },
    {
      value: UserSetting_ColorTheme.COLOR_THEME_LIGHT,
      label: "Light",
    },
    {
      value: UserSetting_ColorTheme.COLOR_THEME_DARK,
      label: "Dark",
    },
  ];

  const handleSelectLanguage = async (locale: UserSetting_Locale) => {
    await userStore.updateUserSetting(
      {
        ...userSetting,
        locale: locale,
      } as UserSetting,
      ["locale"]
    );
  };

  const handleSelectColorTheme = async (colorTheme: UserSetting_ColorTheme) => {
    await userStore.updateUserSetting(
      {
        ...userSetting,
        colorTheme: colorTheme,
      } as UserSetting,
      ["color_theme"]
    );
  };

  return (
    <>
      <div className="w-full flex flex-col justify-start items-start gap-y-2">
        <p className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-500">{t("settings.preference.self")}</p>
        <div className="w-full flex flex-row justify-between items-center">
          <div className="flex flex-row justify-start items-center gap-x-1">
            <span className="dark:text-gray-400">{t("settings.preference.color-theme")}</span>
          </div>
          <Select defaultValue={colorTheme} onChange={(_, value) => handleSelectColorTheme(value as UserSetting_ColorTheme)}>
            {colorThemeOptions.map((option) => {
              return (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              );
            })}
          </Select>
        </div>
        <div className="w-full flex flex-row justify-between items-center">
          <div className="flex flex-row justify-start items-center gap-x-1">
            <span className="dark:text-gray-400">{t("common.language")}</span>
            <BetaBadge />
          </div>
          <Select defaultValue={language} onChange={(_, value) => handleSelectLanguage(value as UserSetting_Locale)}>
            {languageOptions.map((option) => {
              return (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              );
            })}
          </Select>
        </div>
      </div>
    </>
  );
};

export default PreferenceSection;
