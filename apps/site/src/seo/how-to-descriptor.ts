import {
  getHowToContent,
  getHowToIndexMeta,
  getHowToMeta,
  getHowToSharedContent,
  hasHowToSnugSection,
  HOW_TO_INDEX_LOCALES,
  howToIndexGroups,
  howToIndexPath,
  howToPageLocales,
  howToPath,
} from '../i18n/how-to'
import { DEFAULT_LOCALE, type Locale, localePath } from '../i18n/locales'
import { HOW_TO_SOURCES } from './how-to-pages'
import { lastCommitDate } from './last-modified'
import type { PageDescriptor } from './page-descriptor'
import {
  buildHowToIndexStructuredData,
  buildHowToStructuredData,
} from './structured-data'

/**
 * One step of a How-to page's breadcrumb trail. The page itself comes last.
 */
export interface HowToCrumb {
  name: string
  path: string
}

/**
 * The breadcrumb trail of a How-to page: Snug, How-to, then the page.
 * @param locale - A supported locale code.
 * @param slug - A How-to page slug.
 * @returns The crumbs, the page itself last.
 */
export function howToCrumbs(locale: Locale, slug: string): HowToCrumb[] {
  const { breadcrumb } = getHowToSharedContent(locale)
  const hasPage = howToPageLocales(slug).includes(locale)
  const prefix = hasPage ? locale : DEFAULT_LOCALE
  return [
    { name: breadcrumb.home, path: localePath(prefix) },
    { name: breadcrumb.howTo, path: localePath(prefix, '/how-to/') },
    {
      name: getHowToContent(locale, slug).title,
      path: howToPath(locale, slug),
    },
  ]
}

/**
 * The breadcrumb trail of the How-to index: Snug, then How-to itself.
 * @param locale - A supported locale code.
 * @returns The crumbs, the index itself last.
 */
export function howToIndexCrumbs(locale: Locale): HowToCrumb[] {
  const { breadcrumb } = getHowToSharedContent(locale)
  const prefix = HOW_TO_INDEX_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE
  return [
    { name: breadcrumb.home, path: localePath(prefix) },
    { name: breadcrumb.howTo, path: howToIndexPath(locale) },
  ]
}

/**
 * The page descriptor `Layout.astro` needs for the How-to index: metadata,
 * hreflang alternates for the locales that carry it, and a `CollectionPage`,
 * `ItemList` and `BreadcrumbList` JSON-LD graph.
 * @param locale - A supported locale code.
 * @returns The descriptor for the index in that locale.
 */
export function howToIndexDescriptor(locale: Locale): PageDescriptor {
  const meta = getHowToIndexMeta(locale)
  const items = howToIndexGroups(locale).flatMap((group) =>
    group.pages.map((card) => ({ name: card.title, path: card.href })),
  )
  return {
    meta,
    path: howToIndexPath,
    alternateLocales: HOW_TO_INDEX_LOCALES,
    jsonLd: buildHowToIndexStructuredData(locale, {
      ...meta,
      path: howToIndexPath(locale),
      breadcrumbs: howToIndexCrumbs(locale),
      items,
      dateModified: lastCommitDate(HOW_TO_SOURCES),
    }),
  }
}

/**
 * The page descriptor `Layout.astro` needs for one How-to page: metadata,
 * hreflang alternates for the locales that carry it, and a `WebPage` plus
 * `BreadcrumbList` JSON-LD graph.
 * @param locale - A supported locale code.
 * @param slug - A How-to page slug.
 * @returns The descriptor for that page in that locale.
 */
export function howToPageDescriptor(
  locale: Locale,
  slug: string,
): PageDescriptor {
  const meta = getHowToMeta(locale, slug)
  return {
    meta,
    path: (code) => howToPath(code, slug),
    alternateLocales: howToPageLocales(slug),
    jsonLd: buildHowToStructuredData(locale, {
      ...meta,
      path: howToPath(locale, slug),
      breadcrumbs: howToCrumbs(locale, slug),
      hasSnugSection: hasHowToSnugSection(slug),
      dateModified: lastCommitDate(HOW_TO_SOURCES),
    }),
  }
}
