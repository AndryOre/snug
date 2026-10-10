import { readFileSync } from 'node:fs'
import path from 'node:path'

import { DOCS_UI } from '../i18n/docs-ui'
import { rewriteMarkdownLinks, splitLeadingHeading } from './markdown'
import { githubEditUrl, REPOSITORY_ROOT } from './paths'
import { PUBLISHED_SOURCES, type PublishedSource } from './published'
import { parseChangelog, renderReleaseNotesMarkdown } from './release-notes'

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
 * @returns The page with its title, rewritten body and edit URL.
 * @throws {Error} When a Guide page has no leading H1.
 */
export function buildCatalogEntry(
  source: PublishedSource,
  markdown: string,
): CatalogEntry {
  const editUrl = githubEditUrl(source.sourcePath)
  const context = { sourcePath: source.sourcePath }
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
