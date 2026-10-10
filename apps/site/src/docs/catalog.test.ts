import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { buildCatalogEntry, loadCatalog } from './catalog'
import {
  findPublishedSource,
  PUBLISHED_SOURCES,
  publishedRoute,
} from './published'
import { buildSidebar, readSidebarLabels } from './sidebar'

const repoRoot = path.resolve(import.meta.dirname, '../../../..')

describe('published allowlist', () => {
  it('lists exactly the usage overview, the five area pages and the changelog', () => {
    expect(PUBLISHED_SOURCES.map((source) => source.sourcePath)).toEqual([
      'docs/usage.md',
      'docs/guide/exporting.md',
      'docs/guide/importing.md',
      'docs/guide/duplicates.md',
      'docs/guide/settings.md',
      'docs/guide/auto-export.md',
      'CHANGELOG.md',
    ])
  })

  it('does not publish files outside the allowlist', () => {
    expect(findPublishedSource('docs/architecture.md')).toBeUndefined()
    expect(findPublishedSource('docs/guide/../security.md')).toBeUndefined()
  })

  it('serves every locale from its own prefix', () => {
    const exporting = findPublishedSource('docs/guide/exporting.md')
    expect(exporting && publishedRoute(exporting, 'en')).toBe(
      '/guide/exporting/',
    )
    expect(exporting && publishedRoute(exporting, 'pt_BR')).toBe(
      '/pt-br/guide/exporting/',
    )
  })

  it('has every published file on disk', () => {
    for (const source of PUBLISHED_SOURCES) {
      expect(() =>
        readFileSync(path.join(repoRoot, source.sourcePath), 'utf8'),
      ).not.toThrow()
    }
  })
})

describe('buildCatalogEntry', () => {
  it('takes the title from the leading H1 and drops it from the body', () => {
    const source = findPublishedSource('docs/guide/settings.md')
    if (!source) throw new Error('settings.md must be published')
    const entry = buildCatalogEntry(
      source,
      '# Settings\n\nSee [Importing](importing.md#import-batch).\n',
    )
    expect(entry.title).toBe('Settings')
    expect(entry.body).toBe(
      'See [Importing](/guide/importing/#import-batch).\n',
    )
    expect(entry.editUrl).toBe(
      'https://github.com/AndryOre/snug/edit/main/docs/guide/settings.md',
    )
  })

  it('fails when a Guide page has no H1', () => {
    const source = findPublishedSource('docs/guide/settings.md')
    if (!source) throw new Error('settings.md must be published')
    expect(() => buildCatalogEntry(source, 'No heading here.')).toThrow(
      /no leading/,
    )
  })

  it('renders the changelog as release notes', () => {
    const source = findPublishedSource('CHANGELOG.md')
    if (!source) throw new Error('CHANGELOG.md must be published')
    const entry = buildCatalogEntry(
      source,
      '# Changelog\n\n## [1.0.0] - 2024-01-01\n\n- See [usage](docs/usage.md).\n',
    )
    expect(entry.title).toBe("What's new")
    expect(entry.body).toContain('## 1.0.0')
    expect(entry.body).toContain('[usage](/guide/)')
  })
})

describe('loadCatalog', () => {
  it('builds all seven pages from the real repository files', () => {
    const entries = loadCatalog()
    expect(entries.map((entry) => entry.id)).toEqual([
      'guide',
      'guide/exporting',
      'guide/importing',
      'guide/duplicates',
      'guide/settings',
      'guide/auto-export',
      'changelog',
    ])
    expect(entries.every((entry) => entry.body.length > 0)).toBe(true)
    expect(entries[0]?.body).toContain('(/guide/exporting/)')
  })

  it('leaves no relative markdown links behind', () => {
    for (const entry of loadCatalog()) {
      expect(entry.body).not.toMatch(/\]\((?!https?:|\/|#)[^)]*\.md/)
    }
  })
})

describe('buildSidebar', () => {
  it("orders the Guide group and What's new", () => {
    const sidebar = buildSidebar()
    expect(sidebar).toHaveLength(2)
    const [group, whatsNew] = sidebar
    expect(group && 'items' in group && group.items).toMatchObject([
      { label: 'Overview', slug: 'guide' },
      { label: 'Exporting', slug: 'guide/exporting' },
      { label: 'Importing', slug: 'guide/importing' },
      { label: 'Duplicates', slug: 'guide/duplicates' },
      { label: 'Settings', slug: 'guide/settings' },
      { label: 'Auto-export', slug: 'guide/auto-export' },
    ])
    expect(whatsNew).toMatchObject({ label: "What's new", slug: 'changelog' })
  })

  it('carries a label translation for every non-English locale', () => {
    const [group] = buildSidebar()
    expect(
      Object.keys(group?.translations ?? {}).toSorted((a, b) =>
        a.localeCompare(b),
      ),
    ).toEqual(
      ['de', 'es', 'fr', 'it', 'ja', 'ko', 'pt-BR', 'ru', 'zh-CN'].toSorted(
        (a, b) => a.localeCompare(b),
      ),
    )
    expect(Object.keys(readSidebarLabels())).toHaveLength(10)
  })
})
