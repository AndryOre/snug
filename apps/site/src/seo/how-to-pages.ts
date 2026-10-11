import {
  getHowToIndexMeta,
  getHowToMeta,
  HOW_TO_INDEX_LOCALES,
  HOW_TO_SLUGS,
  howToIndexPath,
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
  const indexAlternates = hreflangAlternates(
    howToIndexPath(DEFAULT_LOCALE),
    HOW_TO_INDEX_LOCALES,
  )
  const indexEntries = HOW_TO_INDEX_LOCALES.map((locale) => ({
    loc: `${SITE_ORIGIN}${howToIndexPath(locale)}`,
    lastmod,
    alternates: indexAlternates,
  }))
  const pageEntries = HOW_TO_SLUGS.flatMap((slug) => {
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
  return [...indexEntries, ...pageEntries]
}

/**
 * One `llms.txt` line for the English How-to index, then one per English
 * How-to page.
 * @returns The index, then the pages in registry order.
 */
export function howToLlmsPages(): LlmsHowToPage[] {
  const index = getHowToIndexMeta(DEFAULT_LOCALE)
  const indexPage = {
    ...index,
    url: `${SITE_ORIGIN}${howToIndexPath(DEFAULT_LOCALE)}`,
  }
  const pages = HOW_TO_SLUGS.map((slug) => {
    const { title, description } = getHowToMeta(DEFAULT_LOCALE, slug)
    return {
      title,
      description,
      url: `${SITE_ORIGIN}${howToPath(DEFAULT_LOCALE, slug)}`,
    }
  })
  return [indexPage, ...pages]
}
