import { STORE_FACTS } from '../seo/store-facts'

/**
 * A fact read from a store listing. `'not-listed'` means the listing carries
 * no evidence either way. It is never a claim that the capability is absent.
 */
type Listed<T> = T | 'not-listed'

/**
 * One competitor, as read from its live Chrome Web Store listing on
 * `verifiedOn`. Every field in the record is dated by that single date.
 */
export interface CompetitorFacts {
  name: string
  developer: Listed<string>
  storeUrl: string
  verifiedOn: string
  userCount: number
  ratingValue: number
  ratingCount: number
  version: string
  lastUpdated: string
  languageCount: Listed<number>
  exportFormats: Listed<readonly string[]>
  import: Listed<readonly string[]>
  chooseFolders: true | 'not-listed'
  schedule: true | 'not-listed'
  cloudCopies: true | 'not-listed'
  browsers: Listed<readonly string[]>
  dataDisclosure: 'none-declared' | Listed<readonly string[]>
  historyLimitMonths?: number
  comparisonPage: boolean
}

export type CompetitorSlug =
  | 'selective-bookmarks-export-tool'
  | 'maple-backup'
  | '101-export'
  | 'export-selective-bookmarks'
  | 'bookmarks-exporter'
  | 'bookmark-folder-import-export'

const CWS_DETAIL_URL = 'https://chromewebstore.google.com/detail/'

/**
 * Single source of competitor facts for the Alternatives and Comparison pages.
 * Re-verify against the live listing and bump `verifiedOn` before republishing.
 */
export const COMPETITORS: Record<CompetitorSlug, CompetitorFacts> = {
  'selective-bookmarks-export-tool': {
    name: 'Selective Bookmarks Export Tool',
    developer: 'no.web.developer',
    storeUrl: `${CWS_DETAIL_URL}dkbihgadoohejmlhpffffbmbhmkhjbfi`,
    verifiedOn: '2026-10-10',
    userCount: 10_000,
    ratingValue: 4.8,
    ratingCount: 48,
    version: '1.7.0',
    lastUpdated: '2026-10-03',
    languageCount: 3,
    exportFormats: ['HTML'],
    import: 'not-listed',
    chooseFolders: true,
    schedule: 'not-listed',
    cloudCopies: 'not-listed',
    browsers: ['Chrome', 'Firefox', 'Edge'],
    dataDisclosure: 'none-declared',
    comparisonPage: true,
  },
  'maple-backup': {
    name: 'Maple Backup — Bookmark Snapshots',
    developer: 'The Maple Project',
    storeUrl: `${CWS_DETAIL_URL}eocfcfklbhdgkilphhkcpcgaollminlf`,
    verifiedOn: '2026-10-10',
    userCount: 7000,
    ratingValue: 4,
    ratingCount: 57,
    version: '5.2',
    lastUpdated: '2026-09-21',
    languageCount: 15,
    exportFormats: 'not-listed',
    import: 'not-listed',
    chooseFolders: 'not-listed',
    schedule: true,
    cloudCopies: true,
    browsers: 'not-listed',
    dataDisclosure: [
      'Personally identifiable information',
      'Authentication information',
      'Website content',
    ],
    comparisonPage: true,
  },
  '101-export': {
    name: '101 Export History/Bookmarks to JSON/CSV*/XLS*',
    developer: 'json-xls.com',
    storeUrl: `${CWS_DETAIL_URL}dcoegfodcnjofhjfbhegcgjgapeichlf`,
    verifiedOn: '2026-10-10',
    userCount: 30_000,
    ratingValue: 3.1,
    ratingCount: 71,
    version: '3.2',
    lastUpdated: '2026-10-07',
    languageCount: 1,
    historyLimitMonths: 3,
    exportFormats: ['JSON'],
    import: 'not-listed',
    chooseFolders: 'not-listed',
    schedule: 'not-listed',
    cloudCopies: 'not-listed',
    browsers: 'not-listed',
    dataDisclosure: 'none-declared',
    comparisonPage: true,
  },
  'export-selective-bookmarks': {
    name: 'Export Selective Bookmarks',
    developer: 'aninymous',
    storeUrl: `${CWS_DETAIL_URL}ahgbiciilcpclcekhegbhofljoolnfei`,
    verifiedOn: '2026-10-10',
    userCount: 5000,
    ratingValue: 4.2,
    ratingCount: 48,
    version: '2.1',
    lastUpdated: '2026-06-30',
    languageCount: 'not-listed',
    exportFormats: ['HTML'],
    import: 'not-listed',
    chooseFolders: true,
    schedule: 'not-listed',
    cloudCopies: 'not-listed',
    browsers: 'not-listed',
    dataDisclosure: 'not-listed',
    comparisonPage: false,
  },
  'bookmarks-exporter': {
    name: 'Bookmarks Exporter',
    developer: 'oneryx',
    storeUrl: `${CWS_DETAIL_URL}kagpmnfgpdecdkbhongbgkgppnpimime`,
    verifiedOn: '2026-10-10',
    userCount: 2000,
    ratingValue: 5,
    ratingCount: 7,
    version: '0.0.1',
    lastUpdated: '2022-08-22',
    languageCount: 1,
    exportFormats: ['JSON', 'CSV'],
    import: 'not-listed',
    chooseFolders: 'not-listed',
    schedule: 'not-listed',
    cloudCopies: 'not-listed',
    browsers: 'not-listed',
    dataDisclosure: 'none-declared',
    comparisonPage: false,
  },
  'bookmark-folder-import-export': {
    name: 'Bookmark Folder Import & Export',
    developer: 'not-listed',
    storeUrl: `${CWS_DETAIL_URL}hlekobkphkpjboojcnppegljiepgoaao`,
    verifiedOn: '2026-10-10',
    userCount: 487,
    ratingValue: 5,
    ratingCount: 1,
    version: '3.4.0',
    lastUpdated: '2026-04-21',
    languageCount: 1,
    exportFormats: ['TXT', 'CSV'],
    import: ['TXT', 'CSV'],
    chooseFolders: true,
    schedule: 'not-listed',
    cloudCopies: 'not-listed',
    browsers: 'not-listed',
    dataDisclosure: ['Website content'],
    comparisonPage: false,
  },
}

