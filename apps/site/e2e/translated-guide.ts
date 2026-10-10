import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { DEFAULT_LOCALE, type Locale, LOCALES } from '../src/i18n/locales'

const CONTENT_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../src/content',
)

const GUIDE_PAGE = 'docs/guide/exporting.md'

const NON_DEFAULT_LOCALES = LOCALES.filter(
  (locale) => locale !== DEFAULT_LOCALE,
)

/**
 * The title a locale's translation of a Guide page declares.
 * @param locale - The locale whose translation is read.
 * @param page - The page path under the locale's translations directory.
 * @returns The frontmatter title, or null when the page is not translated.
 */
export function translatedTitle(
  locale: Locale,
  page: string = GUIDE_PAGE,
): string | null {
  const file = path.join(CONTENT_DIR, 'translations', locale, page)
  if (!existsSync(file)) return null
  const title = /^title:\s*(.+)$/m.exec(readFileSync(file, 'utf8'))?.[1]
  return title === undefined
    ? null
    : title.trim().replaceAll(/^["']|["']$/g, '')
}

/**
 * Locales other than English whose Guide has no translation yet.
 */
export const UNTRANSLATED_LOCALES = NON_DEFAULT_LOCALES.filter(
  (locale) => translatedTitle(locale) === null,
)

/**
 * Locales other than English whose Guide is translated.
 */
export const TRANSLATED_LOCALES = NON_DEFAULT_LOCALES.filter(
  (locale) => translatedTitle(locale) !== null,
)

/**
 * A string from a locale's docs block in its content JSON.
 * @param locale - The locale whose content file is read.
 * @param key - The key inside the docs block.
 * @returns The translated string.
 */
export function docsString(locale: Locale, key: string): string {
  const content = JSON.parse(
    readFileSync(path.join(CONTENT_DIR, `${locale}.json`), 'utf8'),
  ) as { docs: Record<string, string> }
  const value = content.docs[key]
  if (value === undefined) {
    throw new Error(`Missing docs string "${key}" for locale ${locale}`)
  }
  return value
}
