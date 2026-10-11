import {
  BROWSER_FACTS,
  type BrowserFacts,
  type Listed,
  type SourcedFact,
  sourcedFacts,
} from '../content/browser-facts'
import { HOW_TO_PAGES, type HowToPageDefinition } from '../content/how-to-pages'
import type enMoveFirefoxToChrome from '../content/how-to/move-bookmarks-from-firefox-to-chrome/en.json'
import type enShared from '../content/how-to/shared/en.json'
import { PUBLISHED_SOURCES } from '../docs/published'
import { assertSameKeys, type ContentTree } from './content'
import {
  DEFAULT_LOCALE,
  languageTag,
  type Locale,
  localePath,
  LOCALES,
} from './locales'

/**
 * Shape of every locale's copy for a How-to page, taken from the English file.
 * Every page shares the shape, so one file's type stands for all of them.
 */
export type HowToPageContent = typeof enMoveFirefoxToChrome

/**
 * Shape of every locale's shared How-to strings.
 */
export type HowToSharedContent = typeof enShared

type CopyFile<T> = { default: T }

/**
 * Copy modules keyed by `../content/how-to/<slug>/<locale>.json`. The `shared`
 * folder holds the shared strings.
 */
export type HowToFiles = Record<string, CopyFile<unknown>>

/**
 * Everything the loader reads and validates against, injectable for tests.
 */
export interface HowToSources {
  files: HowToFiles
  pages: Record<string, HowToPageDefinition>
  publishedGuideIds: ReadonlySet<string>
}

/**
 * Folder name of the shared strings next to the page folders.
 */
const SHARED_FOLDER = 'shared'

const FILE_PATTERN = /^\.\.\/content\/how-to\/([^/]+)\/(.+)\.json$/

const PLACEHOLDER_PATTERN = /\{(\w+)\}/g

const bundledFiles = import.meta.glob<CopyFile<unknown>>(
  '../content/how-to/*/*.json',
  { eager: true },
)

function isLocale(code: string): code is Locale {
  return (LOCALES as readonly string[]).includes(code)
}

/**
 * The loaded, validated copy.
 */
export interface LoadedHowToContent {
  shared: Partial<Record<Locale, HowToSharedContent>>
  pages: Record<string, Partial<Record<Locale, HowToPageContent>>>
}

function readFolders(
  files: HowToFiles,
): Record<string, Partial<Record<Locale, unknown>>> {
  const folders: Record<string, Partial<Record<Locale, unknown>>> = {}
  for (const [file, module] of Object.entries(files)) {
    const match = FILE_PATTERN.exec(file)
    const folder = match?.[1]
    const code = match?.[2]
    if (folder === undefined || code === undefined || !isLocale(code)) {
      throw new Error(`How-to copy file "${file}" is not a supported locale`)
    }
    folders[folder] = { ...folders[folder], [code]: module.default }
  }
  return folders
}

function assertParity(
  label: string,
  byLocale: Partial<Record<Locale, unknown>>,
): void {
  const reference = byLocale[DEFAULT_LOCALE]
  if (reference === undefined) {
    throw new Error(`Missing English How-to copy file for "${label}"`)
  }
  for (const locale of LOCALES) {
    const content = byLocale[locale]
    if (content !== undefined && locale !== DEFAULT_LOCALE) {
      assertSameKeys(
        reference as ContentTree,
        `${label}/${locale}`,
        content as ContentTree,
      )
    }
  }
}

const DEFAULT_SOURCES: HowToSources = {
  files: bundledFiles,
  pages: HOW_TO_PAGES,
  publishedGuideIds: new Set(PUBLISHED_SOURCES.map((source) => source.id)),
}

/**
 * Loads and validates How-to copy. English is required for every page and for
 * the shared strings. Any other locale is optional but must carry exactly the
 * English keys, so drift fails the build. Every page file needs a registry
 * entry and every registry entry needs English copy. Related Guide pages must
 * be published sources and related How-to pages must be registered slugs.
 * @param sources - Copy modules, page definitions and published Guide ids.
 * @returns The validated copy.
 */
