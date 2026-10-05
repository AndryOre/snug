import { type Locale, LOCALES } from '../i18n/locales'

const OG_LOCALES: Record<Locale, string> = {
  en: 'en_US',
  es: 'es_ES',
  de: 'de_DE',
  fr: 'fr_FR',
  it: 'it_IT',
  ja: 'ja_JP',
  ko: 'ko_KR',
  pt_BR: 'pt_BR',
  ru: 'ru_RU',
  zh_CN: 'zh_CN',
}

/**
 * Dimensions and MIME type of the PNG cards in `public/og/`.
 */
export const OG_IMAGE = {
  width: 1200,
  height: 630,
  type: 'image/png',
} as const

/**
 * Open Graph locale code (`language_TERRITORY`) for a site locale.
 * @param locale - A supported locale code.
 * @returns The code for `og:locale`, e.g. `de_DE`.
 */
export function ogLocale(locale: Locale): string {
  return OG_LOCALES[locale]
}

/**
 * Open Graph codes of every locale except the given one, for
 * `og:locale:alternate`.
 * @param locale - The page's own locale.
 * @returns The other locales' codes, in locale order.
 */
export function ogLocaleAlternates(locale: Locale): string[] {
  return LOCALES.filter((entry) => entry !== locale).map((entry) =>
    ogLocale(entry),
  )
}