/**
 * Slugs that get their own Comparison page under `/alternatives/`.
 */
export const COMPARISON_PAGE_SLUGS = (
  Object.keys(COMPETITORS) as CompetitorSlug[]
).filter((slug) => COMPETITORS[slug].comparisonPage)

/**
 * Snug's own facts. Users, rating and license come from `STORE_FACTS`; formats,
 * import sources and language count are read from the extension code
 * (`apps/extension/lib/export-formats.ts`, `lib/importers`, `locales`).
 */
export const SNUG_FACTS = {
  name: STORE_FACTS.name,
  storeUrl: `${CWS_DETAIL_URL}gdhpeilfkeeajillmcncaelnppiakjhn`,
  verifiedOn: '2026-10-10',
  userCount: STORE_FACTS.userCount,
  ratingValue: STORE_FACTS.ratingValue,
  ratingCount: STORE_FACTS.ratingCount,
  license: STORE_FACTS.license,
  version: '2.2.0',
  lastUpdated: '2026-10-10',
  languageCount: 10,
  exportFormats: ['HTML', 'JSON', 'CSV', 'Markdown', 'OPML', 'XBEL'],
  import: [
    'HTML',
    'JSON',
    'CSV',
    'XBEL',
    'Chrome bookmarks file',
    'Safari export',
  ],
  chooseFolders: true,
  schedule: true,
} as const

/**
 * The browser's own bookmark export, as a baseline for comparison tables.
 */
export const BUILT_IN_EXPORT = {
  name: 'Browser built-in export',
  verifiedOn: '2026-10-10',
  exportFormats: ['HTML'],
  import: ['HTML'],
} as const
