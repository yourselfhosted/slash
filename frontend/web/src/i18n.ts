import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../../locales/en.json";
import fr from "../../locales/fr.json";
import ja from "../../locales/ja.json";
import zh from "../../locales/zh.json";

i18n.use(initReactI18next).init({
  resources: {
    EN: {
      translation: en,
    },
    ZH: {
      translation: zh,
    },
    FR: {
      translation: fr,
    },
    JA: {
      translation: ja,
    },
  },
  lng: "EN",
  fallbackLng: "EN",
});

export default i18n;
