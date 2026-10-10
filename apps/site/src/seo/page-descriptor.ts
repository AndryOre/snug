import type { Locale } from '../i18n/locales'

/**
 * Describes a page that is not the home page, so `Layout.astro` can render its
 * metadata, hreflang alternates and structured data without knowing which
 * route it serves.
 */
export interface PageDescriptor {
  /**
   * Title and description for `<title>`, Open Graph and Twitter tags.
   */
  meta: { title: string; description: string }
  /**
   * Site-relative path of the page for a locale, with a trailing slash.
   */
  path: (locale: Locale) => string
  /**
   * Locales that have this page, English first. They become the hreflang and
   * `og:locale:alternate` entries and the language switcher's current-page
   * marker. An empty list means the page has no alternates (the 404 page).
   */
  alternateLocales: readonly Locale[]
  /**
   * A schema.org object serialized into one JSON-LD script, if any.
   */
  jsonLd?: object
}
