import type { BrowserSlug } from './browser-facts'

/**
 * Task groups of the How-to index, in display order.
 */
export const HOW_TO_GROUPS = [
  'move',
  'backup',
  'formats',
  'duplicates',
] as const

/**
 * Task group a How-to page belongs to on the How-to index.
 */
export type HowToGroup = (typeof HOW_TO_GROUPS)[number]

/**
 * Export formats a How-to page can show a real sample of.
 */
export type HowToSampleFormat = 'csv' | 'json'

/**
 * What a How-to page declares about itself. Copy lives in
 * `src/content/how-to/<slug>/<locale>.json`.
 */
export interface HowToPageDefinition {
  group: HowToGroup
  /**
   * Browsers whose facts feed the page's placeholders as `from*` and `to*`.
   */
  from: BrowserSlug
  to: BrowserSlug
  /**
   * Published Guide page ids (see `PUBLISHED_SOURCES`), e.g. `guide/importing`.
   */
  relatedGuide: readonly string[]
  /**
   * Slugs of other How-to pages.
   */
  relatedHowTo: readonly string[]
  /**
   * Format of the real exporter output shown as a sample on the page, taken
   * from `src/content/how-to-samples/`.
   */
  sample?: HowToSampleFormat
}

/**
 * The curated How-to pages, in index order. Every slug needs English copy, or
 * the build fails.
 */
export const HOW_TO_PAGES: Record<string, HowToPageDefinition> = {
  'move-bookmarks-from-firefox-to-chrome': {
    group: 'move',
    from: 'firefox',
    to: 'chrome',
    relatedGuide: ['guide/importing', 'guide/duplicates'],
    relatedHowTo: [],
  },
  'move-bookmarks-from-safari-to-chrome': {
    group: 'move',
    from: 'safari',
    to: 'chrome',
    relatedGuide: ['guide/importing', 'guide/duplicates'],
    relatedHowTo: ['move-bookmarks-from-firefox-to-chrome'],
  },
  'move-bookmarks-from-chrome-to-edge': {
    group: 'move',
    from: 'chrome',
    to: 'edge',
    relatedGuide: ['guide/exporting', 'guide/importing'],
    relatedHowTo: ['move-bookmarks-from-firefox-to-chrome'],
  },
  'move-bookmarks-from-edge-to-chrome': {
    group: 'move',
    from: 'edge',
    to: 'chrome',
    relatedGuide: ['guide/exporting', 'guide/importing', 'guide/duplicates'],
    relatedHowTo: [
      'move-bookmarks-from-firefox-to-chrome',
      'move-bookmarks-from-chrome-to-brave',
    ],
  },
  'move-bookmarks-from-chrome-to-brave': {
    group: 'move',
    from: 'chrome',
    to: 'brave',
    relatedGuide: ['guide/exporting', 'guide/importing', 'guide/duplicates'],
    relatedHowTo: [
      'move-bookmarks-from-edge-to-chrome',
      'move-bookmarks-from-firefox-to-chrome',
    ],
  },
  'export-chrome-bookmarks-to-csv': {
    group: 'formats',
    from: 'chrome',
    to: 'chrome',
    relatedGuide: ['guide/exporting'],
    relatedHowTo: ['export-chrome-bookmarks-to-json'],
    sample: 'csv',
  },
  'export-chrome-bookmarks-to-json': {
    group: 'formats',
    from: 'chrome',
    to: 'chrome',
    relatedGuide: ['guide/exporting', 'guide/importing'],
    relatedHowTo: ['export-chrome-bookmarks-to-csv'],
    sample: 'json',
  },
}
