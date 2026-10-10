import { type Locale, localePath } from '../i18n/locales'

/**
 * One repository file the Guide or What's new serves.
 */
export interface PublishedSource {
  /**
  Starlight entry id, and the route below the locale prefix.
   */
  id: string
  /**
  Path relative to the repository root, using `/`.
   */
  sourcePath: string
  /**
  `changelog` goes through the release notes parser.
   */
  kind: 'markdown' | 'changelog'
}

/**
 * The allowlist of repository files the site publishes, in sidebar order.
 * Nothing outside it is read into the site.
 */
export const PUBLISHED_SOURCES: readonly PublishedSource[] = [
  { id: 'guide', sourcePath: 'docs/usage.md', kind: 'markdown' },
  {
    id: 'guide/exporting',
    sourcePath: 'docs/guide/exporting.md',
    kind: 'markdown',
  },
  {
    id: 'guide/importing',
    sourcePath: 'docs/guide/importing.md',
    kind: 'markdown',
  },
  {
    id: 'guide/duplicates',
    sourcePath: 'docs/guide/duplicates.md',
    kind: 'markdown',
  },
  {
    id: 'guide/settings',
    sourcePath: 'docs/guide/settings.md',
    kind: 'markdown',
  },
  {
    id: 'guide/auto-export',
    sourcePath: 'docs/guide/auto-export.md',
    kind: 'markdown',
  },
  { id: 'changelog', sourcePath: 'CHANGELOG.md', kind: 'changelog' },
]

/**
 * Looks a repository path up in the allowlist.
 * @param sourcePath - Path relative to the repository root, using `/`.
 * @returns The published source, or `undefined` when it is not published.
 */
export function findPublishedSource(
  sourcePath: string,
): PublishedSource | undefined {
  return PUBLISHED_SOURCES.find((source) => source.sourcePath === sourcePath)
}

/**
 * Site route of a published source for a locale.
 * @param source - A published source.
 * @param locale - Locale whose route prefix applies.
 * @returns Path with leading and trailing slashes, e.g. `/es/guide/exporting/`.
 */
export function publishedRoute(
  source: PublishedSource,
  locale: Locale,
): string {
  return localePath(locale, `/${source.id}/`)
}
