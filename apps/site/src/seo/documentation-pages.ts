import { loadCatalog } from '../docs/catalog'
import { markdownTwinPath } from '../docs/markdown-twin'
import { PUBLISHED_SOURCES, publishedRoute } from '../docs/published'
import {
  DEFAULT_LOCALE,
  hreflangAlternates,
  LOCALES,
  SITE_ORIGIN,
} from '../i18n/locales'
import type {
  LlmsDocumentationPage,
  LlmsFullSection,
  SitemapEntry,
} from './crawlers'
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
 * One `llms.txt` line per English Guide page and What's new, with its
 * description and a link to its Markdown copy. What's new is secondary.
 * @returns The pages, in allowlist order.
 */
export function documentationLlmsPages(): LlmsDocumentationPage[] {
  const titles = new Map(loadCatalog().map((entry) => [entry.id, entry.title]))
  return PUBLISHED_SOURCES.map((source) => ({
    title: titles.get(source.id) ?? source.id,
    description: source.description,
    markdownUrl: `${SITE_ORIGIN}${markdownTwinPath(publishedRoute(source, DEFAULT_LOCALE))}`,
    secondary: source.kind === 'changelog',
  }))
}

/**
 * Pushes every ATX heading of a Markdown body one level down, so the body sits
 * below the `##` heading `llms-full.txt` gives its page. Fenced code is left
 * alone.
 * @param markdown - A page body without its H1.
 * @returns The body with each heading one level deeper.
 */
export function demoteHeadings(markdown: string): string {
  let isFenced = false
  return markdown
    .split('\n')
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) isFenced = !isFenced
      return !isFenced && /^#{1,5}\s/.test(line) ? `#${line}` : line
    })
    .join('\n')
}

/**
 * The English Guide pages as `llms-full.txt` sections: each page's Markdown,
 * the same text its `.md` twin serves. What's new stays out, since it is long
 * and listed under `## Optional` in `llms.txt`.
 * @returns One section per Guide page, in allowlist order.
 */
export function guideLlmsFullSections(): LlmsFullSection[] {
  const entries = new Map(loadCatalog().map((entry) => [entry.id, entry]))
  return PUBLISHED_SOURCES.filter(({ kind }) => kind === 'markdown').flatMap(
    (source) => {
      const entry = entries.get(source.id)
      if (!entry) return []
      return [
        {
          title: entry.title,
          url: `${SITE_ORIGIN}${publishedRoute(source, DEFAULT_LOCALE)}`,
          body: demoteHeadings(entry.body),
        },
      ]
    },
  )
}
