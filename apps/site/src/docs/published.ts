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
  /**
  English meta description, 155 characters at most. A translation carries its
  own in frontmatter.
   */
  description: string
  /**
  English `<title>` and `og:title`, without the site suffix and 53 characters
  at most. The visible H1 stays the page title.
   */
  seoTitle: string
}

/**
 * The allowlist of repository files the site publishes, in sidebar order.
 * Nothing outside it is read into the site.
 */
export const PUBLISHED_SOURCES: readonly PublishedSource[] = [
  {
    id: 'guide',
    sourcePath: 'docs/usage.md',
    kind: 'markdown',
    seoTitle: 'How to Use Snug: Bookmark Export and Import Guide',
    description:
      'Open the Snug app, then follow the guide pages for exporting, importing, finding duplicates, settings and scheduled auto-export.',
  },
  {
    id: 'guide/exporting',
    sourcePath: 'docs/guide/exporting.md',
    kind: 'markdown',
    seoTitle: 'Export Chrome Bookmarks to HTML, JSON, CSV and More',
    description:
      'Export your Chrome bookmarks as HTML, JSON, CSV, Markdown, OPML or XBEL. Export everything from the popup or choose exactly what to include in the app.',
  },
  {
    id: 'guide/importing',
    sourcePath: 'docs/guide/importing.md',
    kind: 'markdown',
    seoTitle: 'Import Bookmarks into Chrome from a File',
    description:
      'Import bookmarks from a file into Chrome. Preview the tree first, pick Create folder, Restore merge or Restore replace, and skip ones you have.',
  },
  {
    id: 'guide/duplicates',
    sourcePath: 'docs/guide/duplicates.md',
    kind: 'markdown',
    seoTitle: 'Find and Remove Duplicate Chrome Bookmarks',
    description:
      'Scan your bookmarks for copies that share the same normalized URL, keep the one you want and delete the rest from the Duplicates page.',
  },
  {
    id: 'guide/settings',
    sourcePath: 'docs/guide/settings.md',
    kind: 'markdown',
    seoTitle: 'Snug Settings: Theme, Import Mode, Safety Snapshot',
    description:
      'Set the theme, bookmark tree display and default import mode on the Snug Settings page, and see how the Safety snapshot card fits in.',
  },
  {
    id: 'guide/auto-export',
    sourcePath: 'docs/guide/auto-export.md',
    kind: 'markdown',
    seoTitle: 'Schedule Automatic Bookmark Exports in Chrome',
    description:
      'Schedule automatic bookmark exports in Chrome. Pick formats, an interval and a folder, and Snug saves the files with no save dialog.',
  },
  {
    id: 'guide/faq',
    sourcePath: 'docs/guide/faq.md',
    kind: 'markdown',
    seoTitle: 'Snug FAQ: Formats, Browsers, Safety and Backups',
    description:
      'Answers to common questions about Snug: overwriting bookmarks, supported formats and browsers, safety, backup folders and cost.',
  },
  {
    id: 'changelog',
    sourcePath: 'CHANGELOG.md',
    kind: 'changelog',
    seoTitle: "What's New in Snug: Release Notes and Changelog",
    description:
      'Release notes for the Snug Chrome extension: what changed in every version, from new Auto-export options to fixes and improvements.',
  },
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
