import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "welcome": "Welcome to FixItNow",
      "login": "Login",
      "signup": "Sign Up"
    }
  },
  hi: {
    translation: {
      "welcome": "FixItNow में आपका स्वागत है",
      "login": "लॉगिन",
      "signup": "साइन अप"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;