export function loadHowToContent(
  sources: HowToSources = DEFAULT_SOURCES,
): LoadedHowToContent {
  const folders = new Map(Object.entries(readFolders(sources.files)))
  const sharedByLocale = folders.get(SHARED_FOLDER) ?? {}
  folders.delete(SHARED_FOLDER)
  const slugs = new Set(Object.keys(sources.pages))
  assertParity(SHARED_FOLDER, sharedByLocale)
  for (const [slug, byLocale] of folders) {
    if (!slugs.has(slug)) {
      throw new Error(`How-to copy folder "${slug}" has no page definition`)
    }
    assertParity(slug, byLocale)
  }
  for (const [slug, page] of Object.entries(sources.pages)) {
    if (folders.get(slug)?.[DEFAULT_LOCALE] === undefined) {
      throw new Error(`How-to page "${slug}" has no English copy`)
    }
    for (const id of page.relatedGuide) {
      if (!sources.publishedGuideIds.has(id)) {
        throw new Error(
          `How-to page "${slug}" relates to unknown Guide page "${id}"`,
        )
      }
    }
    for (const related of page.relatedHowTo) {
      if (related === slug || !slugs.has(related)) {
        throw new Error(
          `How-to page "${slug}" relates to unknown How-to page "${related}"`,
        )
      }
    }
  }
  return {
    shared: sharedByLocale as LoadedHowToContent['shared'],
    pages: Object.fromEntries(folders) as LoadedHowToContent['pages'],
  }
}

const loaded = loadHowToContent()

/**
 * Slugs of every How-to page, in registry order.
 */
export const HOW_TO_SLUGS: readonly string[] = Object.keys(HOW_TO_PAGES)

/**
 * The definition of one page.
 * @param slug - A How-to page slug.
 * @returns The page's task group, browsers and related pages.
 */
export function getHowToPage(slug: string): HowToPageDefinition {
  const page = HOW_TO_PAGES[slug]
  if (!page) throw new Error(`Unknown How-to page "${slug}"`)
  return page
}

/**
 * Locales that carry one page: English, plus every locale with both the page
 * file and the shared strings. These are the page's hreflang alternates.
 * @param slug - A How-to page slug.
 * @returns The locales, English first.
 */
export function howToPageLocales(slug: string): readonly Locale[] {
  const pageCopy = loaded.pages[slug]
  if (!pageCopy) throw new Error(`Unknown How-to page "${slug}"`)
  return LOCALES.filter(
    (locale) =>
      locale === DEFAULT_LOCALE ||
      (pageCopy[locale] !== undefined && loaded.shared[locale] !== undefined),
  )
}

/**
 * Locales that carry at least one How-to page, English first.
 */
export const HOW_TO_LOCALES: readonly Locale[] = LOCALES.filter((locale) =>
  HOW_TO_SLUGS.some((slug) => howToPageLocales(slug).includes(locale)),
)

/**
 * Site-relative path of a How-to page, always with a trailing slash. A locale
 * that does not carry the page falls back to the English path.
 * @param locale - A supported locale code.
 * @param slug - A How-to page slug.
 * @returns The path, e.g. `/how-to/move-bookmarks-from-firefox-to-chrome/`.
 */
export function howToPath(locale: Locale, slug: string): string {
  const page = `/how-to/${slug}/`
  return locale !== DEFAULT_LOCALE && howToPageLocales(slug).includes(locale)
    ? localePath(locale, page)
    : page
}

function copyLocale(locale: Locale, slug: string): Locale {
  return howToPageLocales(slug).includes(locale) ? locale : DEFAULT_LOCALE
}

/**
 * Copy of one page for a locale, falling back to English.
 * @param locale - A supported locale code.
 * @param slug - A How-to page slug.
 * @returns The page copy.
 */
export function getHowToContent(
  locale: Locale,
  slug: string,
): HowToPageContent {
  const content = loaded.pages[slug]?.[copyLocale(locale, slug)]
  if (!content) throw new Error(`Missing How-to copy for "${slug}"`)
  return content
}

/**
 * Shared How-to strings for a locale, falling back to English.
 * @param locale - A supported locale code.
 * @returns The shared strings.
 */
export function getHowToSharedContent(locale: Locale): HowToSharedContent {
  const content = loaded.shared[locale] ?? loaded.shared[DEFAULT_LOCALE]
  if (!content) throw new Error('Missing shared How-to copy')
  return content
}

/**
 * Values a How-to copy string can interpolate. Browser facts come from
 * `BROWSER_FACTS`, never from copy.
 */
export interface HowToValues {
  date: string
  fromName: string
  toName: string
  fromExportPath: string
  fromExportFile: string
  toImportPath: string
  toImportPlacement: string
  fromHtmlKeeps: string
  fromHtmlDrops: string
}

const MENU_SEPARATOR = ' > '

