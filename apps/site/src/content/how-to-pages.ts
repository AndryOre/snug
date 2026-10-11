import type { BrowserSlug } from './browser-facts'

/**
 * Task group a How-to page belongs to on the How-to index.
 */
type HowToGroup = 'move' | 'backup' | 'formats' | 'duplicates'

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
}
