import { describe, expect, it } from 'vitest'

import { LOCALES } from '../i18n/locales'
import { OG_IMAGE, ogLocale, ogLocaleAlternates } from './open-graph'

describe('ogLocale', () => {
  it.each([
    ['en', 'en_US'],
    ['es', 'es_ES'],
    ['de', 'de_DE'],
    ['fr', 'fr_FR'],
    ['it', 'it_IT'],
    ['ja', 'ja_JP'],
    ['ko', 'ko_KR'],
    ['pt_BR', 'pt_BR'],
    ['ru', 'ru_RU'],
    ['zh_CN', 'zh_CN'],
  ] as const)('maps %s to %s', (locale, expected) => {
    expect(ogLocale(locale)).toBe(expected)
  })

  it('gives every locale a distinct Open Graph code', () => {
    const codes = LOCALES.map((entry) => ogLocale(entry))
    expect(new Set(codes).size).toBe(LOCALES.length)
  })
})

describe('ogLocaleAlternates', () => {
  it.each(LOCALES)('%s lists every other locale and never itself', (locale) => {
    const alternates = ogLocaleAlternates(locale)
    expect(alternates).toHaveLength(LOCALES.length - 1)
    expect(alternates).not.toContain(ogLocale(locale))
  })
})

describe('OG_IMAGE', () => {
  it('declares the dimensions and type of the shipped PNG cards', () => {
    expect(OG_IMAGE).toEqual({ width: 1200, height: 630, type: 'image/png' })
  })
})
