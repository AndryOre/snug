import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { DOCS_UI } from '../i18n/docs-ui'
import { languageTag, type Locale, localePath, LOCALES } from '../i18n/locales'
import { rewriteMarkdownLinks, splitLeadingHeading } from './markdown'
import {
  githubEditUrl,
  REPOSITORY_ROOT,
  TRANSLATIONS_DIRECTORY,
  TRANSLATIONS_REPOSITORY_PATH,
} from './paths'
import { PUBLISHED_SOURCES, type PublishedSource } from './published'
import { parseChangelog, renderReleaseNotesMarkdown } from './release-notes'
import {
  classifyTranslation,
  hashSource,
  parseTranslation,
  type TranslationStatus,
} from './translations'

/**
 * One page of the Guide or What's new, ready for the content store.
 */
export interface CatalogEntry {
  id: string
  title: string
  body: string
  editUrl: string
  sourcePath: string
}

/**
 * One page of the Guide or What's new in one locale. A missing or stale
 * translation carries the English text, so every locale has every page.
 */
export interface LocalizedPage extends CatalogEntry {
  locale: Locale
  status: TranslationStatus
  englishHash: string
  englishPath: string
}

/**
 * Reads a locale's translation file of a published source, or returns
 * `undefined` when that locale has none.
 */
export type TranslationReader = (
  locale: Locale,
  sourcePath: string,
) => string | undefined

/**
 * Reads a published file's text.
 */
export type SourceReader = (sourcePath: string) => string

/**
 * Reads a file below the repository root.
 * @param sourcePath - Path relative to the repository root, using `/`.
 * @returns The file's UTF-8 text.
 */
function readRepoSource(sourcePath: string): string {
  return readFileSync(path.join(REPOSITORY_ROOT, sourcePath), 'utf8')
}

/**
 * Builds the catalog entry of one published source: the title comes from the
 * leading H1 (What's new takes the site's own title, since its page is
 * generated), and relative links are rewritten to site routes or GitHub.
 * @param source - A published source.
 * @param markdown - The raw contents of its file.
 * @param locale - Locale whose route prefix the rewritten links use.
 * Defaults to English.
 * @returns The page with its title, rewritten body and edit URL.
 * @throws {Error} When a Guide page has no leading H1.
 */
export function buildCatalogEntry(
  source: PublishedSource,
  markdown: string,
  locale: Locale = 'en',
): CatalogEntry {
  const editUrl = githubEditUrl(source.sourcePath)
  const context = { sourcePath: source.sourcePath, locale }
  if (source.kind === 'changelog') {
    const notes = renderReleaseNotesMarkdown(parseChangelog(markdown))
    return {
      id: source.id,
      title: DOCS_UI.whatsNew,
      body: rewriteMarkdownLinks(notes, context),
      editUrl,
      sourcePath: source.sourcePath,
    }
  }
  const { title, body } = splitLeadingHeading(markdown)
  if (!title) {
    throw new Error(`${source.sourcePath} has no leading "# " heading`)
  }
  return {
    id: source.id,
    title,
    body: rewriteMarkdownLinks(body, context),
    editUrl,
    sourcePath: source.sourcePath,
  }
}

/**
 * Builds every page of the Guide and What's new, in allowlist order.
 * @param readSource - Reads a file by repository path. Defaults to the
 * repository checkout.
 * @returns One entry per published source.
 */
export function loadCatalog(
  readSource: SourceReader = readRepoSource,
): CatalogEntry[] {
  return PUBLISHED_SOURCES.map((source) =>
    buildCatalogEntry(source, readSource(source.sourcePath)),
  )
}

function readTranslationFile(
  locale: Locale,
  sourcePath: string,
): string | undefined {
  const file = path.join(TRANSLATIONS_DIRECTORY, locale, sourcePath)
  return existsSync(file) ? readFileSync(file, 'utf8') : undefined
}

/**
 * Builds one locale's page of a published source. A translation whose
 * `sourceHash` matches the English source is used; a missing or stale one
 * renders the English text, so no locale ever lacks a page.
 * @param source - A published source.
 * @param englishMarkdown - The raw contents of its English file.
 * @param locale - The locale to build.
 * @param translationText - The locale's translation file, if it has one.
 * @returns The page with its status and the English hash it was checked
 * against.
 * @throws {MalformedTranslationError} When the translation's frontmatter is
 * unusable.
 */
export function buildLocalizedPage(
  source: PublishedSource,
  englishMarkdown: string,
  locale: Locale,
  translationText: string | undefined,
): LocalizedPage {
  const english = buildCatalogEntry(source, englishMarkdown, locale)
  const englishHash = hashSource(englishMarkdown)
  const englishPath = localePath('en', `/${source.id}/`)
  if (locale === 'en') {
    return {
      ...english,
      locale,
      status: 'translated',
      englishHash,
      englishPath,
    }
  }
  const translation =
    translationText === undefined
      ? undefined
      : parseTranslation(translationText, `${locale}/${source.sourcePath}`)
  const status = classifyTranslation(translation, englishHash)
  const id = `${languageTag(locale).toLowerCase()}/${source.id}`
  if (translation && status === 'translated') {
    return {
      id,
      title: translation.title,
      body: rewriteMarkdownLinks(translation.body, {
        sourcePath: source.sourcePath,
        locale,
      }),
      editUrl: githubEditUrl(
        `${TRANSLATIONS_REPOSITORY_PATH}/${locale}/${source.sourcePath}`,
      ),
      sourcePath: source.sourcePath,
      locale,
      status,
      englishHash,
      englishPath,
    }
  }
  return { ...english, id, locale, status, englishHash, englishPath }
}

/**
 * Builds every page of the Guide and What's new for every locale.
 * @param readSource - Reads an English file by repository path. Defaults to
 * the repository checkout.
 * @param readTranslation - Reads a locale's translation of a source. Defaults
 * to the site's translations folder.
 * @returns One page per published source and locale, English first.
 * @throws {MalformedTranslationError} When a translation is unusable.
 */
export function loadLocalizedCatalog(
  readSource: SourceReader = readRepoSource,
  readTranslation: TranslationReader = readTranslationFile,
): LocalizedPage[] {
  return PUBLISHED_SOURCES.flatMap((source) => {
    const englishMarkdown = readSource(source.sourcePath)
    return LOCALES.map((locale) =>
      buildLocalizedPage(
        source,
        englishMarkdown,
        locale,
        locale === 'en'
          ? undefined
          : readTranslation(locale, source.sourcePath),
      ),
    )
  })
}
