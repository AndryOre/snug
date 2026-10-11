import {
  getHowToContent,
  getHowToMeta,
  getHowToSharedContent,
  hasHowToSnugSection,
  howToPageLocales,
  howToPath,
} from '../i18n/how-to'
import { DEFAULT_LOCALE, type Locale, localePath } from '../i18n/locales'
import { HOW_TO_SOURCES } from './how-to-pages'
import { lastCommitDate } from './last-modified'
import type { PageDescriptor } from './page-descriptor'
import { buildHowToStructuredData } from './structured-data'

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
