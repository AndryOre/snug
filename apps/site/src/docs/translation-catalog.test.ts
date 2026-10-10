import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { LOCALES } from '../i18n/locales'
import {
  buildCatalogEntry,
  buildLocalizedPage,
  loadLocalizedCatalog,
} from './catalog'
import { TRANSLATIONS_DIRECTORY } from './paths'
import { findPublishedSource, PUBLISHED_SOURCES } from './published'
import { countHeadings, hashSource } from './translations'

const ENGLISH = '# Settings\n\nBody.\n\n## Section\n\nMore.\n'

function settingsSource() {
  const source = findPublishedSource('docs/guide/settings.md')
  if (!source) throw new Error('settings.md must be published')
  return source
}

function translation(sourceHash: string): string {
  return `---\ntitle: Ajustes\nsourceHash: ${sourceHash}\n---\nCuerpo.\n\n## Sección\n\nMás.\n`
}

describe('buildLocalizedPage', () => {
  it('uses a translation whose hash matches the English source', () => {
    const page = buildLocalizedPage(
      settingsSource(),
      ENGLISH,
      'es',
      translation(hashSource(ENGLISH)),
    )
    expect(page).toMatchObject({
      id: 'es/guide/settings',
      title: 'Ajustes',
      status: 'translated',
      englishPath: '/guide/settings/',
    })
    expect(page.body).toContain('Cuerpo.')
    expect(page.editUrl).toBe(
      'https://github.com/AndryOre/snug/edit/main/apps/site/src/content/translations/es/docs/guide/settings.md',
    )
  })

  it('renders the English text for a stale translation', () => {
    const page = buildLocalizedPage(
      settingsSource(),
      ENGLISH,
      'pt_BR',
      translation('0000000000000000'),
    )
    expect(page).toMatchObject({
      id: 'pt-br/guide/settings',
      title: 'Settings',
      status: 'stale',
    })
    expect(page.body).toContain('Body.')
  })

  it('renders the English text when a locale has no translation', () => {
    const page = buildLocalizedPage(settingsSource(), ENGLISH, 'ja', undefined)
    expect(page).toMatchObject({ id: 'ja/guide/settings', status: 'missing' })
    expect(page.body).toContain('Body.')
  })

  it('never marks English as outstanding', () => {
    const page = buildLocalizedPage(settingsSource(), ENGLISH, 'en', undefined)
    expect(page).toMatchObject({ id: 'guide/settings', status: 'translated' })
  })

  it('keeps links of a fallback page inside its own locale', () => {
    const page = buildLocalizedPage(
      settingsSource(),
      '# Settings\n\nSee [Importing](importing.md).\n',
      'de',
      undefined,
    )
    expect(page.body).toContain('(/de/guide/importing/)')
  })
})

describe('the real translations', () => {
  const pages = loadLocalizedCatalog()

  it('builds a page for every locale and published source', () => {
    expect(pages).toHaveLength(PUBLISHED_SOURCES.length * LOCALES.length)
  })

  it('has no translation file outside the published allowlist', () => {
    for (const locale of LOCALES) {
      const folder = path.join(TRANSLATIONS_DIRECTORY, locale)
      if (!existsSync(folder)) continue
      const files = readdirSync(folder, { recursive: true, encoding: 'utf8' })
        .filter((file) => file.endsWith('.md'))
        .map((file) => file.replaceAll(path.sep, '/'))
      for (const file of files) {
        expect(findPublishedSource(file), `${locale}/${file}`).toBeDefined()
      }
    }
  })

  it('has no stale translation, so English changes fail CI until retranslated', () => {
    const stale = pages
      .filter((page) => page.status === 'stale')
      .map((page) => `${page.locale}/${page.sourcePath}`)
    expect(stale).toEqual([])
  })

  it('keeps the heading count of the English source in every translation', () => {
    const translated = pages.filter((item) => item.status === 'translated')
    for (const page of translated) {
      const english = pages.find(
        (item) => item.locale === 'en' && item.sourcePath === page.sourcePath,
      )
      expect(
        countHeadings(page.body),
        `${page.locale}/${page.sourcePath}`,
      ).toBe(countHeadings(english?.body ?? ''))
    }
  })
})

describe('buildCatalogEntry', () => {
  it('rewrites links with the locale it is given', () => {
    const entry = buildCatalogEntry(
      settingsSource(),
      '# Settings\n\nSee [Importing](importing.md).\n',
      'es',
    )
    expect(entry.body).toContain('(/es/guide/importing/)')
  })
})
