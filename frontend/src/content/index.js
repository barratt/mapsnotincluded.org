import koKRContent from './ko-KR'
import enContent from './en'
import cnContent from './cn'
import twContent from './tw'

// Export i18n config object
export const i18nConfig = {
  locale: navigator.language,
  fallbackLocale: 'en',
  messages: {
    en: enContent,
    cn: cnContent,
    tw: twContent,
    ko: koKRContent,
  },
};

// Export locale label object
export const localeLabels = {
  en: 'English',
  ko: '한국어',
  cn: '简体中文',
  tw: '繁體中文',
}