import { describe, expect, it } from 'vitest'

import { loadLocalizedCatalog, type LocalizedPage } from './catalog'
import { formatStatusReport } from './status'

function readSource(sourcePath: string): string {
  return sourcePath === 'CHANGELOG.md'
    ? '# Changelog\n\n## [1.0.0] - 2024-01-01\n\n- First.\n'
    : '# Settings\n\nBody.\n'
}

function pagesWith(translations: Record<string, string>): LocalizedPage[] {
  return loadLocalizedCatalog(
    readSource,
    (locale, sourcePath) => translations[`${locale}/${sourcePath}`],
  )
}

describe('formatStatusReport', () => {
  it('reports every non-English locale with its outstanding pages', () => {
    const report = formatStatusReport(pagesWith({}))
    expect(report).toContain('es: 7 missing, 0 stale, 0 up to date')
    expect(report).toContain('  missing docs/guide/settings.md')
    expect(report).not.toContain('en:')
  })

  it('counts a matching translation as up to date', () => {
    const [english] = pagesWith({})
    const hash = english?.englishHash ?? ''
    const report = formatStatusReport(
      pagesWith({
        'es/docs/usage.md': `---\ntitle: Uso\nsourceHash: ${hash}\n---\nHola\n`,
      }),
    )
    expect(report).toContain('es: 6 missing, 0 stale, 1 up to date')
    expect(report.split('de:', 1)[0]).not.toContain('missing docs/usage.md')
  })

  it('lists a translation of changed English text as stale', () => {
    const report = formatStatusReport(
      pagesWith({
        'de/docs/usage.md':
          '---\ntitle: Nutzung\nsourceHash: 0000000000000000\n---\nHallo\n',
      }),
    )
    expect(report).toContain('de: 6 missing, 1 stale, 0 up to date')
    expect(report).toContain('  stale   docs/usage.md')
  })
})
