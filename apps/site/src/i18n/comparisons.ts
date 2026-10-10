import type enComparisons from '../content/comparisons/en.json'
import { COMPETITORS, type CompetitorSlug } from '../content/competitors'
import { assertSameKeys, type ContentTree } from './content'
import {
  DEFAULT_LOCALE,
  languageTag,
  type Locale,
  localePath,
  LOCALES,
} from './locales'

/**
 * Shape of every locale's comparison copy, taken from the English source file.
 */
export type ComparisonContent = typeof enComparisons

type ComparisonFiles = Record<string, { default: ComparisonContent }>

/**
 * Slug of a competitor that has its own comparison page. Always a key of
 * `COMPETITORS` whose `comparisonPage` flag is set.
 */
export type ComparisonSlug = Extract<
  keyof ComparisonContent['pages'],
  CompetitorSlug
>

/**
 * Key of one page's entry in the copy's `meta` block: the Alternatives page or
 * one comparison page.
 */
export type ComparisonPageKey = 'alternatives' | ComparisonSlug

/**
 * Site-relative path of the English Alternatives page.
 */
export const ALTERNATIVES_PATH = '/alternatives/'

const FILE_PATTERN = /^\.\.\/content\/comparisons\/(.+)\.json$/

const bundledFiles = import.meta.glob<{ default: ComparisonContent }>(
  '../content/comparisons/*.json',
  { eager: true },
)

function isLocale(code: string): code is Locale {
  return (LOCALES as readonly string[]).includes(code)
}

/**
 * Loads the comparison copy of every locale that has a file in
 * `src/content/comparisons/`. English is required; any other locale is
 * optional (partial translation is allowed) but must carry exactly the English
 * keys, so drift fails the build instead of falling back silently.
 * @param files - Copy modules keyed by `../content/comparisons/<locale>.json`.
 * @returns The validated copy, keyed by the locales that have a file.
 */
export function loadComparisonContent(
  files: ComparisonFiles = bundledFiles,
): Partial<Record<Locale, ComparisonContent>> {
  const byLocale: Partial<Record<Locale, ComparisonContent>> = {}
  for (const [file, module] of Object.entries(files)) {
    const code = FILE_PATTERN.exec(file)?.[1]
    if (code === undefined || !isLocale(code)) {
      throw new Error(
        `Comparison copy file "${file}" is not a supported locale`,
      )
    }
    byLocale[code] = module.default
  }
  const reference = byLocale[DEFAULT_LOCALE]
  if (!reference) {
    throw new Error('Missing English comparison copy file "en.json"')
  }
  for (const locale of LOCALES) {
    const content = byLocale[locale]
    if (content && locale !== DEFAULT_LOCALE) {
      assertSameKeys(
        reference as unknown as ContentTree,
        locale,
        content as unknown as ContentTree,
      )
    }
  }
  return byLocale
}

const loadedContent = loadComparisonContent()

/**
 * Locales that have a translated comparison copy file. English is the source
 * and is never listed here.
 */
export const TRANSLATED_COMPARISON_LOCALES: ReadonlySet<Locale> = new Set(
  LOCALES.filter(
    (locale) =>
      locale !== DEFAULT_LOCALE && loadedContent[locale] !== undefined,
  ),
)

/**
 * Locales that have the Alternatives and Comparison pages, English first.
 * These are the hreflang and sitemap alternates.
 */
export const COMPARISON_PAGE_LOCALES: readonly Locale[] = LOCALES.filter(
  (locale) =>
    locale === DEFAULT_LOCALE || TRANSLATED_COMPARISON_LOCALES.has(locale),
)

/**
 * Competitors that have a comparison page, in the order of `COMPETITORS`.
 * Each one must also have English copy, or the build fails.
 */
export const COMPARISON_SLUGS: readonly ComparisonSlug[] = (
  Object.entries(COMPETITORS) as [CompetitorSlug, { comparisonPage: boolean }][]
)
  .filter(([, facts]) => facts.comparisonPage)
  .map(([slug]) => {
    const english = loadedContent[DEFAULT_LOCALE]
    if (!english || !Object.keys(english.pages).includes(slug)) {
      throw new Error(`Competitor "${slug}" has no English comparison copy`)
    }
    return slug as ComparisonSlug
  })

