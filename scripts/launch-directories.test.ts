import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'

import {
  parseCsv,
  parseTracker,
  REQUIRED_COLUMNS,
  validateDirectoryTracker,
} from './launch-directories'

const REPO_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const TRACKER_PATH = path.join(REPO_ROOT, 'docs/launch/directories.csv')

const HEADER = REQUIRED_COLUMNS.join(',')

/**
 * Builds a tracker CSV with the required header and one row per entry,
 * defaulting every cell the validator ignores to an empty string.
 * @param rows Partial rows keyed by column name.
 * @returns The CSV text, header first.
 */
function buildTracker(rows: Record<string, string>[]): string {
  const lines = rows.map((row) =>
    REQUIRED_COLUMNS.map((column) => row[column] ?? '').join(','),
  )
  return [HEADER, ...lines].join('\n')
}

/**
 * Builds a valid directory row for the given Campaign tag.
 * @param tag The Campaign tag to embed in the row and its URLs.
 * @param overrides Cells to replace on the default row.
 * @returns A row keyed by column name.
 */
function directoryRow(
  tag: string,
  overrides: Record<string, string> = {},
): Record<string, string> {
  return {
    Directory: `Directory ${tag}`,
    URL: 'https://example.com/submit',
    Batch: '1',
    Language: 'EN',
    'Campaign Tag': tag,
    'Website URL': `https://snug.andryore.dev/?c=${tag}`,
    'Install URL': `https://snug.andryore.dev/install?c=${tag}`,
    'Positioning Variant Used': 'extension',
    ...overrides,
  }
}

describe('docs/launch/directories.csv', () => {
  const tracker = readFileSync(TRACKER_PATH, 'utf8')

  test('passes every tracker rule', () => {
    expect(validateDirectoryTracker(tracker)).toEqual([])
  })

  test('lists about 25 directories plus the reserved launch rows', () => {
    const rows = parseTracker(tracker)
    const directoryRows = rows.filter((row) => row['Batch'] !== '')
    expect(directoryRows.length).toBeGreaterThanOrEqual(20)
    expect(directoryRows.length).toBeLessThanOrEqual(30)
  })

  test('covers the reserved launch tags', () => {
    const tags = parseTracker(tracker).map((row) => row['Campaign Tag'])
    for (const reserved of ['producthunt', 'hn', 'x', 'youtube', 'github']) {
      expect(tags).toContain(reserved)
    }
    expect(tags.some((tag) => tag?.startsWith('reddit-'))).toBe(true)
  })
})

describe('validateDirectoryTracker', () => {
  test('accepts a valid directory row and a reserved row without a batch', () => {
    const csv = buildTracker([
      directoryRow('saashub'),
      directoryRow('producthunt', { Batch: '' }),
      directoryRow('reddit-SideProject', { Batch: '', 'Install URL': '' }),
    ])
    expect(validateDirectoryTracker(csv)).toEqual([])
  })

  test('reports a missing required column', () => {
    const csv = HEADER.replace(',Campaign Tag', '') + '\n'
    expect(validateDirectoryTracker(csv)).toContainEqual(
      expect.stringContaining('Campaign Tag'),
    )
  })

  test('rejects a Campaign tag that breaks the pattern', () => {
    for (const badTag of ['bad tag', 'a'.repeat(33), 'ñandú', 'a/b', '']) {
      const csv = buildTracker([directoryRow(badTag)])
      expect(validateDirectoryTracker(csv).length).toBeGreaterThan(0)
    }
  })

  test('rejects duplicate Campaign tags', () => {
    const csv = buildTracker([directoryRow('saashub'), directoryRow('saashub')])
    expect(validateDirectoryTracker(csv)).toContainEqual(
      expect.stringContaining('duplicate'),
    )
  })

  test('rejects a variant outside the fixed set', () => {
    const csv = buildTracker([
      directoryRow('saashub', { 'Positioning Variant Used': 'startup' }),
    ])
    expect(validateDirectoryTracker(csv)).toContainEqual(
      expect.stringContaining('variant'),
    )
  })

  test('requires a Batch between 1 and 3 on directory rows', () => {
    for (const badBatch of ['', '0', '4', 'x', '1.5']) {
      const csv = buildTracker([directoryRow('saashub', { Batch: badBatch })])
      expect(validateDirectoryTracker(csv)).toContainEqual(
        expect.stringContaining('Batch'),
      )
    }
  })

  test('allows an empty Batch only on reserved tags', () => {
    const csv = buildTracker([directoryRow('x', { Batch: '' })])
    expect(validateDirectoryTracker(csv)).toEqual([])
    const reserved = buildTracker([directoryRow('reddit-', { Batch: '' })])
    expect(validateDirectoryTracker(reserved).length).toBeGreaterThan(0)
  })

  test('rejects a Website URL whose c= differs from the tag', () => {
    const csv = buildTracker([
      directoryRow('saashub', {
        'Website URL': 'https://snug.andryore.dev/?c=other',
      }),
    ])
    expect(validateDirectoryTracker(csv)).toContainEqual(
      expect.stringContaining('Website URL'),
    )
  })

  test('rejects non-https and off-domain URLs', () => {
    const insecure = buildTracker([
      directoryRow('saashub', {
        'Website URL': ['http', 'snug.andryore.dev/?c=saashub'].join('://'),
      }),
    ])
    expect(validateDirectoryTracker(insecure).length).toBeGreaterThan(0)
    const offDomain = buildTracker([
      directoryRow('saashub', {
        'Website URL': 'https://example.com/?c=saashub',
      }),
    ])
    expect(validateDirectoryTracker(offDomain).length).toBeGreaterThan(0)
  })

  test('requires the Install redirect path and a matching c= when set', () => {
    const wrongPath = buildTracker([
      directoryRow('saashub', {
        'Install URL': 'https://snug.andryore.dev/?c=saashub',
      }),
    ])
    expect(validateDirectoryTracker(wrongPath)).toContainEqual(
      expect.stringContaining('Install URL'),
    )
    const wrongTag = buildTracker([
      directoryRow('saashub', {
        'Install URL': 'https://snug.andryore.dev/install?c=other',
      }),
    ])
    expect(validateDirectoryTracker(wrongTag)).toContainEqual(
      expect.stringContaining('Install URL'),
    )
  })

  test('accepts an empty Install URL', () => {
    const csv = buildTracker([directoryRow('saashub', { 'Install URL': '' })])
    expect(validateDirectoryTracker(csv)).toEqual([])
  })
})

describe('parseCsv', () => {
  test('handles quoted cells with commas and escaped quotes', () => {
    expect(parseCsv('a,"b, c","say ""hi"""\n1,2,3\n')).toEqual([
      ['a', 'b, c', 'say "hi"'],
      ['1', '2', '3'],
    ])
  })
})
