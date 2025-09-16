import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enTranslation from "./locales/en/translation.json";
import bhsTranslation from "./locales/bhs/translation.json";

const resources = {
  en: {
    translation: enTranslation,
  },
  bhs: {
    translation: bhsTranslation,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "bhs",
  fallbackLng: "bhs",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
