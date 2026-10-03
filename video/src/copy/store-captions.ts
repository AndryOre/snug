import { STORE_CAPTIONS, type StoreCaptions } from '../../../e2e-store/captions'
import type { Locale } from './locales'

/**
 * The store slide headlines and subtitles of a locale, straight from
 * `e2e-store/captions.ts`.
 */
export const storeCaptions = (locale: Locale): StoreCaptions => {
  const captions = STORE_CAPTIONS[locale]
  if (!captions) {
    throw new Error(`No store captions for locale "${locale}"`)
  }
  return captions
}