/**
 * The locale whose copy a page renders: the locale itself when it has a
 * translation, English otherwise. Interpolated numbers and dates follow this
 * locale so they never mix a translation's formats into English text.
 * @param locale - A supported locale code.
 * @returns `locale` or the default locale.
 */
function comparisonCopyLocale(locale: Locale): Locale {
  return TRANSLATED_COMPARISON_LOCALES.has(locale) ? locale : DEFAULT_LOCALE
}

/**
 * Comparison copy for a locale, falling back to English when the locale has no
 * translation yet.
 * @param locale - A supported locale code.
 * @returns The locale's copy, or the English copy.
 */
export function getComparisonContent(locale: Locale): ComparisonContent {
  const content = loadedContent[locale] ?? loadedContent[DEFAULT_LOCALE]
  if (!content) throw new Error('Missing English comparison copy')
  return content
}

/**
 * Site-relative path of the Alternatives page or one comparison page, always
 * with a trailing slash. A locale without a translation falls back to the
 * English path.
 * @param locale - A supported locale code.
 * @param slug - A comparison slug; omit for the Alternatives page.
 * @param translated - Locales that have translated copy.
 * @returns The path, e.g. `/alternatives/` or `/es/alternatives/maple-backup/`.
 */
export function alternativesPath(
  locale: Locale,
  slug?: ComparisonSlug,
  translated: ReadonlySet<Locale> = TRANSLATED_COMPARISON_LOCALES,
): string {
  const page = slug ? `${ALTERNATIVES_PATH}${slug}/` : ALTERNATIVES_PATH
  return locale !== DEFAULT_LOCALE && translated.has(locale)
    ? localePath(locale, page)
    : page
}

/**
 * Values a comparison copy string can interpolate.
 */
export interface ComparisonValues {
  users?: number
  rating?: number
  languages?: number
  date?: string
  name?: string
}

function formatValue(key: string, value: string | number, tag: string): string {
  if (typeof value === 'string' && key !== 'date') return value
  if (key === 'date') {
    return new Intl.DateTimeFormat(tag, {
      dateStyle: 'long',
      timeZone: 'UTC',
    }).format(new Date(`${String(value)}T00:00:00Z`))
  }
  if (key === 'rating') {
    return new Intl.NumberFormat(tag, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(Number(value))
  }
  return new Intl.NumberFormat(tag).format(Number(value))
}

/**
 * Replaces `{users}`, `{rating}`, `{languages}`, `{date}` and `{name}` in a
 * copy string, formatting numbers and the ISO date with `Intl` for the locale.
 * @param template - A copy string with placeholders.
 * @param locale - The locale to format for.
 * @param values - The value of each placeholder the string uses.
 * @returns The string with every placeholder replaced.
 */
export function interpolateComparison(
  template: string,
  locale: Locale,
  values: ComparisonValues,
): string {
  const tag = languageTag(locale)
  return template.replaceAll(/\{(\w+)\}/g, (_match, key: string) => {
    const value = (values as Record<string, string | number | undefined>)[key]
    if (value === undefined) {
      throw new Error(`No value for placeholder "{${key}}" in "${template}"`)
    }
    return formatValue(key, value, tag)
  })
}

/**
 * Title and description of the Alternatives page or one comparison page, with
 * the `{date}` placeholder resolved from the competitor facts: the page's
 * competitor `verifiedOn`, or the latest one for the Alternatives page.
 * @param locale - A supported locale code.
 * @param page - `'alternatives'` or a comparison slug.
 * @returns The page's `title` and `description`.
 */
export function getComparisonMeta(
  locale: Locale,
  page: ComparisonPageKey,
): { title: string; description: string } {
  const { title, description } = getComparisonContent(locale).meta[page]
  const date =
    page === 'alternatives'
      ? COMPARISON_SLUGS.map((slug) => COMPETITORS[slug].verifiedOn)
          .toSorted((a, b) => a.localeCompare(b))
          .at(-1)
      : COMPETITORS[page].verifiedOn
  return {
    title,
    description: interpolateComparison(
      description,
      comparisonCopyLocale(locale),
      { date },
    ),
  }
}