function listed<T>(
  fact: Listed<SourcedFact<T>>,
  render: (value: T) => string,
  notListed: string,
): string {
  return fact === 'not-listed' ? notListed : render(fact.value)
}

function menuPath(path: readonly string[]): string {
  return path.join(MENU_SEPARATOR)
}

function sentenceList(items: readonly string[], locale: Locale): string {
  return new Intl.ListFormat(languageTag(locale), {
    style: 'long',
    type: 'conjunction',
  }).format(items)
}

/**
 * Latest `verifiedOn` of the browsers a page uses.
 * @param slug - A How-to page slug.
 * @returns An ISO date.
 */
function howToVerifiedOn(slug: string): string {
  const { from, to } = getHowToPage(slug)
  return [BROWSER_FACTS[from], BROWSER_FACTS[to]]
    .map((facts: BrowserFacts) => facts.verifiedOn)
    .toSorted((a, b) => a.localeCompare(b))
    .at(-1) as string
}

/**
 * Builds the placeholder values of one page for one locale. A fact the help
 * pages do not list resolves to the locale's "Not listed" string.
 * @param locale - A supported locale code.
 * @param slug - A How-to page slug.
 * @returns Every placeholder value, as plain strings.
 */
export function howToValues(locale: Locale, slug: string): HowToValues {
  const { from, to } = getHowToPage(slug)
  const source = BROWSER_FACTS[from]
  const target = BROWSER_FACTS[to]
  const tag = copyLocale(locale, slug)
  const shared = getHowToSharedContent(tag)
  const notListed = shared.notListed
  return {
    date: howToVerifiedOn(slug),
    fromName: source.name,
    toName: target.name,
    fromExportPath: listed(source.exportPath, menuPath, notListed),
    fromExportFile: listed(source.exportFileName, String, notListed),
    toImportPath: listed(target.importPath, menuPath, notListed),
    toImportPlacement: listed(
      target.importPlacement,
      (placement) => shared.placements[placement],
      notListed,
    ),
    fromHtmlKeeps: listed(
      source.htmlExportKeeps,
      (items) => sentenceList(items, tag),
      notListed,
    ),
    fromHtmlDrops: listed(
      source.htmlExportDrops,
      (items) => sentenceList(items, tag),
      notListed,
    ),
  }
}

/**
 * Replaces every `{placeholder}` in a copy string. `{date}` and `{verifiedOn}`
 * style ISO dates are formatted with `Intl` for the locale; everything else is
 * inserted as given.
 * @param template - A copy string with placeholders.
 * @param locale - The locale to format for.
 * @param values - The value of each placeholder the string uses.
 * @returns The string with every placeholder replaced.
 */
export function interpolateHowTo(
  template: string,
  locale: Locale,
  values: Partial<Record<string, string>>,
): string {
  return template.replaceAll(PLACEHOLDER_PATTERN, (_match, key: string) => {
    const value = values[key]
    if (value === undefined) {
      throw new Error(`No value for placeholder "{${key}}" in "${template}"`)
    }
    if (key !== 'date') return value
    return new Intl.DateTimeFormat(languageTag(locale), {
      dateStyle: 'long',
      timeZone: 'UTC',
    }).format(new Date(`${value}T00:00:00Z`))
  })
}

/**
 * Title and description of a page with placeholders resolved.
 * @param locale - A supported locale code.
 * @param slug - A How-to page slug.
 * @returns The page's `title` and `description`.
 */
export function getHowToMeta(
  locale: Locale,
  slug: string,
): { title: string; description: string } {
  const { title, description } = getHowToContent(locale, slug).meta
  const values = howToValues(locale, slug)
  const tag = copyLocale(locale, slug)
  return {
    title: interpolateHowTo(
      title,
      tag,
      values as unknown as Record<string, string>,
    ),
    description: interpolateHowTo(
      description,
      tag,
      values as unknown as Record<string, string>,
    ),
  }
}

/**
 * Official source URLs behind a page's browser facts, deduplicated.
 * @param slug - A How-to page slug.
 * @returns Each browser name with its source URLs.
 */
export function howToSources(
  slug: string,
): { browser: string; urls: readonly string[] }[] {
  const { from, to } = getHowToPage(slug)
  return [from, to].map((browser) => {
    const facts = BROWSER_FACTS[browser]
    const urls = new Set(sourcedFacts(facts).map(({ fact }) => fact.sourceUrl))
    return { browser: facts.name, urls: [...urls] }
  })
}
