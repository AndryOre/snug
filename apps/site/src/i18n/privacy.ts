import { DEFAULT_LOCALE, languageTag, type Locale, LOCALES } from './locales'

/**
 * Site-relative path of the canonical English privacy policy, which store
 * listings and every locale without a translation point to.
 */
export const ENGLISH_PRIVACY_PATH = '/privacy/'

const translationFiles = new Set(
  Object.keys(import.meta.glob('../content/privacy/*.md')),
)

/**
 * Locales that have a translated policy file in `src/content/privacy/`. The
 * file name is the locale code, e.g. `es.md` or `pt_BR.md`.
 */
export const TRANSLATED_PRIVACY_LOCALES: ReadonlySet<Locale> = new Set(
  LOCALES.filter(
    (locale) =>
      locale !== DEFAULT_LOCALE &&
      translationFiles.has(`../content/privacy/${locale}.md`),
  ),
)

/**
 * Site-relative path of a locale's privacy policy, always with a trailing
 * slash. A locale without a translation falls back to the English policy.
 * @param locale - A supported locale code.
 * @param translated - Locales that have a translated policy.
 * @returns The path, e.g. `/privacy/` or `/es/privacy/`.
 */
export function privacyPath(
  locale: Locale,
  translated: ReadonlySet<Locale> = TRANSLATED_PRIVACY_LOCALES,
): string {
  return locale !== DEFAULT_LOCALE && translated.has(locale)
    ? `/${languageTag(locale).toLowerCase()}${ENGLISH_PRIVACY_PATH}`
    : ENGLISH_PRIVACY_PATH
}
