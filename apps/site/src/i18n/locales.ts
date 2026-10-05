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
 * live in `public/og/` and are named after the lowercase BCP 47 tag, e.g.
 * `/og/en.png` and `/og/pt-br.png`.
 * @param locale - A supported locale code.
 * @returns Path such as `/og/de.png`.
 */
export function ogImagePath(locale: Locale): string {
  return `/og/${languageTag(locale).toLowerCase()}.png`
}
