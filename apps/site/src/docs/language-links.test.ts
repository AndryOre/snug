import { describe, expect, it } from 'vitest'

import { localePath } from '../i18n/locales'
import { documentationLanguageHref } from './language-links'

function alternate(hreflang: string, path: string) {
  return {
    tag: 'link',
    attrs: {
      rel: 'alternate',
      hreflang,
      href: `https://snug.andryore.dev${path}`,
    },
  }
}

const head = [
  { tag: 'meta', attrs: { name: 'description', content: 'x' } },
  alternate('en', '/guide/exporting/'),
  alternate('es', '/es/guide/exporting/'),
  alternate('pt-BR', '/pt-br/guide/exporting/'),
]

describe('documentationLanguageHref', () => {
  const href = documentationLanguageHref(head, (locale) =>
    localePath(locale, '/guide/'),
  )

  it('keeps the reader on the same page in the target locale', () => {
    expect(href('en')).toBe('/guide/exporting/')
    expect(href('es')).toBe('/es/guide/exporting/')
    expect(href('pt_BR')).toBe('/pt-br/guide/exporting/')
  })

  it('falls back when a locale has no alternate', () => {
    expect(href('de')).toBe('/de/guide/')
  })
})
