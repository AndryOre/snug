import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { parseChangelog, renderReleaseNotesMarkdown } from './release-notes'

const changelog = readFileSync(
  path.resolve(import.meta.dirname, '../../../../CHANGELOG.md'),
  'utf8',
)

describe('parseChangelog', () => {
  it('parses every version of the real changelog newest first', () => {
    const entries = parseChangelog(changelog)
    const headingVersions = changelog
      .matchAll(/^## \[(\d+\.\d+\.\d+)\]/gm)
      .map((match) => match[1])
      .toArray()

    expect(entries.map((entry) => entry.version)).toEqual(headingVersions)
    expect(entries.at(-1)).toMatchObject({
      version: '0.1.0',
      isoDate: '2024-08-03',
    })
    expect(entries.every((entry) => entry.body.length > 0)).toBe(true)
  })

  it('orders entries newest first even when the source is ascending', () => {
    const entries = parseChangelog(
      '## [0.9.0] - 2024-01-01\n\n- a\n\n## [0.10.0] - 2024-02-01\n\n- b\n',
    )
    expect(entries.map((entry) => entry.version)).toEqual(['0.10.0', '0.9.0'])
  })

  it('ignores the preamble and skips Unreleased', () => {
    const entries = parseChangelog(
      '# Changelog\n\nIntro.\n\n## [Unreleased]\n\n- soon\n\n## [1.0.0] - 2024-01-01\n\n- ok\n',
    )
    expect(entries).toEqual([
      { version: '1.0.0', isoDate: '2024-01-01', body: '- ok' },
    ])
  })

  it('throws naming the line for a malformed release heading', () => {
    const source =
      '# Changelog\n\n## [1.0.0] - 2024-01-01\n\n- a\n\n## [1.1] - 2024-02-01\n'
    expect(() => parseChangelog(source)).toThrow(
      /line 7: malformed release heading "## \[1\.1\] - 2024-02-01"/,
    )
  })

  it('throws for an impossible date', () => {
    expect(() => parseChangelog('## [1.0.0] - 2024-13-45\n')).toThrow(
      /line 1: invalid release date/,
    )
  })

  it('keeps nested bullets and inline links unchanged', () => {
    const body =
      '- Top with [a link](https://example.com/x?y=1) and `code`\n  - nested item\n    - deeper'
    const [entry] = parseChangelog(`## [1.0.0] - 2024-01-01\n\n${body}\n`)
    expect(entry?.body).toBe(body)
  })
})

describe('renderReleaseNotesMarkdown', () => {
  it('renders one H2 per version with a date line and verbatim bullets', () => {
    const entries = parseChangelog(changelog)
    const rendered = renderReleaseNotesMarkdown(entries)

    expect(rendered.match(/^## /gm)).toHaveLength(entries.length)
    expect(rendered).toContain('## 2.1.0\n\n2026-10-08\n\n- Import got')
    for (const entry of entries) expect(rendered).toContain(entry.body)
  })
})
