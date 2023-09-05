import { Option, Select } from "@mui/joy";
import { useTranslation } from "react-i18next";
import { UserSetting, UserSetting_ColorTheme, UserSetting_Locale } from "@/types/proto/api/v2/user_setting_service_pb";
import useUserStore from "../../stores/v1/user";

const PreferenceSection: React.FC = () => {
  const { t } = useTranslation();
  const userStore = useUserStore();
  const userSetting = userStore.getCurrentUserSetting();
  const language = userSetting.locale || UserSetting_Locale.EN;
  const colorTheme = userSetting.colorTheme;

  const languageOptions = [
    {
      value: "LOCALE_EN",
      label: "English",
    },
    {
      value: "LOCALE_ZH",
      label: "中文",
    },
  ];

  const colorThemeOptions = [
    {
      value: "COLOR_THEME_UNSPECIFIED",
      label: "Auto",
    },
    {
      value: "COLOR_THEME_LIGHT",
      label: "Light",
    },
    {
      value: "COLOR_THEME_DARK",
      label: "Dark",
    },
  ];

  const handleSelectLanguage = async (locale: UserSetting_Locale) => {
    if (!locale) {
      return;
    }

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
        <p className="text-base font-semibold leading-6 text-gray-900">Preference</p>
        <div className="w-full flex flex-row justify-between items-center">
          <span>{t("common.language")}</span>
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
        <div className="w-full flex flex-row justify-between items-center">
          <span>Color Theme</span>
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
      </div>
    </>
  );
};

export default PreferenceSection;
