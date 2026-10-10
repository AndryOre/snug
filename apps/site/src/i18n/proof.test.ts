import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { getClosingCopy } from './landing'
import { LOCALES } from './locales'
import { formatRatingsSentence, REVIEWS } from './proof'

const contentDocument = readFileSync(
  new URL('../../../../docs/landing/content.md', import.meta.url),
  'utf8',
)
  .replaceAll('\n>', '')
  .replaceAll(/\s+/g, ' ')

describe('social proof', () => {
  it('quotes every review exactly as the content document does', () => {
    expect(REVIEWS).toHaveLength(4)
    for (const review of REVIEWS) {
      expect(contentDocument).toContain(`"${review.quote}"`)
      expect(contentDocument).toContain(`${review.author}, ${review.date}`)
    }
  })

  it('formats the ratings date for the page locale', () => {
    expect(formatRatingsSentence('({date})', 'de')).toBe('(05.10.2026)')
    expect(formatRatingsSentence('({date})', 'en')).toBe('(Oct 5, 2026)')
  })

  it('carries the figures and closing copy in every locale', () => {
    for (const locale of LOCALES) {
      const { proof, faq, final, footer } = getClosingCopy(locale)
      expect(proof.numbers).toMatch(/5\D?000/)
      expect(proof.numbers).toContain('20')
      expect(proof.numbers).not.toContain('{date}')
      expect(proof.numbers).toMatch(/2026|26/)
      expect(proof.renameNote).toContain('Bookmark')
      expect(Object.keys(faq.items)).toHaveLength(12)
      expect(final.button.length).toBeGreaterThan(0)
      expect(footer.listing.length).toBeGreaterThan(0)
    }
  })
})
