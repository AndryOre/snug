import type { Loader } from 'astro/loaders'

import { loadAllContent, type SiteContent } from '../i18n/content'
import { languageTag, LOCALES } from '../i18n/locales'

const QUERY_PLACEHOLDER = '{query}'
const PAGEFIND_QUERY_PLACEHOLDER = '[SEARCH_TERM]'

/**
 * Pagefind's message for a search without results, built from the locale's
 * no-results sentence and hint in the content JSON.
 * @param copy - The locale's `docsSearch` content.
 * @returns The sentence pair, with Pagefind's own query placeholder.
 */
export function formatZeroResults(copy: SiteContent['docsSearch']): string {
  return `${copy.noResults} ${copy.hint}`.replaceAll(
    QUERY_PLACEHOLDER,
    () => PAGEFIND_QUERY_PLACEHOLDER,
  )
}

/**
 * Feeds Starlight's `i18n` collection from the site's content JSON, so the
 * Pagefind dialog's copy is localized next to the rest of the Website's
 * copy. Built-in Starlight strings stay for every key it does not set.
 * @returns A loader with one entry per locale, keyed by BCP 47 tag.
 */
export function chromeTranslationsLoader(): Loader {
  return {
    name: 'chrome-translations-loader',
    async load({ store, parseData }) {
      const content = loadAllContent()
      for (const locale of LOCALES) {
        const id = languageTag(locale)
        const data = await parseData({
          id,
          data: {
            'pagefind.zero_results': formatZeroResults(
              content[locale].docsSearch,
            ),
          },
        })
        store.set({ id, data })
      }
    },
  }
}
