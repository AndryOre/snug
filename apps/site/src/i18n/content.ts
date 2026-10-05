import type enContent from '../content/en.json'
import { DEFAULT_LOCALE, type Locale, LOCALES } from './locales'

export type ContentTree = { [key: string]: string | ContentTree }

/**
 * Shape of every locale's content, taken from the English source file.
 */
export type SiteContent = typeof enContent

type ContentFiles = Record<string, { default: SiteContent }>

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

const bundledFiles = import.meta.glob<{ default: SiteContent }>(
  '../content/*.json',
  { eager: true },
)

const validatedByFiles = new WeakMap<
  ContentFiles,
  Record<Locale, SiteContent>
>()

function readAllContent(files: ContentFiles): Record<Locale, SiteContent> {
  const byLocale = Object.fromEntries(
    LOCALES.map((locale) => {
      const file = files[`../content/${locale}.json`]
      if (!file) throw new Error(`Missing content file for "${locale}"`)
      return [locale, file.default]
    }),
  ) as Record<Locale, SiteContent>
  const reference = byLocale[DEFAULT_LOCALE]
  for (const locale of LOCALES) {
    assertSameKeys(reference, locale, byLocale[locale])
  }
  return byLocale
}

/**
 * Loads and validates the content of every locale. Throws if a locale file is
 * absent or its keys diverge from English. The bundled files are validated
 * once per file set and reused.
 * @param files - Content modules keyed by `../content/<locale>.json`.
 * @returns Validated content for every locale.
 */
export function loadAllContent(
  files: ContentFiles = bundledFiles,
): Record<Locale, SiteContent> {
  const cached = validatedByFiles.get(files)
  if (cached) return cached
  const content = readAllContent(files)
  validatedByFiles.set(files, content)
  return content
}

/**
 * Validated content for one locale.
 * @param locale - A supported locale code.
 * @returns The locale's content.
 */
export function getContent(locale: Locale): SiteContent {
  return loadAllContent()[locale]
}

/**
 * Title and description for one locale's page metadata.
 * @param locale - A supported locale code.
 * @returns The locale's `meta.title` and `meta.description`.
 */
export function getPageMeta(locale: Locale): SiteContent['meta'] {
  return getContent(locale).meta
}
