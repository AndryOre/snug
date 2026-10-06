import { readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import {
  hreflangAlternates,
  languageTag,
  LOCALE_CONFIG,
  localePath,
  LOCALES,
} from './locales'

describe('locales', () => {
  it.each(LOCALES)('%s carries a direction', (locale) => {
    expect(['ltr', 'rtl']).toContain(LOCALE_CONFIG[locale].dir)
  })

  it('skips the font preload only for CJK locales', () => {
    const skipped = LOCALES.filter(
      (locale) => LOCALE_CONFIG[locale].preloadFonts.length === 0,
    )
    expect(skipped).toEqual(['ja', 'ko', 'zh_CN'])
  })

  it('preloads Geist Cyrillic for ru and Space Grotesk latin for Latin locales', () => {
    expect(LOCALE_CONFIG.ru.preloadFonts).toEqual(['geist-cyrillic'])
    expect(LOCALE_CONFIG.en.preloadFonts).toEqual(['space-grotesk-latin'])
    expect(LOCALE_CONFIG.pt_BR.preloadFonts).toEqual(['space-grotesk-latin'])
  })

  it('matches the extension locale files', () => {
    const directory = fileURLToPath(
      new URL('../../../extension/locales', import.meta.url),
    )
    const codes = readdirSync(directory).map((file) =>
      file.replace('.json', ''),
    )
    expect(LOCALES.toSorted((a, b) => a.localeCompare(b))).toEqual(
      codes.toSorted((a, b) => a.localeCompare(b)),
    )
  })

  it('serves English at the root and others under their own path', () => {
    expect(localePath('en')).toBe('/')
    expect(localePath('es')).toBe('/es/')
    expect(localePath('pt_BR')).toBe('/pt-br/')
    expect(localePath('zh_CN')).toBe('/zh-cn/')
  })

  it('maps codes to BCP 47 tags', () => {
    expect(languageTag('pt_BR')).toBe('pt-BR')
    expect(languageTag('ja')).toBe('ja')
  })

  it('lists all ten alternates plus x-default', () => {
    const alternates = hreflangAlternates()
    expect(alternates).toHaveLength(11)
    expect(alternates.at(-1)).toEqual({
      hreflang: 'x-default',
      href: 'https://snug.andryore.dev/',
    })
    expect(alternates.find((entry) => entry.hreflang === 'pt-BR')?.href).toBe(
      'https://snug.andryore.dev/pt-br/',
    )
  })
})
