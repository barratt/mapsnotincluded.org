import koKRContent from './ko-KR'
import enContent from './en'
import zhCNContent from './zh-CN'
import zhTWContent from './zh-TW'

// Export i18n config object
export const i18nConfig = {
  locale: navigator.language,
  fallbackLocale: 'en',
  messages: {
    'en': enContent,
    'zh-CN': zhCNContent,
    'zh-TW': zhTWContent,
    'ko-KR': koKRContent,
  },
};

// Export locale label object
export const localeLabels = {
  'en': 'English',
  'ko-KR': '한국어',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
}