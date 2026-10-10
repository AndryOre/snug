import { describe, expect, it } from 'vitest'

import { LEGACY_USAGE_ANCHORS, legacyAnchorRoute, rewriteLink } from './links'
import { rewriteMarkdownLinks, splitLeadingHeading } from './markdown'
import { findPublishedSource } from './published'

const fromOverview = { sourcePath: 'docs/usage.md' }
const fromGuidePage = { sourcePath: 'docs/guide/importing.md' }

describe('rewriteLink', () => {
  it('turns published docs into site routes', () => {
    expect(rewriteLink('guide/exporting.md', fromOverview)).toBe(
      '/guide/exporting/',
    )
    expect(rewriteLink('settings.md', fromGuidePage)).toBe('/guide/settings/')
    expect(rewriteLink('../usage.md', fromGuidePage)).toBe('/guide/')
  })

  it('keeps the fragment of a published page', () => {
    expect(
      rewriteLink('importing.md#the-safety-snapshot-and-undo', fromGuidePage),
    ).toBe('/guide/importing/#the-safety-snapshot-and-undo')
  })

  it('localizes routes for another locale', () => {
    expect(rewriteLink('settings.md', { ...fromGuidePage, locale: 'de' })).toBe(
      '/de/guide/settings/',
    )
  })

  it('sends non-published repository files to GitHub', () => {
    expect(rewriteLink('../architecture.md#storage', fromGuidePage)).toBe(
      'https://github.com/AndryOre/snug/blob/main/docs/architecture.md#storage',
    )
    expect(rewriteLink('../../CHANGELOG.md', fromGuidePage)).toBe('/changelog/')
    expect(rewriteLink('security.md', fromOverview)).toBe(
      'https://github.com/AndryOre/snug/blob/main/docs/security.md',
    )
    expect(rewriteLink('adr/', fromOverview)).toBe(
      'https://github.com/AndryOre/snug/tree/main/docs/adr',
    )
  })

  it('maps old usage anchors to the page that now holds them', () => {
    expect(
      rewriteLink('usage.md#export-formats', { sourcePath: 'docs/x.md' }),
    ).toBe('/guide/exporting/#export-formats')
    expect(
      rewriteLink('docs/usage.md#import-sources', { sourcePath: 'README.md' }),
    ).toBe('/guide/importing/#import-sources')
    expect(
      rewriteLink('usage.md#opening-the-app', { sourcePath: 'docs/x.md' }),
    ).toBe('/guide/#opening-the-app')
  })

  it('leaves external, same-page and out-of-repository links alone', () => {
    for (const href of [
      'https://example.com/a.md',
      'mailto:a@b.c',
      '//cdn.example.com/x',
      '#section',
      '../../../outside.md',
      '',
    ]) {
      expect(rewriteLink(href, fromGuidePage)).toBe(href)
    }
  })
})

describe('legacy usage anchors', () => {
  it('resolves every legacy anchor to a published route', () => {
    for (const anchor of Object.keys(LEGACY_USAGE_ANCHORS)) {
      expect(legacyAnchorRoute(anchor)).toMatch(/^\/guide\/.*#/)
    }
    expect(legacyAnchorRoute('import-batch', 'es')).toBe(
      '/es/guide/importing/#import-batch',
    )
    expect(legacyAnchorRoute('nope')).toBeUndefined()
  })

  it('only points at allowlisted files', () => {
    for (const sourcePath of Object.values(LEGACY_USAGE_ANCHORS)) {
      expect(findPublishedSource(sourcePath)).toBeDefined()
    }
  })
})

describe('rewriteMarkdownLinks', () => {
  it('rewrites inline and reference links but not code', () => {
    const markdown = [
      'See [one](settings.md) and [two](../architecture.md "Title").',
      '',
      '`[code](settings.md)`',
      '',
      '```md',
      '[fenced](settings.md)',
      '```',
      '',
      '[ref]: settings.md#x',
    ].join('\n')
    expect(rewriteMarkdownLinks(markdown, fromGuidePage)).toBe(
      [
        'See [one](/guide/settings/) and [two](https://github.com/AndryOre/snug/blob/main/docs/architecture.md "Title").',
        '',
        '`[code](settings.md)`',
        '',
        '```md',
        '[fenced](settings.md)',
        '```',
        '',
        '[ref]: /guide/settings/#x',
      ].join('\n'),
    )
  })
})

describe('splitLeadingHeading', () => {
  it('returns the H1 text and the remaining body', () => {
    expect(splitLeadingHeading('# Finding `dupes`\n\nBody\n')).toEqual({
      title: 'Finding dupes',
      body: 'Body\n',
    })
  })

  it('reports a missing H1', () => {
    expect(splitLeadingHeading('Body')).toEqual({
      title: undefined,
      body: 'Body',
    })
  })
})
