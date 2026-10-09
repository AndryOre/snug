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
 * A font subset worth preloading for a locale's first paint.
 */
export type FontPreload = 'space-grotesk-latin' | 'geist-cyrillic'

const LATIN_PRELOAD: readonly FontPreload[] = ['space-grotesk-latin']

/**
 * Per-locale presentation settings: the text direction for `<html dir>` and
 * the font subsets to preload. Latin locales preload Space Grotesk latin;
 * Russian has no Space Grotesk Cyrillic, so it preloads Geist Cyrillic; CJK
 * pages barely use either and preload nothing.
 */
export const LOCALE_CONFIG: Record<
  Locale,
  { dir: 'ltr' | 'rtl'; preloadFonts: readonly FontPreload[] }
> = {
  en: { dir: 'ltr', preloadFonts: LATIN_PRELOAD },
  es: { dir: 'ltr', preloadFonts: LATIN_PRELOAD },
  de: { dir: 'ltr', preloadFonts: LATIN_PRELOAD },
  fr: { dir: 'ltr', preloadFonts: LATIN_PRELOAD },
  it: { dir: 'ltr', preloadFonts: LATIN_PRELOAD },
  ja: { dir: 'ltr', preloadFonts: [] },
  ko: { dir: 'ltr', preloadFonts: [] },
  pt_BR: { dir: 'ltr', preloadFonts: LATIN_PRELOAD },
  ru: { dir: 'ltr', preloadFonts: ['geist-cyrillic'] },
  zh_CN: { dir: 'ltr', preloadFonts: [] },
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
 * Site-relative path of a page for a locale, always with a trailing slash.
 * English is unprefixed; the others use the lowercase BCP 47 tag (`/pt-br/`).
 * @param locale - A supported locale code.
 * @param page - The page's English path, with leading and trailing slashes.
 * Defaults to the home page.
 * @returns The path, e.g. `/`, `/pt-br/` or `/es/privacy/`.
 */
export function localePath(locale: Locale, page = '/'): string {
  return locale === DEFAULT_LOCALE
    ? page
    : `/${languageTag(locale).toLowerCase()}${page}`
}

/**
 * One `<link rel="alternate" hreflang>` entry.
 */
export interface HreflangAlternate {
  hreflang: string
  href: string
}

/**
 * Alternates for the given locales plus `x-default`, which points at the
 * English version of the page.
 * @param page - The page's English path. Defaults to the home page.
 * @param locales - Locales that have this page. Defaults to every locale.
 * @returns The alternates in the given order, `x-default` last.
 */
export function hreflangAlternates(
  page = '/',
  locales: readonly Locale[] = LOCALES,
): HreflangAlternate[] {
  const alternates = locales.map((locale) => ({
    hreflang: languageTag(locale),
    href: `${SITE_ORIGIN}${localePath(locale, page)}`,
  }))
  return [
    ...alternates,
    {
      hreflang: 'x-default',
      href: `${SITE_ORIGIN}${localePath(DEFAULT_LOCALE, page)}`,
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
