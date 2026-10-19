import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const ADR_DIRECTORY = import.meta.dirname
const ADR_FILE_PATTERN = /^(\d{4})-[\da-z-]+\.md$/
const REQUIRED_SECTIONS = ['Status', 'Context', 'Decision', 'Consequences']
const ALLOWED_STATUS = /^(Accepted|Proposed|Deprecated|Superseded)\b/
const INDEX_ROW_PATTERN =
  /^\|\s*(\d{4})\s*\|\s*\[(.+?)\]\((\d{4}-[^)]+\.md)\)\s*\|\s*(\w+)\s*\|/gm

interface AdrFile {
  readonly fileName: string
  readonly content: string
}

/**
 * Returns every violation of the ADR format and index rules, empty when the
 * set is valid. Pure so a broken fixture can prove each rule fires.
 * @param adrs - ADR files to check.
 * @param indexContent - Contents of the index README.
 * @returns One message per violation.
 */
function findAdrViolations(
  adrs: readonly AdrFile[],
  indexContent: string,
): string[] {
  const violations: string[] = []
  const sorted = adrs.toSorted((left, right) =>
    left.fileName.localeCompare(right.fileName),
  )
  const indexRows = indexContent.matchAll(INDEX_ROW_PATTERN).toArray()

  for (const [position, adr] of sorted.entries()) {
    const number = ADR_FILE_PATTERN.exec(adr.fileName)?.[1] ?? ''
    if (Number(number) !== position + 1) {
      violations.push(`${adr.fileName}: expected number ${position + 1}`)
    }
    const heading = adr.content.split('\n', 1)[0] ?? ''
    const title = new RegExp(String.raw`^# ${Number(number)}\. (\S.*)$`).exec(
      heading,
    )?.[1]
    if (title === undefined) {
      violations.push(`${adr.fileName}: heading must be "# N. Title"`)
    }
    for (const section of REQUIRED_SECTIONS) {
      if (!new RegExp(`^## ${section}$`, 'm').test(adr.content)) {
        violations.push(`${adr.fileName}: missing "## ${section}"`)
      }
    }
    const status = /^## Status\n\n(.+)/m.exec(adr.content)?.[1] ?? ''
    if (!ALLOWED_STATUS.test(status)) {
      violations.push(`${adr.fileName}: invalid status "${status}"`)
    }
    const row = indexRows.find((match) => match[3] === adr.fileName)
    if (row === undefined) {
      violations.push(`${adr.fileName}: missing from the index`)
      continue
    }
    if (row[1] !== number) {
      violations.push(`${adr.fileName}: index number ${row[1]}`)
    }
    if (title !== undefined && row[2] !== title) {
      violations.push(`${adr.fileName}: index title differs from heading`)
    }
    if (row[4] !== status.split(/\W/, 1)[0]) {
      violations.push(`${adr.fileName}: index status differs from file`)
    }
  }

  const onDisk = new Set(sorted.map((adr) => adr.fileName))
  for (const row of indexRows) {
    if (!onDisk.has(row[3] ?? '')) {
      violations.push(`index lists ${row[3]} which does not exist`)
    }
  }
  return violations
}

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

  it('flags a gap in numbering', () => {
    expect(
      findAdrViolations(
        [validAdr('0001'), validAdr('0003')],
        validRow('0001') + validRow('0003'),
      ),
    ).toContain('0003-sample.md: expected number 2')
  })

  it('flags a bad heading and a missing section', () => {
    const broken = {
      fileName: '0001-sample.md',
      content: validAdr('0001')
        .content.replace('# 1. Sample', '# 0001: Sample')
        .replace('## Decision', '## Choice'),
    }
    expect(findAdrViolations([broken], validRow('0001'))).toEqual([
      '0001-sample.md: heading must be "# N. Title"',
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
