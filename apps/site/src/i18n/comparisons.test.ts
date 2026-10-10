import { describe, expect, it } from 'vitest'

import { COMPETITORS } from '../content/competitors'
import {
  ALTERNATIVES_PATH,
  alternativesPath,
  COMPARISON_PAGE_LOCALES,
  COMPARISON_SLUGS,
  getComparisonContent,
  getComparisonMeta,
  interpolateComparison,
  loadComparisonContent,
  TRANSLATED_COMPARISON_LOCALES,
} from './comparisons'
import { LOCALES } from './locales'

const english = getComparisonContent('en')

function filesFor(entries: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(entries).map(([locale, content]) => [
      `../content/comparisons/${locale}.json`,
      { default: content },
    ]),
  ) as Parameters<typeof loadComparisonContent>[0]
}

describe('loadComparisonContent', () => {
  it('loads English alone', () => {
    const loaded = loadComparisonContent(filesFor({ en: english }))

    expect(Object.keys(loaded)).toEqual(['en'])
  })

  it('accepts a translation with the same keys', () => {
    const loaded = loadComparisonContent(filesFor({ en: english, es: english }))

    expect(Object.keys(loaded).toSorted((a, b) => a.localeCompare(b))).toEqual([
      'en',
      'es',
    ])
  })

  it('throws on a missing key', () => {
    const sharedWithoutTldr = Object.fromEntries(
      Object.entries(english.shared).filter(([key]) => key !== 'tldr'),
    )
    const drifted = { ...english, shared: sharedWithoutTldr }

    expect(() =>
      loadComparisonContent(filesFor({ en: english, es: drifted })),
    ).toThrow(/"es".*shared\.tldr/)
  })

  it('throws on an unexpected key', () => {
    const drifted = {
      ...english,
      shared: { ...english.shared, extra: 'x' },
    }

    expect(() =>
      loadComparisonContent(filesFor({ en: english, de: drifted })),
    ).toThrow(/unexpected \[shared\.extra\]/)
  })

  it('throws when the English source is absent', () => {
    expect(() => loadComparisonContent(filesFor({ es: english }))).toThrow(
      /English/,
    )
  })

  it('throws on a file that is not a locale', () => {
    expect(() =>
      loadComparisonContent(filesFor({ en: english, xx: english })),
    ).toThrow(/xx/)
  })
})

describe('comparison locales', () => {
  it('lists English first and never as translated', () => {
    expect(COMPARISON_PAGE_LOCALES[0]).toBe('en')
    expect(TRANSLATED_COMPARISON_LOCALES.has('en')).toBe(false)
  })

  it('lists every translated locale among the page locales', () => {
    for (const locale of TRANSLATED_COMPARISON_LOCALES) {
      expect(COMPARISON_PAGE_LOCALES).toContain(locale)
    }
    expect(COMPARISON_PAGE_LOCALES.length).toBe(
      TRANSLATED_COMPARISON_LOCALES.size + 1,
    )
  })
})

describe('COMPARISON_SLUGS', () => {
  it('lists exactly the competitors flagged for a comparison page', () => {
    const flagged = Object.entries(COMPETITORS)
      .filter(([, facts]) => facts.comparisonPage)
      .map(([slug]) => slug)

    expect([...COMPARISON_SLUGS]).toEqual(flagged)
    expect(COMPARISON_SLUGS).toHaveLength(3)
  })
})

describe('alternativesPath', () => {
  it('returns the Alternatives page with a trailing slash', () => {
    expect(alternativesPath('en')).toBe('/alternatives/')
    expect(ALTERNATIVES_PATH).toBe('/alternatives/')
  })

  it('returns a comparison page with a trailing slash', () => {
    expect(alternativesPath('en', 'maple-backup')).toBe(
      '/alternatives/maple-backup/',
    )
  })

  it('prefixes a translated locale with its lowercase tag', () => {
    expect(alternativesPath('pt_BR', '101-export', new Set(['pt_BR']))).toBe(
      '/pt-br/alternatives/101-export/',
    )
    expect(alternativesPath('es', undefined, new Set(['es']))).toBe(
      '/es/alternatives/',
    )
  })

  it('falls back to English for an untranslated locale', () => {
    expect(alternativesPath('de', 'maple-backup', new Set(['es']))).toBe(
      '/alternatives/maple-backup/',
    )
    expect(alternativesPath('ja', undefined, new Set())).toBe('/alternatives/')
  })
})

describe('interpolateComparison', () => {
  it('formats users with the locale grouping', () => {
    expect(
      interpolateComparison('{users} users', 'en', { users: 10_000 }),
    ).toBe('10,000 users')
    expect(
      interpolateComparison('{users} Nutzer', 'de', { users: 10_000 }),
    ).toBe('10.000 Nutzer')
  })

  it('formats the rating with one decimal', () => {
    expect(interpolateComparison('{rating}', 'en', { rating: 4 })).toBe('4.0')
    expect(interpolateComparison('{rating}', 'de', { rating: 4.8 })).toBe('4,8')
  })

  it('formats the date in UTC for the locale', () => {
    expect(interpolateComparison('{date}', 'en', { date: '2026-10-10' })).toBe(
      'October 10, 2026',
    )
    expect(interpolateComparison('{date}', 'de', { date: '2026-10-10' })).toBe(
      '10. Oktober 2026',
    )
    expect(
      interpolateComparison('{date}', 'pt_BR', { date: '2026-10-10' }),
    ).toBe('10 de outubro de 2026')
  })

  it('substitutes every occurrence and passes names through', () => {
    expect(
      interpolateComparison('Pick {name}. {name}!', 'en', { name: 'Maple' }),
    ).toBe('Pick Maple. Maple!')
  })

  it('fills the history months placeholder the 101 Export copy uses', () => {
    expect(
      interpolateComparison('{historyMonths} months', 'en', {
        historyMonths: 3,
      }),
    ).toBe('3 months')
  })

  it('throws on a placeholder without a value', () => {
    expect(() => interpolateComparison('{users}', 'en', {})).toThrow(/users/)
  })
})

describe('getComparisonMeta', () => {
  it('resolves the date placeholder from the competitor facts', () => {
    const meta = getComparisonMeta('en', 'maple-backup')

    expect(meta.title).toBe('Snug vs Maple Backup | Snug')
    expect(meta.description).toContain('Checked October 10, 2026.')
    expect(meta.description).not.toContain('{')
  })

  it('resolves the Alternatives page', () => {
    const meta = getComparisonMeta('en', 'alternatives')

    expect(meta.description).not.toContain('{')
  })

  it('falls back to English copy for an untranslated locale', () => {
    const untranslated = LOCALES.find(
      (locale) => !COMPARISON_PAGE_LOCALES.includes(locale),
    )
    if (!untranslated) return

    expect(getComparisonMeta(untranslated, 'alternatives')).toEqual(
      getComparisonMeta('en', 'alternatives'),
    )
  })
})

describe('bundled files', () => {
  it('has copy for every locale, falling back to English', () => {
    for (const locale of LOCALES) {
      expect(getComparisonContent(locale)).toBeDefined()
    }
  })
})
