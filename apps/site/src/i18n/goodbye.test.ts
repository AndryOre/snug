import { describe, expect, it } from 'vitest'

import {
  GOODBYE_COPY_EN,
  GOODBYE_REASON_IDS,
  GOODBYE_REPLY_ACTIONS,
  getGoodbyeCopy,
  goodbyePath,
  goodbyeRedirectTarget,
  normalizeGoodbyeLang,
  parseGoodbyeParameters,
} from './goodbye'
import { LOCALES } from './locales'

describe('goodbye parameters', () => {
  it('reads valid values', () => {
    expect(parseGoodbyeParameters('?lang=pt_BR&v=2.2.0&ae=1')).toEqual({
      version: '2.2.0',
      language: 'pt_BR',
      scheduledBackups: true,
    })
    expect(parseGoodbyeParameters('?ae=0').scheduledBackups).toBe(false)
  })

  it('returns null for missing values', () => {
    expect(parseGoodbyeParameters('')).toEqual({
      version: null,
      language: null,
      scheduledBackups: null,
    })
  })

  it('drops values that are not valid', () => {
    const parsed = parseGoodbyeParameters(
      '?lang=<img src=x>&v=<script>alert(1)</script>&ae=yes',
    )
    expect(parsed).toEqual({
      version: null,
      language: null,
      scheduledBackups: null,
    })
    expect(parseGoodbyeParameters('?v=1.2.3.4.5').version).toBeNull()
    expect(parseGoodbyeParameters('?lang=xx').language).toBeNull()
  })
})

describe('goodbye language normalization', () => {
  it.each([
    ['pt-BR', 'pt_BR'],
    ['PT_BR', 'pt_BR'],
    ['pt_br', 'pt_BR'],
    ['zh-cn', 'zh_CN'],
    ['ZH-CN', 'zh_CN'],
    ['ES', 'es'],
    ['en', 'en'],
  ])('maps %s to %s', (raw, expected) => {
    expect(normalizeGoodbyeLang(raw)).toBe(expected)
    expect(parseGoodbyeParameters(`?lang=${raw}`).language).toBe(expected)
  })

  it.each([null, '', 'xx', 'pt', 'pt--br', ' es', '<b>x</b>'])(
    'rejects %s',
    (raw) => {
      expect(normalizeGoodbyeLang(raw)).toBeNull()
    },
  )

  it('names the bookmarks permission in the English permissions reply', () => {
    expect(GOODBYE_COPY_EN.replies.permissions).toContain('bookmarks')
  })
})

describe('goodbye routing', () => {
  it('builds a path per locale', () => {
    expect(goodbyePath('en')).toBe('/goodbye/')
    expect(goodbyePath('pt_BR')).toBe('/pt-br/goodbye/')
  })

  it('redirects the English page to the lang locale and keeps the query', () => {
    expect(goodbyeRedirectTarget('en', '?lang=es&v=2.2.0&ae=1')).toBe(
      '/es/goodbye/?lang=es&v=2.2.0&ae=1',
    )
  })

  it('stays when there is nothing to switch to', () => {
    expect(goodbyeRedirectTarget('en', '')).toBeNull()
    expect(goodbyeRedirectTarget('en', '?lang=en')).toBeNull()
    expect(goodbyeRedirectTarget('en', '?lang=nope')).toBeNull()
    expect(goodbyeRedirectTarget('es', '?lang=de')).toBeNull()
  })
})

describe('goodbye copy', () => {
  it('has a reply, a label and actions for every reason', () => {
    for (const id of GOODBYE_REASON_IDS) {
      expect(GOODBYE_COPY_EN.reasons[id].length).toBeGreaterThan(0)
      expect(GOODBYE_COPY_EN.replies[id].length).toBeGreaterThan(0)
      expect(GOODBYE_REPLY_ACTIONS[id]).toBeDefined()
    }
  })

  it('has a translation for every locale but English', () => {
    expect(getGoodbyeCopy('en')).toBe(GOODBYE_COPY_EN)
    const translated = LOCALES.filter((entry) => entry !== 'en')
    expect(translated).toHaveLength(LOCALES.length - 1)
    expect(
      translated.every((locale) => getGoodbyeCopy(locale) !== GOODBYE_COPY_EN),
    ).toBe(true)
  })

  it('keeps the English shape and non-empty strings in every locale', () => {
    const shape = (value: unknown): unknown =>
      typeof value === 'string'
        ? 'string'
        : Object.fromEntries(
            Object.entries(value as Record<string, unknown>).map(
              ([key, child]) => [key, shape(child)],
            ),
          )
    const strings = (value: unknown): string[] =>
      typeof value === 'string'
        ? [value]
        : Object.values(value as Record<string, unknown>).flatMap((child) =>
            strings(child),
          )
    for (const locale of LOCALES) {
      const copy = getGoodbyeCopy(locale)
      expect(shape(copy)).toEqual(shape(GOODBYE_COPY_EN))
      for (const text of strings(copy)) {
        expect(text.trim().length).toBeGreaterThan(0)
      }
    }
  })

  it('keeps all three disclosure tokens in the template', () => {
    for (const locale of LOCALES) {
      for (const token of ['{version}', '{language}', '{backups}']) {
        expect(getGoodbyeCopy(locale).disclosure.template).toContain(token)
      }
    }
  })
})
