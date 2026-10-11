import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { HOW_TO_PAGES } from '../src/content/how-to-pages'
import {
  DEFAULT_LOCALE,
  type Locale,
  localePath,
  LOCALES,
} from '../src/i18n/locales'

const siteRoot = fileURLToPath(new URL('..', import.meta.url))
const contentRoot = path.join(siteRoot, 'src/content/how-to')

/**
 * Slugs of every registered How-to page, in registry order.
 */
const HOW_TO_PAGE_SLUGS: readonly string[] = Object.keys(HOW_TO_PAGES)

/**
 * Locales that carry one page: English, plus every locale with both the page
 * file and the shared strings. Read from the copy files because Playwright
 * cannot evaluate the site's `import.meta.glob` loader.
 * @param slug - A How-to page slug.
 * @returns The locales, English first.
 */
export function howToLocales(slug: string): readonly Locale[] {
  return LOCALES.filter(
    (locale) =>
      locale === DEFAULT_LOCALE ||
      (existsSync(path.join(contentRoot, slug, `${locale}.json`)) &&
        existsSync(path.join(contentRoot, 'shared', `${locale}.json`))),
  )
}

/**
 * Locales that carry the How-to index: English plus every locale with shared
 * strings.
 */
export const HOW_TO_INDEX_LOCALES: readonly Locale[] = LOCALES.filter(
  (locale) =>
    locale === DEFAULT_LOCALE ||
    existsSync(path.join(contentRoot, 'shared', `${locale}.json`)),
)

/**
 * Site-relative path of the How-to index in a locale that carries it.
 * @param locale - A supported locale code.
 * @returns The path with a trailing slash.
 */
export function howToIndexPath(locale: Locale): string {
  return localePath(
    HOW_TO_INDEX_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE,
    '/how-to/',
  )
}

/**
 * The How-to index in every locale that carries it.
 */
export const HOW_TO_INDEX_PATHS = HOW_TO_INDEX_LOCALES.map((locale) =>
  howToIndexPath(locale),
)

/**
 * Site-relative path of a How-to page in a locale that carries it.
 * @param locale - A supported locale code.
 * @param slug - A How-to page slug.
 * @returns The path with a trailing slash.
 */
function howToPagePath(locale: Locale, slug: string): string {
  return localePath(
    howToLocales(slug).includes(locale) ? locale : DEFAULT_LOCALE,
    `/how-to/${slug}/`,
  )
}

/**
 * Every How-to page in every locale that carries it.
 */
export const HOW_TO_PAGE_LIST = HOW_TO_PAGE_SLUGS.flatMap((slug) =>
  howToLocales(slug).map((locale) => ({
    locale,
    slug,
    path: howToPagePath(locale, slug),
  })),
)

/**
 * The paths of `HOW_TO_PAGE_LIST`.
 */
export const HOW_TO_PATHS = HOW_TO_PAGE_LIST.map((page) => page.path)
