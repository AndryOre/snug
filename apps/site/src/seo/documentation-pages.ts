import { loadCatalog } from '../docs/catalog'
import { PUBLISHED_SOURCES, publishedRoute } from '../docs/published'
import {
  DEFAULT_LOCALE,
  hreflangAlternates,
  languageTag,
  LOCALES,
  SITE_ORIGIN,
} from '../i18n/locales'
import type { LlmsDocumentationPage, SitemapEntry } from './crawlers'
import { lastCommitDate } from './last-modified'

/**
 * One sitemap entry per Guide page and What's new in every locale. Each locale
 * has the page (English text with a notice until translated), so every entry
 * lists all ten alternates plus `x-default`, and `lastmod` is the last commit
 * of the repository file that feeds the page.
 * @returns The entries, in allowlist order then locale order.
 */
export function documentationSitemapEntries(): SitemapEntry[] {
  return PUBLISHED_SOURCES.flatMap((source) => {
    const alternates = hreflangAlternates(
      publishedRoute(source, DEFAULT_LOCALE),
    )
    const lastmod = lastCommitDate([`../../${source.sourcePath}`])
    return LOCALES.map((locale) => ({
      loc: `${SITE_ORIGIN}${publishedRoute(source, locale)}`,
      lastmod,
      alternates,
    }))
  })
}

/**
 * One `llms.txt` line per Guide page and What's new in every locale.
 * @returns The pages, in allowlist order then locale order.
 */
export function documentationLlmsPages(): LlmsDocumentationPage[] {
  const titles = new Map(loadCatalog().map((entry) => [entry.id, entry.title]))
  return PUBLISHED_SOURCES.flatMap((source) =>
    LOCALES.map((locale) => ({
      languageTag: languageTag(locale),
      title: titles.get(source.id) ?? source.id,
      url: `${SITE_ORIGIN}${publishedRoute(source, locale)}`,
    })),
  )
}
