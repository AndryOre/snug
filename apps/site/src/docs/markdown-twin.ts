import { type Locale, LOCALES } from '../i18n/locales'
import {
  PUBLISHED_SOURCES,
  publishedRoute,
  type PublishedSource,
} from './published'

/**
 * One raw Markdown twin the site serves: a published page in one locale.
 */
export interface MarkdownTwinRoute {
  slug: string
  locale: Locale
  source: PublishedSource
}

/**
 * Raw Markdown of a page: its title as the H1 followed by its body.
 * @param title - The page title.
 * @param body - The page body, without its leading heading.
 * @returns The Markdown document, ending in a newline.
 */
export function buildMarkdownTwin(title: string, body: string): string {
  return `# ${title}\n\n${body.trim()}\n`
}

/**
 * Path of the Markdown twin of a page route.
 * @param routePath - Route with leading and trailing slashes, e.g.
 * `/es/guide/exporting/`.
 * @returns The twin path, e.g. `/es/guide/exporting.md`.
 */
export function markdownTwinPath(routePath: string): string {
  return `${routePath.replace(/\/+$/, '')}.md`
}

/**
 * Every Markdown twin the site serves: each published page in every locale.
 * The slug is the route below the site root, without the `.md` suffix.
 * @param sources - Published sources. Defaults to the allowlist.
 * @param locales - Locales to serve. Defaults to all of them.
 * @returns One route per source and locale.
 */
export function markdownTwinRoutes(
  sources: readonly PublishedSource[] = PUBLISHED_SOURCES,
  locales: readonly Locale[] = LOCALES,
): MarkdownTwinRoute[] {
  return locales.flatMap((locale) =>
    sources.map((source) => ({
      locale,
      source,
      slug: publishedRoute(source, locale).replaceAll(/^\/|\/$/g, ''),
    })),
  )
}
