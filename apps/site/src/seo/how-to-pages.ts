import {
  getHowToMeta,
  HOW_TO_SLUGS,
  howToPageLocales,
  howToPath,
} from '../i18n/how-to'
import {
  DEFAULT_LOCALE,
  hreflangAlternates,
  SITE_ORIGIN,
} from '../i18n/locales'
import type { LlmsHowToPage, SitemapEntry } from './crawlers'
import { lastCommitDate } from './last-modified'

/**
 * Sources whose last commit stamps a How-to page's `lastmod` and
 * `dateModified`.
 */
export const HOW_TO_SOURCES: readonly string[] = [
  'src/content/how-to',
  'src/content/how-to-pages.ts',
  'src/content/browser-facts.ts',
]

/**
 * One sitemap entry per How-to page in every locale that carries it.
 * Alternates list only those locales plus `x-default`.
 * @returns The entries, per page in registry order, then per locale.
 */
export function howToSitemapEntries(): SitemapEntry[] {
  const lastmod = lastCommitDate(HOW_TO_SOURCES)
  return HOW_TO_SLUGS.flatMap((slug) => {
    const locales = howToPageLocales(slug)
    const alternates = hreflangAlternates(
      howToPath(DEFAULT_LOCALE, slug),
      locales,
    )
    return locales.map((locale) => ({
      loc: `${SITE_ORIGIN}${howToPath(locale, slug)}`,
      lastmod,
      alternates,
    }))
  })
}

/**
 * One `llms.txt` line per English How-to page.
 * @returns The pages, in registry order.
 */
export function howToLlmsPages(): LlmsHowToPage[] {
  return HOW_TO_SLUGS.map((slug) => {
    const { title, description } = getHowToMeta(DEFAULT_LOCALE, slug)
    return {
      title,
      description,
      url: `${SITE_ORIGIN}${howToPath(DEFAULT_LOCALE, slug)}`,
    }
  })
}
