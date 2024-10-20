import koKRContent from './ko-KR'
import enContent from './en'
import cnContent from './cn'
import twContent from './tw'
import deContent from './de'

// Export i18n config object
export const i18nConfig = {
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: enContent,
    cn: cnContent,
    tw: twContent,
    ko: koKRContent,
    de: deContent
  },
};

// Export locale label object
export const localeLabels = {
  en: 'English',
  ko: 'Korean',
  de: 'German',
  cn: 'Simplified Chinese',
  tw: 'Traditional Chinese',
}