import { languageTag, type Locale } from '../i18n/locales'
import type { HeadEntry } from './page-meta'

function toPath(href: string): string {
  try {
    return new URL(href, 'https://placeholder.invalid').pathname
  } catch {
    return href
  }
}

/**
 * Builds the language switcher target for a Guide route from the
 * `<link rel="alternate" hreflang>` entries Starlight puts in the route head,
 * so the switcher keeps the reader on the same page. A locale without an
 * alternate falls back to the page the caller names.
 * @param head - The route's head entries.
 * @param fallback - Maps a locale to the page used when it has no alternate.
 * @returns A function from locale to a site-relative path.
 */
export function documentationLanguageHref(
  head: readonly HeadEntry[],
  fallback: (locale: Locale) => string,
): (locale: Locale) => string {
  const alternates = new Map<string, string>()
  for (const entry of head) {
    if (entry.tag !== 'link' || entry.attrs?.rel !== 'alternate') continue
    const { hreflang, href } = entry.attrs
    if (typeof hreflang !== 'string' || typeof href !== 'string') continue
    alternates.set(hreflang, href)
  }
  return (locale) => {
    const href = alternates.get(languageTag(locale))
    return href ? toPath(href) : fallback(locale)
  }
}
