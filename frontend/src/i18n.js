import { createI18n } from "vue-i18n";
import en from "./locales/en.json";
import ko from "./locales/ko.json";
import zh_CN from "./locales/zh-CN.json";
import zh_TW from "./locales/zh-TW.json";

function loadLocaleMessages() {
  const locales = [
    { en: en },
    { ko: ko },
    { "zh-CN": zh_CN },
    { "zh-TW": zh_TW },
  ];
  const messages = {};
  locales.forEach((lang) => {
    const key = Object.keys(lang);
    messages[key] = lang[key];
  });
  return messages;
}

export default createI18n({
  locale: navigator.language,
  fallbackLocale: "en",
  messages: loadLocaleMessages(),
});
