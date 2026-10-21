import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  type AdrFile,
  findAdrViolations,
  findIndexColumnViolations,
  findRelationViolations,
  findRelationWordingViolations,
} from './adr-checks'

const ADR_DIRECTORY = import.meta.dirname
const ADR_FILE_PATTERN = /^(\d{4})-[\da-z-]+\.md$/

const validAdr = (number: string): AdrFile => ({
  fileName: `${number}-sample.md`,
  content: `# ${Number(number)}. Sample\n\n## Status\n\nAccepted.\n\n## Context\n\nc\n\n## Decision\n\nd\n\n## Consequences\n\ne\n`,
})
const validRow = (number: string) =>
  `| ${number} | [Sample](${number}-sample.md) | Accepted | - |\n`

describe('ADR invariants', () => {
  it('holds for the real ADRs and index', () => {
    const adrs = readdirSync(ADR_DIRECTORY)
      .filter((fileName) => ADR_FILE_PATTERN.test(fileName))
      .map((fileName) => ({
        fileName,
        content: readFileSync(path.join(ADR_DIRECTORY, fileName), 'utf8'),
      }))
    const index = readFileSync(path.join(ADR_DIRECTORY, 'README.md'), 'utf8')
    expect(adrs.length).toBeGreaterThan(0)
    expect(findAdrViolations(adrs, index)).toEqual([])
  })

  it('accepts a valid fixture', () => {
    expect(findAdrViolations([validAdr('0001')], validRow('0001'))).toEqual([])
  })

  it('flags a missing index row', () => {
    expect(
      findAdrViolations([validAdr('0001'), validAdr('0002')], validRow('0001')),
    ).toEqual(['0002-sample.md: missing from the index'])
  })

  it('allows gaps in numbering', () => {
    expect(
      findAdrViolations(
        [validAdr('0001'), validAdr('0003')],
        validRow('0001') + validRow('0003'),
      ),
    ).toEqual([])
  })

  it('accepts both heading forms', () => {
    const migrated = {
      fileName: '0001-sample.md',
      content: validAdr('0001').content.replace(
        '# 1. Sample',
        '# 0001: Sample',
      ),
    }
    expect(findAdrViolations([migrated], validRow('0001'))).toEqual([])
  })

  it('flags a heading with the wrong number', () => {
    const wrong = {
      fileName: '0001-sample.md',
      content: validAdr('0001').content.replace(
        '# 1. Sample',
        '# 0002: Sample',
      ),
    }
    expect(findAdrViolations([wrong], validRow('0001'))).toContain(
      '0001-sample.md: heading must be "# N. Title" or "# NNNN: Title"',
    )
  })

  it('accepts an optional well-formed Date and Revised line', () => {
    const adr = {
      fileName: '0001-sample.md',
      content: validAdr('0001').content.replace(
        'Accepted.\n',
        'Accepted.\n\nDate: 2026-10-17\n\nRevised: 2026-10-19, fixed a fact.\n',
      ),
    }
    expect(findAdrViolations([adr], validRow('0001'))).toEqual([])
  })

  it('flags malformed Date and Revised lines', () => {
    const adr = {
      fileName: '0001-sample.md',
      content: validAdr('0001').content.replace(
        'Accepted.\n',
        'Accepted.\n\nDate: today\n\nRevised: yesterday\n',
      ),
    }
    expect(findAdrViolations([adr], validRow('0001'))).toEqual([
      '0001-sample.md: Date line must be "Date: YYYY-MM-DD"',
      '0001-sample.md: Revised line must be "Revised: YYYY-MM-DD, <text>"',
    ])
  })

  it('flags a duplicate number', () => {
    expect(
      findAdrViolations([validAdr('0001'), validAdr('0001')], validRow('0001')),
    ).toContain('duplicate ADR number')
  })

  it('flags a bad heading and a missing section', () => {
    const broken = {
      fileName: '0001-sample.md',
      content: validAdr('0001')
        .content.replace('# 1. Sample', '# Sample')
        .replace('## Decision', '## Choice'),
    }
    expect(findAdrViolations([broken], validRow('0001'))).toEqual([
      '0001-sample.md: heading must be "# N. Title" or "# NNNN: Title"',
      '0001-sample.md: missing "## Decision"',
    ])
  })

  it('flags an index entry with no file', () => {
    expect(
      findAdrViolations(
        [validAdr('0001')],
        validRow('0001') + validRow('0002'),
      ),
    ).toEqual(['index lists 0002-sample.md which does not exist'])
  })
})

