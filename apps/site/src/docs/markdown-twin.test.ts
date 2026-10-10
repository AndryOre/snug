import { describe, expect, it } from 'vitest'

import {
  buildMarkdownTwin,
  markdownTwinPath,
  markdownTwinRoutes,
} from './markdown-twin'
import { PUBLISHED_SOURCES } from './published'

describe('buildMarkdownTwin', () => {
  it('puts the title back as the H1 above the body', () => {
    expect(buildMarkdownTwin('Exporting', '\nSome text.\n\n')).toBe(
      '# Exporting\n\nSome text.\n',
    )
  })
})

describe('markdownTwinPath', () => {
  it('appends .md in place of the trailing slash', () => {
    expect(markdownTwinPath('/guide/exporting/')).toBe('/guide/exporting.md')
    expect(markdownTwinPath('/es/guide/')).toBe('/es/guide.md')
  })
})

describe('markdownTwinRoutes', () => {
  const routes = markdownTwinRoutes()
  const slugs = routes.map((route) => route.slug)

  it('serves every published page in every locale', () => {
    expect(routes).toHaveLength(PUBLISHED_SOURCES.length * 10)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('uses unprefixed English and lowercase BCP 47 prefixes', () => {
    expect(slugs).toContain('guide/exporting')
    expect(slugs).toContain('es/guide/exporting')
    expect(slugs).toContain('pt-br/changelog')
    expect(slugs).toContain('zh-cn/guide')
  })
})
