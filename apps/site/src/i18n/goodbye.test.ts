import { describe, expect, it } from 'vitest'

import {
  GOODBYE_COPY_EN,
  GOODBYE_REASON_IDS,
  GOODBYE_REPLY_ACTIONS,
  getGoodbyeCopy,
  goodbyePath,
  goodbyeRedirectTarget,
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

  it('falls back to English for every locale until translated', () => {
    for (const locale of LOCALES) {
      expect(getGoodbyeCopy(locale)).toBe(GOODBYE_COPY_EN)
    }
  })

  it('keeps all three disclosure tokens in the template', () => {
    for (const token of ['{version}', '{language}', '{backups}']) {
      expect(GOODBYE_COPY_EN.disclosure.template).toContain(token)
    }
  })
})