const relationAdr = (number: string, status: string): AdrFile => ({
  fileName: `${number}-sample.md`,
  content: validAdr(number).content.replace('Accepted.', () => status),
})

describe('findRelationWordingViolations', () => {
  it('flags relation wording without a linked ADR number', () => {
    expect(
      findRelationWordingViolations([
        relationAdr('0001', 'Accepted. Amended by a later decision.'),
      ]),
    ).toEqual(['0001-sample.md: relation wording must link the ADR number'])
  })

  it('accepts linked wording wrapped across lines', () => {
    expect(
      findRelationWordingViolations([
        relationAdr('0001', 'Accepted. Amended by\n[0002](0002-sample.md).'),
      ]),
    ).toEqual([])
  })
})

describe('findRelationViolations', () => {
  it('accepts relations recorded on both sides', () => {
    expect(
      findRelationViolations([
        relationAdr(
          '0001',
          'Accepted. Partly superseded by [0002](0002-sample.md).',
        ),
        relationAdr(
          '0002',
          'Accepted. Partly supersedes [0001](0001-sample.md).',
        ),
      ]),
    ).toEqual([])
  })

  it('flags a one-sided forward relation', () => {
    expect(
      findRelationViolations([
        validAdr('0001'),
        relationAdr('0002', 'Accepted. Extends [0001](0001-sample.md).'),
      ]),
    ).toContain(
      '0002-sample.md: "Extends" 0001 is not recorded on 0001-sample.md',
    )
  })

  it('flags a one-sided "by" relation', () => {
    expect(
      findRelationViolations([
        relationAdr('0001', 'Accepted. Superseded by [0002](0002-sample.md).'),
        validAdr('0002'),
      ]),
    ).toContain(
      '0001-sample.md: "Superseded by" 0002 is not recorded on 0002-sample.md',
    )
  })

  it('flags a relation that links a missing ADR', () => {
    expect(
      findRelationViolations([
        relationAdr('0001', 'Accepted. Amends [0009](0009-sample.md).'),
      ]),
    ).toContain('0001-sample.md: "Amends" links missing ADR 0009-sample.md')
  })
})

describe('findIndexColumnViolations', () => {
  it('accepts a matching row', () => {
    expect(
      findIndexColumnViolations([validAdr('0001')], validRow('0001')),
    ).toEqual([])
  })

  it('flags a title mismatch in a padded row', () => {
    const row = '| 0001   | [Other](0001-sample.md)   | Accepted | -     |'
    expect(findIndexColumnViolations([validAdr('0001')], row)).toContain(
      '0001-sample.md: README title "Other" differs from "Sample"',
    )
  })

  it('flags a column mismatch against the recorded relations', () => {
    const adrs = [
      relationAdr(
        '0001',
        'Accepted. Partly superseded by [0002](0002-sample.md).',
      ),
    ]
    expect(findIndexColumnViolations(adrs, validRow('0001'))).toContain(
      '0001-sample.md: README "Superseded or amended by" is "-", expected "0002 (partly)"',
    )
  })

  it('flags a claimed relation the files do not record', () => {
    const row = '| 0001 | [Sample](0001-sample.md) | Accepted | 0002 |'
    expect(findIndexColumnViolations([validAdr('0001')], row)).toContain(
      '0001-sample.md: README "Superseded or amended by" is "0002", expected "-"',
    )
  })
})
