import { getContent, type SiteContent } from './content'
import type { Locale } from './locales'

/**
 * Keys of the bento cards, in display order.
 */
export const BENTO_KEYS = ['export', 'import', 'backup', 'popup'] as const

/**
 * Copy for the bento cards of one locale.
 */
export type BentoCopy = SiteContent['landing']['bento']

/**
 * Bento card copy for one locale.
 * @param locale - A supported locale code.
 * @returns Title and sentence of each card.
 */
export function getBentoCopy(locale: Locale): BentoCopy {
  return getContent(locale).landing.bento
}

/**
 * Card titles in display order, used as the JSON-LD `featureList`.
 * @param locale - A supported locale code.
 * @returns The four bento titles.
 */
export function bentoTitles(locale: Locale): string[] {
  const copy = getBentoCopy(locale)
  return BENTO_KEYS.map((key) => copy[key].title)
}
