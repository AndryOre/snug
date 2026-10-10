import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { COMPARISON_PAGE_SLUGS } from '../src/content/competitors'
import {
  DEFAULT_LOCALE,
  type Locale,
  localePath,
  LOCALES,
} from '../src/i18n/locales'

const siteRoot = fileURLToPath(new URL('..', import.meta.url))

/**
 * Locales that have comparison copy, English first. Read from the copy files
 * because Playwright cannot evaluate the site's `import.meta.glob` loader.
 */
export const COMPARISON_LOCALES: readonly Locale[] = LOCALES.filter(
  (locale) =>
    locale === DEFAULT_LOCALE ||
    existsSync(
      path.join(siteRoot, 'src/content/comparisons', `${locale}.json`),
    ),
)

/**
 * Site-relative path of the Alternatives page or a comparison page.
 * @param locale - A locale that has comparison copy.
 * @param slug - A comparison slug; omit for the Alternatives page.
 * @returns The path with a trailing slash.
 */
export function comparisonPath(locale: Locale, slug?: string): string {
  const page = slug ? `/alternatives/${slug}/` : '/alternatives/'
  return localePath(
    COMPARISON_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE,
    page,
  )
}

/**
 * Every Alternatives and comparison page in every locale that has copy.
 */
export const COMPARISON_PAGES = COMPARISON_LOCALES.flatMap((locale) =>
  [undefined, ...COMPARISON_PAGE_SLUGS].map((slug) => ({
    locale,
    slug,
    path: comparisonPath(locale, slug),
  })),
)

/**
 * The paths of `COMPARISON_PAGES`.
 */
export const COMPARISON_PATHS = COMPARISON_PAGES.map((page) => page.path)
