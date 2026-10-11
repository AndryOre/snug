/**
 * A fact the browser's official help pages carry. `'not-listed'` means the
 * checked help pages say nothing either way. It is never a claim that the
 * capability is absent.
 */
export type Listed<T> = T | 'not-listed'

/**
 * A value and the official help page it was read from.
 */
export interface SourcedFact<T> {
  value: T
  sourceUrl: string
}

export type BrowserSlug =
  'chrome' | 'edge' | 'brave' | 'opera' | 'firefox' | 'safari'

/**
 * Where a browser puts imported bookmarks. The wording lives in the shared
 * How-to copy, so each locale describes it in its own language.
 */
type ImportPlacement =
  'importedFolderOrBar' | 'favoritesBarFolder' | 'sidebarDatedFolder'

type ProfileOs = 'windows' | 'macos' | 'linux'

/**
 * One browser, as read from its official help pages on `verifiedOn`.
 * `versionChecked` is `'not-listed'` when the pages do not state a version.
 */
export interface BrowserFacts {
  name: string
  verifiedOn: string
  versionChecked: Listed<string>
  exportPath: Listed<SourcedFact<readonly string[]>>
  importPath: Listed<SourcedFact<readonly string[]>>
  importSources: Listed<SourcedFact<readonly string[]>>
  exportFileName: Listed<SourcedFact<string>>
  importPlacement: Listed<SourcedFact<ImportPlacement>>
  profileFolder: Record<ProfileOs, Listed<SourcedFact<string>>>
  htmlExportKeeps: Listed<SourcedFact<readonly string[]>>
  htmlExportDrops: Listed<SourcedFact<readonly string[]>>
}

const NOT_LISTED_PROFILE: BrowserFacts['profileFolder'] = {
  windows: 'not-listed',
  macos: 'not-listed',
  linux: 'not-listed',
}

const CHROME_BOOKMARKS_HELP = 'https://support.google.com/chrome/answer/96816'
const CHROMIUM_USER_DATA_DIR =
  'https://chromium.googlesource.com/chromium/src/+/main/docs/user_data_dir.md'
const FIREFOX_EXPORT_HELP =
  'https://support.mozilla.org/en-US/kb/export-firefox-bookmarks-to-backup-or-transfer'
const EDGE_IMPORT_HELP =
  'https://support.microsoft.com/en-us/topic/eb26f747-ab82-c8fb-ad3b-c227f99ba8a4'
const BRAVE_IMPORT_HELP =
  'https://support.brave.app/hc/en-us/articles/360019782291-How-do-I-import-or-export-browsing-data'
const OPERA_FEATURES_HELP = 'https://help.opera.com/en/latest/features/'
const SAFARI_BOOKMARKS_HELP =
  'https://help.apple.com/safari/mac/9.0/en.lproj/ibrw1015.html'

/**
 * Single source of browser facts for the How-to pages. Copy never states a
 * menu path or file name inline: it uses placeholders resolved from this
 * record. Re-verify against the official help pages and bump `verifiedOn`
 * before republishing.
 */
