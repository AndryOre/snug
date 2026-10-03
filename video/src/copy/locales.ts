export const LOCALES = [
  'en',
  'es',
  'de',
  'fr',
  'it',
  'ja',
  'ko',
  'pt_BR',
  'ru',
  'zh_CN',
] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'
