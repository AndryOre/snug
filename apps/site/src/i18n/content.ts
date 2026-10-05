import { DEFAULT_LOCALE, type Locale, LOCALES } from './locales'

export type ContentTree = { [key: string]: string | ContentTree }

type ContentFiles = Record<string, { default: ContentTree }>

/**
 * Flattens a nested content tree to sorted dotted key paths.
 * @param tree - Content for one locale.
 * @param prefix - Dotted path of the parent node.
 * @returns Sorted dotted key paths.
 */
export function flattenKeys(tree: ContentTree, prefix = ''): string[] {
  return Object.entries(tree)
    .flatMap(([key, value]) => {
      const path = prefix === '' ? key : `${prefix}.${key}`
      return typeof value === 'string' ? [path] : flattenKeys(value, path)
    })
    .toSorted((a, b) => a.localeCompare(b))
}

/**
 * Throws when a locale's keys differ from the reference locale's, so a missing
 * translation fails the build instead of falling back silently.
 * @param reference - Content of the default locale.
 * @param locale - Locale being checked.
 * @param content - Content of that locale.
 */
export function assertSameKeys(
  reference: ContentTree,
  locale: string,
  content: ContentTree,
): void {
  const expected = new Set(flattenKeys(reference))
  const actual = new Set(flattenKeys(content))
  const missing = [...expected.difference(actual)]
  const extra = [...actual.difference(expected)]
  if (missing.length === 0 && extra.length === 0) return
  throw new Error(
    `Content for "${locale}" does not match "${DEFAULT_LOCALE}": ` +
      `missing [${missing.join(', ')}], unexpected [${extra.join(', ')}]`,
  )
}

const bundledFiles: ContentFiles = import.meta.glob('../content/*.json', {
  eager: true,
})

/**
 * Loads and validates the content of every locale. Throws if a locale file is
 * absent or its keys diverge from English.
 * @param files - Content modules keyed by `../content/<locale>.json`.
 * @returns Validated content for every locale.
 */
export function loadAllContent(
  files: ContentFiles = bundledFiles,
): Record<Locale, ContentTree> {
  const byLocale = Object.fromEntries(
    LOCALES.map((locale) => {
      const file = files[`../content/${locale}.json`]
      if (!file) throw new Error(`Missing content file for "${locale}"`)
      return [locale, file.default]
    }),
  ) as Record<Locale, ContentTree>
  const reference = byLocale[DEFAULT_LOCALE]
  for (const locale of LOCALES) {
    assertSameKeys(reference, locale, byLocale[locale])
  }
  return byLocale
}

/**
 * Validated content for one locale.
 * @param locale - A supported locale code.
 * @returns The locale's content tree.
 */
export function getContent(locale: Locale): ContentTree {
  return loadAllContent()[locale]
}

/**
 * Title and description for one locale's page metadata.
 * @param locale - A supported locale code.
 * @returns The locale's `meta.title` and `meta.description`.
 */
export function getPageMeta(locale: Locale): {
  title: string
  description: string
} {
  const meta = getContent(locale).meta
  if (
    typeof meta === 'string' ||
    typeof meta?.title !== 'string' ||
    typeof meta.description !== 'string'
  ) {
    throw new TypeError(
      `Missing meta.title or meta.description for "${locale}"`,
    )
  }
  return { title: meta.title, description: meta.description }
}