export const BROWSER_FACTS: Record<BrowserSlug, BrowserFacts> = {
  chrome: {
    name: 'Chrome',
    verifiedOn: '2026-10-11',
    versionChecked: 'not-listed',
    exportPath: {
      value: [
        'More',
        'Bookmarks and lists',
        'Bookmark Manager',
        'More',
        'Export Bookmarks',
      ],
      sourceUrl: CHROME_BOOKMARKS_HELP,
    },
    importPath: {
      value: ['More', 'Bookmarks and lists', 'Import bookmarks and settings'],
      sourceUrl: CHROME_BOOKMARKS_HELP,
    },
    importSources: {
      value: ['Bookmarks HTML file'],
      sourceUrl: CHROME_BOOKMARKS_HELP,
    },
    exportFileName: 'not-listed',
    importPlacement: {
      value: 'importedFolderOrBar',
      sourceUrl: CHROME_BOOKMARKS_HELP,
    },
    profileFolder: {
      windows: {
        value: String.raw`%LOCALAPPDATA%\Google\Chrome\User Data\Default`,
        sourceUrl: CHROMIUM_USER_DATA_DIR,
      },
      macos: {
        value: '~/Library/Application Support/Google/Chrome/Default',
        sourceUrl: CHROMIUM_USER_DATA_DIR,
      },
      linux: {
        value: '~/.config/google-chrome/Default',
        sourceUrl: CHROMIUM_USER_DATA_DIR,
      },
    },
    htmlExportKeeps: 'not-listed',
    htmlExportDrops: 'not-listed',
  },
  edge: {
    name: 'Edge',
    verifiedOn: '2026-10-11',
    versionChecked: 'not-listed',
    exportPath: 'not-listed',
    importPath: {
      value: [
        'Settings and more',
        'Settings',
        'Profiles',
        'Import browser data',
      ],
      sourceUrl: EDGE_IMPORT_HELP,
    },
    importSources: {
      value: ['Google Chrome', 'IE11', 'Favorites or bookmarks HTML file'],
      sourceUrl: EDGE_IMPORT_HELP,
    },
    exportFileName: 'not-listed',
    importPlacement: {
      value: 'favoritesBarFolder',
      sourceUrl: EDGE_IMPORT_HELP,
    },
    profileFolder: NOT_LISTED_PROFILE,
    htmlExportKeeps: 'not-listed',
    htmlExportDrops: 'not-listed',
  },
  brave: {
    name: 'Brave',
    verifiedOn: '2026-10-11',
    versionChecked: 'not-listed',
    exportPath: 'not-listed',
    importPath: {
      value: ['Main menu', 'Bookmarks', 'Import Bookmarks and Settings'],
      sourceUrl: BRAVE_IMPORT_HELP,
    },
    importSources: 'not-listed',
    exportFileName: 'not-listed',
    importPlacement: 'not-listed',
    profileFolder: NOT_LISTED_PROFILE,
    htmlExportKeeps: 'not-listed',
    htmlExportDrops: 'not-listed',
  },
  opera: {
    name: 'Opera',
    verifiedOn: '2026-10-11',
    versionChecked: 'not-listed',
    exportPath: {
      value: ['Bookmarks', 'import/export button', 'export'],
      sourceUrl: OPERA_FEATURES_HELP,
    },
    importPath: {
      value: ['Bookmarks', 'import/export button', 'import'],
      sourceUrl: OPERA_FEATURES_HELP,
    },
    importSources: 'not-listed',
    exportFileName: 'not-listed',
    importPlacement: 'not-listed',
    profileFolder: NOT_LISTED_PROFILE,
    htmlExportKeeps: 'not-listed',
    htmlExportDrops: 'not-listed',
  },
  firefox: {
    name: 'Firefox',
    verifiedOn: '2026-10-11',
    versionChecked: 'not-listed',
    exportPath: {
      value: [
        'Bookmarks',
        'Manage bookmarks',
        'Import and Backup',
        'Export Bookmarks to HTML',
      ],
      sourceUrl: FIREFOX_EXPORT_HELP,
    },
    importPath: 'not-listed',
    importSources: 'not-listed',
    exportFileName: { value: 'bookmarks.html', sourceUrl: FIREFOX_EXPORT_HELP },
    importPlacement: 'not-listed',
    profileFolder: NOT_LISTED_PROFILE,
    htmlExportKeeps: 'not-listed',
    htmlExportDrops: 'not-listed',
  },
  safari: {
    name: 'Safari',
    verifiedOn: '2026-10-11',
    versionChecked: '9.0',
    exportPath: {
      value: ['File', 'Export Bookmarks'],
      sourceUrl: SAFARI_BOOKMARKS_HELP,
    },
    importPath: {
      value: ['File', 'Import From', 'Bookmarks HTML File'],
      sourceUrl: SAFARI_BOOKMARKS_HELP,
    },
    importSources: {
      value: ['Google Chrome', 'Firefox', 'Bookmarks HTML File'],
      sourceUrl: SAFARI_BOOKMARKS_HELP,
    },
    exportFileName: {
      value: 'Safari Bookmarks.html',
      sourceUrl: SAFARI_BOOKMARKS_HELP,
    },
    importPlacement: {
      value: 'sidebarDatedFolder',
      sourceUrl: SAFARI_BOOKMARKS_HELP,
    },
    profileFolder: NOT_LISTED_PROFILE,
    htmlExportKeeps: 'not-listed',
    htmlExportDrops: 'not-listed',
  },
}

/**
 * Every browser the facts module covers, in a stable order.
 */
export const BROWSER_SLUGS = Object.keys(BROWSER_FACTS) as BrowserSlug[]

/**
 * Every sourced fact of one browser, flattened for validation and for the
 * Sources list on a page.
 * @param facts - One browser's facts.
 * @returns Each sourced fact's label and value.
 */
export function sourcedFacts(
  facts: BrowserFacts,
): { label: string; fact: SourcedFact<unknown> }[] {
  const entries: [string, Listed<SourcedFact<unknown>>][] = [
    ['exportPath', facts.exportPath],
    ['importPath', facts.importPath],
    ['importSources', facts.importSources],
    ['exportFileName', facts.exportFileName],
    ['importPlacement', facts.importPlacement],
    ['htmlExportKeeps', facts.htmlExportKeeps],
    ['htmlExportDrops', facts.htmlExportDrops],
    ...(Object.entries(facts.profileFolder).map(([os, fact]) => [
      `profileFolder.${os}`,
      fact,
    ]) as [string, Listed<SourcedFact<unknown>>][]),
  ]
  return entries.flatMap(([label, fact]) =>
    fact === 'not-listed' ? [] : [{ label, fact }],
  )
}
