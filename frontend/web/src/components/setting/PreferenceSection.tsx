import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import BetaBadge from "@/components/BetaBadge";
import { useUserStore } from "@/stores";
import { UserSetting } from "@/types/proto/api/v1/user_setting_service";

const PreferenceSection: React.FC = () => {
  const { t } = useTranslation();
  const userStore = useUserStore();
  const userSetting = userStore.getCurrentUserSetting();
  const language = userSetting.general?.locale || "EN";
  const colorTheme = userSetting.general?.colorTheme || "SYSTEM";

  const languageOptions = [
    {
      value: "EN",
      label: "English",
    },
    {
      value: "ZH",
      label: "中文",
    },
    {
      value: "FR",
      label: "Français",
    },
    {
      value: "JA",
      label: "日本語",
    },
    {
      value: "TR",
      label: "Türkçe",
    },
    {
      value: "RU",
      label: "русский",
    },
    {
      value: "HU",
      label: "Magyar",
    },
  ];

  const colorThemeOptions = [
    {
      value: "SYSTEM",
      label: "System",
    },
    {
      value: "LIGHT",
      label: "Light",
    },
    {
      value: "DARK",
      label: "Dark",
    },
  ];

  const handleSelectLanguage = async (locale: string) => {
    await userStore.updateUserSetting(
      {
        ...userSetting,
        general: {
          ...userSetting.general,
          locale: locale,
        },
      } as UserSetting,
      ["general"],
    );
  };

  const handleSelectColorTheme = async (colorTheme: string) => {
    await userStore.updateUserSetting(
      {
        ...userSetting,
        general: {
          ...userSetting.general,
          colorTheme: colorTheme,
        },
      } as UserSetting,
      ["general"],
    );
  };

  return (
    <div className="w-full flex flex-col sm:flex-row justify-start items-start gap-4 sm:gap-x-16">
      <p className="sm:w-1/4 text-2xl shrink-0 font-semibold text-gray-900 dark:text-gray-500">{t("settings.preference.self")}</p>
      <div className="w-full sm:w-auto grow flex flex-col justify-start items-start gap-4">
        <div className="w-full flex flex-row justify-between items-center">
          <div className="flex flex-row justify-start items-center gap-x-1">
            <span className="dark:text-gray-400">{t("settings.preference.color-theme")}</span>
          </div>
          <Select defaultValue={colorTheme} onValueChange={handleSelectColorTheme}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {colorThemeOptions.map((option) => {
                return (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full flex flex-row justify-between items-center">
          <div className="flex flex-row justify-start items-center gap-x-1">
            <span className="dark:text-gray-400">{t("common.language")}</span>
            <BetaBadge />
          </div>
          <Select defaultValue={language} onValueChange={handleSelectLanguage}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languageOptions.map((option) => {
                return (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default PreferenceSection;
