import { DOCS_PATHS, DOCS_UI } from '../i18n/docs-ui'
import {
  type Locale,
  localePath,
  ogImagePath,
  SITE_ORIGIN,
} from '../i18n/locales'
import { OG_IMAGE, ogLocale, ogLocaleAlternates } from '../seo/open-graph'
import { buildComparisonStructuredData } from '../seo/structured-data'
import type { HeadEntry } from './page-meta'

/**
 * Facts the Guide and What's new head tags are computed from.
 */
export interface DocumentationHeadInput {
  locale: Locale
  /**
   * Starlight entry id without the locale prefix, e.g. `guide/exporting`.
   */
  sourceId: string
  title: string
  /**
   * SEO title used for `twitter:title` and the `WebPage` name, when the page
   * has one. The breadcrumb keeps the page title.
   */
  seoTitle?: string | undefined
  description: string
  /**
   * Alt text of the Open Graph card for the locale.
   */
  imageAlt: string
  /**
   * `YYYY-MM-DD` date of the last commit behind the page, when known.
   */
  dateModified?: string | undefined
}

/**
 * A head entry this module emits: a `<meta>` or the JSON-LD `<script>`.
 */
export interface DocumentationHeadEntry {
  tag: 'meta' | 'script'
  attrs: Record<string, string>
  content?: string
}

function attributeKey(entry: HeadEntry): string | undefined {
  if (entry.tag !== 'meta') return undefined
  const { name, property } = entry.attrs ?? {}
  if (typeof property === 'string') return `property:${property}`
  return typeof name === 'string' ? `name:${name}` : undefined
}

/**
 * Adds head entries and drops any earlier `<meta>` that shares a `name` or
 * `property` with one of them, so a pushed tag never duplicates a Starlight
 * default. Entries without a key (links, scripts) are appended as they are.
 * @param head - The route's head entries.
 * @param additions - Entries to add, in order.
 * @returns A new head array.
 */
export function replaceOrPushHead<Entry extends HeadEntry>(
  head: readonly Entry[],
  additions: readonly NoInfer<Entry>[],
): Entry[] {
  const replaced = new Set(
    additions.flatMap((entry) => attributeKey(entry) ?? []),
  )
  const kept = head.filter((entry) => {
    const key = attributeKey(entry)
    return key === undefined || !replaced.has(key)
  })
  return [...kept, ...additions]
}

function meta(
  key: 'name' | 'property',
  value: string,
  content: string,
): DocumentationHeadEntry {
  return { tag: 'meta', attrs: { [key]: value, content } }
}

function breadcrumbs(input: DocumentationHeadInput) {
  const { locale, sourceId, title } = input
  const home = { name: 'Snug', path: localePath(locale) }
  const pagePath = localePath(locale, `/${sourceId}/`)
  if (sourceId === 'changelog') {
    return [home, { name: DOCS_UI.whatsNew, path: pagePath }]
  }
  const guide = {
    name: DOCS_UI.guide,
    path: localePath(locale, DOCS_PATHS.guide),
  }
  return sourceId === 'guide'
    ? [home, guide]
    : [home, guide, { name: title, path: pagePath }]
}

/**
 * The social and structured-data head entries of a Guide or What's new page:
 * Open Graph image set, localized `og:locale` with alternates, Twitter image
 * and title tags, and a `WebPage` + `BreadcrumbList` JSON-LD graph. It never
 * emits HowTo or FAQ markup.
 * @param input - The page's locale, entry id, copy and last-modified date.
 * @returns The entries to merge with {@link replaceOrPushHead}.
 */
export function buildDocumentationHead(
  input: DocumentationHeadInput,
): DocumentationHeadEntry[] {
  const { locale, sourceId, description, imageAlt, dateModified } = input
  const title = input.seoTitle ?? input.title
  const image = `${SITE_ORIGIN}${ogImagePath(locale)}`
  const structuredData = buildComparisonStructuredData(locale, {
    title,
    description,
    path: localePath(locale, `/${sourceId}/`),
    breadcrumbs: breadcrumbs(input),
    omitAbout: true,
    dateModified,
  })
  return [
    meta('property', 'og:image', image),
    meta('property', 'og:image:width', String(OG_IMAGE.width)),
    meta('property', 'og:image:height', String(OG_IMAGE.height)),
    meta('property', 'og:image:type', OG_IMAGE.type),
    meta('property', 'og:image:alt', imageAlt),
    meta('name', 'twitter:title', title),
    meta('name', 'twitter:image', image),
    meta('name', 'twitter:image:alt', imageAlt),
    meta('property', 'og:locale', ogLocale(locale)),
    ...ogLocaleAlternates(locale).map((code) =>
      meta('property', 'og:locale:alternate', code),
    ),
    {
      tag: 'script',
      attrs: { type: 'application/ld+json' },
      content: JSON.stringify(structuredData),
    },
  ]
}
