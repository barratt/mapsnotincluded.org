import koKRContent from './ko-KR'
import enContent from './en'
import zhContent from './zh'

// Export i18n config object
export const i18nConfig = {
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: enContent,
    zh: zhContent,
    ko: koKRContent
  },
};

// Export locale label object
export const localeLabels = {
  en: 'English',
  ko: 'Korean',
  zh: 'Chinese',
}