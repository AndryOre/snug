/**
 * Locale codes, identical to the file names in `apps/extension/locales`.
 */
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

/**
 * Per-locale presentation settings: the text direction for `<html dir>` and
 * whether the Latin Space Grotesk subset is worth preloading (CJK pages
 * barely use it).
 */
export const LOCALE_CONFIG: Record<
  Locale,
  { dir: 'ltr' | 'rtl'; preloadLatinFont: boolean }
> = {
  en: { dir: 'ltr', preloadLatinFont: true },
  es: { dir: 'ltr', preloadLatinFont: true },
  de: { dir: 'ltr', preloadLatinFont: true },
  fr: { dir: 'ltr', preloadLatinFont: true },
  it: { dir: 'ltr', preloadLatinFont: true },
  ja: { dir: 'ltr', preloadLatinFont: false },
  ko: { dir: 'ltr', preloadLatinFont: false },
  pt_BR: { dir: 'ltr', preloadLatinFont: true },
  ru: { dir: 'ltr', preloadLatinFont: true },
  zh_CN: { dir: 'ltr', preloadLatinFont: false },
}

/**
 * English is served at the site root; every other locale gets a path prefix.
 */
export const DEFAULT_LOCALE: Locale = 'en'

/**
 * The site origin, used to build absolute `hreflang` and canonical URLs.
 */
export const SITE_ORIGIN = 'https://snug.andryore.dev'

/**
 * BCP 47 tag for the `lang` attribute and `hreflang` values (`pt_BR` becomes
 * `pt-BR`).
 * @param locale - A supported locale code.
 * @returns The BCP 47 tag.
 */
export function languageTag(locale: Locale): string {
  return locale.replace('_', '-')
}

/**
 * Site-relative path of the page for a locale, always with a trailing slash.
 * English is the root; the others use the lowercase BCP 47 tag (`/pt-br/`).
 * @param locale - A supported locale code.
 * @returns The path, e.g. `/` or `/pt-br/`.
 */
export function localePath(locale: Locale): string {
  return locale === DEFAULT_LOCALE
    ? '/'
    : `/${languageTag(locale).toLowerCase()}/`
}

/**
 * One `<link rel="alternate" hreflang>` entry.
 */
export interface HreflangAlternate {
  hreflang: string
  href: string
}

/**
 * Alternates for every locale plus `x-default`, which points at the English
 * root. The same set is emitted on every page.
 * @returns The alternates in locale order, `x-default` last.
 */
export function hreflangAlternates(): HreflangAlternate[] {
  const alternates = LOCALES.map((locale) => ({
    hreflang: languageTag(locale),
    href: `${SITE_ORIGIN}${localePath(locale)}`,
  }))
  return [
    ...alternates,
    {
      hreflang: 'x-default',
      href: `${SITE_ORIGIN}${localePath(DEFAULT_LOCALE)}`,
    },
  ]
}

/**
 * Site-relative path of the Open Graph image for a locale. The image files
 * live in `public/og/` and are named after the extension locale code, e.g.
 * `/og/og-en.png` and `/og/og-pt_BR.png`.
 * @param locale - A supported locale code.
 * @returns Path such as `/og/og-de.png`.
 */
export function ogImagePath(locale: Locale): string {
  return `/og/og-${locale}.png`
}

/**
 * Each locale's name in its own language, shown by the language switcher.
 * Never translated, so a visitor can find their language from any page.
 */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  de: 'Deutsch',
  fr: 'Français',
  it: 'Italiano',
  ja: '日本語',
  ko: '한국어',
  pt_BR: 'Português (Brasil)',
  ru: 'Русский',
  zh_CN: '简体中文',
}
