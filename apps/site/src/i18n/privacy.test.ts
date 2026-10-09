import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { privacyPath, TRANSLATED_PRIVACY_LOCALES } from './privacy'

const siteRoot = path.resolve(import.meta.dirname, '../..')
const englishPolicy = readFileSync(
  path.join(siteRoot, '../../PRIVACY_POLICY.md'),
  'utf8',
)

function headingCounts(markdown: string): Record<number, number> {
  const counts: Record<number, number> = {}
  for (const match of markdown.matchAll(/^(#{1,6}) /gm)) {
    const level = (match[1] ?? '').length
    counts[level] = (counts[level] ?? 0) + 1
  }
  return counts
}

function englishLastUpdated(markdown: string): string | undefined {
  return /^Last updated: (.+)$/m.exec(markdown)?.[1]?.trim()
}

function recordedLastUpdated(markdown: string): string | undefined {
  return /^---\n[\s\S]*?^englishLastUpdated: (.+)$[\s\S]*?^---/m
    .exec(markdown)?.[1]
    ?.trim()
}

describe('privacyPath', () => {
  it('returns the localized path for a translated locale', () => {
    expect(privacyPath('es')).toBe('/es/privacy/')
  })

  it('returns the English path for English', () => {
    expect(privacyPath('en')).toBe('/privacy/')
  })

  it('falls back to the English path for a locale with no file', () => {
    expect(privacyPath('de', new Set(['es']))).toBe('/privacy/')
  })

  it('lowercases the BCP 47 tag of a translated locale', () => {
    expect(privacyPath('pt_BR', new Set(['pt_BR']))).toBe('/pt-br/privacy/')
  })

  it('never lists English as translated', () => {
    expect(TRANSLATED_PRIVACY_LOCALES.has('en')).toBe(false)
    expect(TRANSLATED_PRIVACY_LOCALES.has('es')).toBe(true)
  })
})

describe('privacy translations', () => {
  it('reads the English date and headings from PRIVACY_POLICY.md', () => {
    expect(englishLastUpdated(englishPolicy)).toBeTruthy()
    expect(Object.keys(headingCounts(englishPolicy)).length).toBeGreaterThan(1)
  })

  for (const locale of TRANSLATED_PRIVACY_LOCALES) {
    describe(`${locale} translation`, () => {
      const translation = readFileSync(
        path.join(siteRoot, `src/content/privacy/${locale}.md`),
        'utf8',
      )

      it('records the English "Last updated" date it was translated from', () => {
        expect(recordedLastUpdated(translation)).toBe(
          englishLastUpdated(englishPolicy),
        )
      })

      it('has the same number of headings at every level as the English policy', () => {
        expect(headingCounts(translation)).toEqual(headingCounts(englishPolicy))
      })
    })
  }
})
