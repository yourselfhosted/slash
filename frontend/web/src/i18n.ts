import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../../locales/en.json";
import fr from "../../locales/fr.json";
import ja from "../../locales/ja.json";
import zh from "../../locales/zh.json";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: en,
    },
    zh: {
      translation: zh,
    },
    fr: {
      translation: fr,
    },
    ja: {
      translation: ja,
    },
  },
  lng: "en",
  fallbackLng: "en",
});

export default i18n;
