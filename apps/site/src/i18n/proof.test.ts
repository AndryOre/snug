import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { getClosingCopy } from './landing'
import { LOCALES } from './locales'
import { REVIEWS } from './proof'

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

  it('carries the figures and closing copy in every locale', () => {
    for (const locale of LOCALES) {
      const { proof, faq, final, footer } = getClosingCopy(locale)
      expect(proof.numbers).toMatch(/5\D?000/)
      expect(proof.numbers).toContain('20')
      expect(proof.numbers).toContain('2026-10-05')
      expect(proof.renameNote).toContain('Bookmark')
      expect(Object.keys(faq.items)).toHaveLength(11)
      expect(final.button.length).toBeGreaterThan(0)
      expect(footer.changelog.length).toBeGreaterThan(0)
    }
  })
})
