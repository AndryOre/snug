import path from 'node:path'

import { DEFAULT_LOCALE, type Locale } from '../i18n/locales'
import { githubViewUrl } from './paths'
import { findPublishedSource, publishedRoute } from './published'

/**
 * Anchors of the pre-split `docs/usage.md`, each mapped to the published file
 * that now holds that section. Old links such as `usage.md#export-formats`
 * keep landing on the right page.
 */
export const LEGACY_USAGE_ANCHORS: Readonly<Record<string, string>> = {
  'opening-the-app': 'docs/usage.md',
  'exporting-bookmarks': 'docs/guide/exporting.md',
  'export-formats': 'docs/guide/exporting.md',
  'progress-and-cancel': 'docs/guide/exporting.md',
  'naming-exported-files': 'docs/guide/exporting.md',
  'importing-bookmarks': 'docs/guide/importing.md',
  'import-selection': 'docs/guide/importing.md',
  'import-batch': 'docs/guide/importing.md',
  'import-sources': 'docs/guide/importing.md',
  'the-safety-snapshot-and-undo': 'docs/guide/importing.md',
  'finding-duplicates': 'docs/guide/duplicates.md',
  settings: 'docs/guide/settings.md',
  'auto-export': 'docs/guide/auto-export.md',
}

const USAGE_SOURCE_PATH = 'docs/usage.md'
const EXTERNAL_HREF = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i

/**
 * Where a link was found and which locale is being rendered.
 */
export interface LinkContext {
  /**
  Repository path of the file containing the link.
   */
  sourcePath: string
  /**
  Locale of the page being rendered. Defaults to English.
   */
  locale?: Locale
}

/**
 * Rewrites one markdown link target found in a published source. Published
 * files become localized site routes, old `usage.md` anchors become the pages
 * that now hold them, any other repository file becomes a GitHub URL, and
 * absolute URLs, same-page anchors and targets outside the repository stay as
 * written.
 * @param href - The link target exactly as written in the markdown.
 * @param context - Source file and locale of the page.
 * @returns The rewritten target.
 */
export function rewriteLink(href: string, context: LinkContext): string {
  if (href === '' || href.startsWith('#') || EXTERNAL_HREF.test(href)) {
    return href
  }
  const hashIndex = href.indexOf('#')
  const target = hashIndex === -1 ? href : href.slice(0, hashIndex)
  const fragment = hashIndex === -1 ? '' : href.slice(hashIndex)
  if (target === '') return href

  const resolved = path.posix.normalize(
    path.posix.join(path.posix.dirname(context.sourcePath), target),
  )
  if (resolved === '..' || resolved.startsWith('../')) return href
  const repoPath = resolved.replace(/\/$/, '')

  const legacyPath =
    repoPath === USAGE_SOURCE_PATH
      ? LEGACY_USAGE_ANCHORS[fragment.slice(1)]
      : undefined
  const source = findPublishedSource(legacyPath ?? repoPath)
  return source
    ? `${publishedRoute(source, context.locale ?? DEFAULT_LOCALE)}${fragment}`
    : `${githubViewUrl(repoPath, target.endsWith('/'))}${fragment}`
}

/**
 * Resolves an anchor of the pre-split usage guide to the site route that now
 * holds it.
 * @param anchor - Anchor without the `#`, e.g. `export-formats`.
 * @param locale - Locale whose route prefix applies. Defaults to English.
 * @returns The route with the anchor, or `undefined` for an unknown anchor.
 */
export function legacyAnchorRoute(
  anchor: string,
  locale: Locale = DEFAULT_LOCALE,
): string | undefined {
  const sourcePath = LEGACY_USAGE_ANCHORS[anchor]
  const source = sourcePath ? findPublishedSource(sourcePath) : undefined
  return source ? `${publishedRoute(source, locale)}#${anchor}` : undefined
}
