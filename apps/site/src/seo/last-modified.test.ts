import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { lastCommitDate } from './last-modified'

const outsideGit = mkdtempSync(path.join(tmpdir(), 'snug-no-git-'))

const passedDates = JSON.stringify({
  'src/content/en.json': '2026-09-01',
  'src/content/es.json': '2026-10-02',
  'src/content/standalone/privacy.json': '2026-08-15',
  'src/pages/privacy.astro': '2026-09-20',
  '../../PRIVACY_POLICY.md': '2026-07-04',
})

describe('lastCommitDate without git history', () => {
  it('reads each source from the passed dates, keeping them distinct', () => {
    const options = { cwd: outsideGit, passedDates }

    expect(lastCommitDate(['src/content/en.json'], options)).toBe('2026-09-01')
    expect(lastCommitDate(['src/content/es.json'], options)).toBe('2026-10-02')
  })

  it('takes the newest date across a source group, directories included', () => {
    const options = { cwd: outsideGit, passedDates }

    expect(
      lastCommitDate(
        [
          'src/content/standalone',
          'src/pages/privacy.astro',
          '../../PRIVACY_POLICY.md',
        ],
        options,
      ),
    ).toBe('2026-09-20')
  })

  it('does not match a directory against a sibling with the same prefix', () => {
    const options = {
      cwd: outsideGit,
      passedDates: JSON.stringify({ 'src/content/standalone-x': '2026-10-01' }),
    }

    expect(lastCommitDate(['src/content/standalone'], options)).toBeUndefined()
  })

  it('omits the date when nothing was passed', () => {
    expect(
      lastCommitDate(['src/content/en.json'], {
        cwd: outsideGit,
        passedDates: undefined,
      }),
    ).toBeUndefined()
    expect(
      lastCommitDate(['src/content/en.json'], {
        cwd: outsideGit,
        passedDates: '',
      }),
    ).toBeUndefined()
  })

  it('ignores malformed passed dates instead of failing the build', () => {
    expect(
      lastCommitDate(['src/content/en.json'], {
        cwd: outsideGit,
        passedDates: 'not json',
      }),
    ).toBeUndefined()
    expect(
      lastCommitDate(['src/content/en.json'], {
        cwd: outsideGit,
        passedDates: JSON.stringify({ 'src/content/en.json': 'yesterday' }),
      }),
    ).toBeUndefined()
  })
})
