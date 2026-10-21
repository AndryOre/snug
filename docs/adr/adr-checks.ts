const ADR_FILE_PATTERN = /^(\d{4})-[\da-z-]+\.md$/
const REQUIRED_SECTIONS = ['Status', 'Context', 'Decision', 'Consequences']
const ALLOWED_STATUS = /^(Accepted|Proposed|Deprecated|Superseded)\b/
const INDEX_ROW_PATTERN =
  /^\|\s*(\d{4})\s*\|\s*\[(.+?)\]\((\d{4}-[^)]+\.md)\)\s*\|\s*(\w+)\s*\|/gm

const DATE_LINE_PATTERN = /^Date: \d{4}-\d{2}-\d{2}$/
const VALID_REVISED_LINE_PATTERN = /^Revised: \d{4}-\d{2}-\d{2}, \S/
const RELATION_PHRASE_SOURCE = String.raw`Amended\s+by|Partly\s+superseded\s+by|Superseded\s+by|Amends|Extends|Partly\s+supersedes|Supersedes`
const RELATION_PHRASE_PATTERN = new RegExp(
  String.raw`\b(?:${RELATION_PHRASE_SOURCE})\b`,
  'g',
)
const RELATION_WITH_LINK_PATTERN = new RegExp(
  String.raw`\b(?:${RELATION_PHRASE_SOURCE})\s+\[\d{4}\]\(\d{4}-[^)]+\.md\)`,
  'g',
)
const RELATION_LIST_PATTERN = new RegExp(
  String.raw`\b(${RELATION_PHRASE_SOURCE})\s+((?:\[\d{4}\]\([^)]+\)(?:,?\s+(?:and\s+)?)?)+)`,
  'g',
)
const RELATION_LINK_PATTERN = /\[(\d{4})\]\(([^)]+)\)/g
const COLUMN_ROW_PATTERN =
  /^\|\s*(\d{4})\s*\|\s*\[([^\]]+)\]\(([^)]+)\)\s*\|[^|]*\|([^|]*)\|\s*$/gm

const RELATION_KINDS = {
  Amends: { inverse: 'Amended by' },
  Extends: { inverse: 'Amended by' },
  'Partly supersedes': { inverse: 'Partly superseded by' },
  Supersedes: { inverse: 'Superseded by' },
} as const

type ForwardPhrase = keyof typeof RELATION_KINDS
type InversePhrase = (typeof RELATION_KINDS)[ForwardPhrase]['inverse']
type RelationPhrase = ForwardPhrase | InversePhrase

interface Relation {
  readonly phrase: RelationPhrase
  readonly targetNumber: string
  readonly targetFile: string
}

/**
One ADR markdown file read from `docs/adr`.
 */
export interface AdrFile {
  readonly fileName: string
  readonly content: string
}

function isForwardPhrase(phrase: string): phrase is ForwardPhrase {
  return Object.hasOwn(RELATION_KINDS, phrase)
}

function readStatusSection(content: string): string {
  return /(?:^|\n)## Status\n\n([\s\S]*?)(?=\n## |$)/.exec(content)?.[1] ?? ''
}

function readNumber(adr: AdrFile): string {
  return ADR_FILE_PATTERN.exec(adr.fileName)?.[1] ?? ''
}

function readTitle(content: string, number: string): string | undefined {
  const heading = content.split('\n', 1)[0] ?? ''
  const match = /^# (\d{4}): (\S.*)$/.exec(heading)
  return match?.[1] === number ? match[2] : undefined
}

function parseRelations(statusSection: string): Relation[] {
  return statusSection
    .matchAll(RELATION_LIST_PATTERN)
    .flatMap((listMatch) =>
      (listMatch[2] ?? '')
        .matchAll(RELATION_LINK_PATTERN)
        .map((link): Relation => ({
          phrase: (listMatch[1] ?? '').replaceAll(
            /\s+/g,
            ' ',
          ) as RelationPhrase,
          targetNumber: link[1] ?? '',
          targetFile: link[2] ?? '',
        })),
    )
    .toArray()
}

function expectedColumnCell(relations: readonly Relation[]): string {
  const entries = relations
    .filter((relation) => !isForwardPhrase(relation.phrase))
    .toSorted((left, right) =>
      left.targetNumber.localeCompare(right.targetNumber),
    )
    .map(
      (relation) =>
        `${relation.targetNumber}${relation.phrase === 'Partly superseded by' ? ' (partly)' : ''}`,
    )
  return entries.length > 0 ? entries.join(', ') : '-'
}

/**
 * Checks that every relation phrase in a Status section links an ADR number.
 * @param adrs - The ADR files to check.
 * @returns One message per ADR with unlinked relation wording.
 */
export function findRelationWordingViolations(
  adrs: readonly AdrFile[],
): string[] {
  return adrs
    .filter((adr) => {
      const statusSection = readStatusSection(adr.content)
      const phraseCount =
        statusSection.match(RELATION_PHRASE_PATTERN)?.length ?? 0
      const linkedCount =
        statusSection.match(RELATION_WITH_LINK_PATTERN)?.length ?? 0
      return phraseCount !== linkedCount
    })
    .map((adr) => `${adr.fileName}: relation wording must link the ADR number`)
}

/**
 * Checks that every relation links an existing ADR and is recorded on both
 * sides with the inverse wording.
 * @param adrs - The ADR files to check.
 * @returns One message per broken or one-sided relation.
 */
export function findRelationViolations(adrs: readonly AdrFile[]): string[] {
  const violations: string[] = []
  const byFile = new Map(adrs.map((adr) => [adr.fileName, adr]))
  const relationsByFile = new Map(
    adrs.map((adr) => [
      adr.fileName,
      parseRelations(readStatusSection(adr.content)),
    ]),
  )
  for (const adr of adrs) {
    const adrRelations = relationsByFile.get(adr.fileName) ?? []
    for (const relation of adrRelations) {
      const target = byFile.get(relation.targetFile)
      if (
        !target ||
        !relation.targetFile.startsWith(`${relation.targetNumber}-`)
      ) {
        violations.push(
          `${adr.fileName}: "${relation.phrase}" links missing ADR ${relation.targetFile}`,
        )
        continue
      }
      const inverse = isForwardPhrase(relation.phrase)
        ? RELATION_KINDS[relation.phrase].inverse
        : undefined
      const isMirrored = (relationsByFile.get(target.fileName) ?? []).some(
        (other) =>
          other.targetFile === adr.fileName &&
          (inverse
            ? other.phrase === inverse
            : isForwardPhrase(other.phrase) &&
              RELATION_KINDS[other.phrase].inverse === relation.phrase),
      )
      if (!isMirrored) {
        violations.push(
          `${adr.fileName}: "${relation.phrase}" ${readNumber(target)} is not recorded on ${target.fileName}`,
        )
      }
    }
  }
  return violations
}

/**
 * Checks that README rows match each ADR's title and reverse relations in the
 * "Superseded or amended by" column.
 * @param adrs - The ADR files to check.
 * @param indexContent - The contents of the ADR index README.
 * @returns One message per mismatched README row.
 */
export function findIndexColumnViolations(
  adrs: readonly AdrFile[],
  indexContent: string,
): string[] {
  const violations: string[] = []
  const rowsByFile = new Map(
    Array.from(indexContent.matchAll(COLUMN_ROW_PATTERN), (match) => ({
      title: match[2] ?? '',
      fileName: match[3] ?? '',
      cell: (match[4] ?? '').trim(),
    })).map((row) => [row.fileName, row]),
  )
  for (const adr of adrs) {
    const row = rowsByFile.get(adr.fileName)
    if (!row) continue
    const title = readTitle(adr.content, readNumber(adr)) ?? ''
    if (row.title !== title) {
      violations.push(
        `${adr.fileName}: README title "${row.title}" differs from "${title}"`,
      )
    }
    const expected = expectedColumnCell(
      parseRelations(readStatusSection(adr.content)),
    )
    if (row.cell !== expected) {
      violations.push(
        `${adr.fileName}: README "Superseded or amended by" is "${row.cell}", expected "${expected}"`,
      )
    }
  }
  return violations
}

/**
 * Returns every violation of the ADR format and index rules, empty when the
 * set is valid. Pure so a broken fixture can prove each rule fires.
 * @param adrs - ADR files to check.
 * @param indexContent - Contents of the index README.
 * @returns One message per violation.
 */
export function findAdrViolations(
  adrs: readonly AdrFile[],
  indexContent: string,
): string[] {
  const violations: string[] = []
  const sorted = adrs.toSorted((left, right) =>
    left.fileName.localeCompare(right.fileName),
  )
  const numbers = sorted.map((adr) => Number(readNumber(adr)))
  if (new Set(numbers).size !== numbers.length) {
    violations.push('duplicate ADR number')
  }
  if (
    numbers.some(
      (number, index) => index > 0 && number < (numbers[index - 1] ?? 0),
    )
  ) {
    violations.push('ADR numbers are not ascending')
  }
  const indexRows = indexContent.matchAll(INDEX_ROW_PATTERN).toArray()

  for (const adr of sorted) {
    const number = readNumber(adr)
    const title = readTitle(adr.content, number)
    if (title === undefined) {
      violations.push(`${adr.fileName}: heading must be "# NNNN: Title"`)
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
    const statusLines = readStatusSection(adr.content).split('\n')
    const dateLines = statusLines.filter((line) => line.startsWith('Date:'))
    if (
      dateLines.length !== 1 ||
      dateLines.some((line) => !DATE_LINE_PATTERN.test(line))
    ) {
      violations.push(`${adr.fileName}: Date line must be "Date: YYYY-MM-DD"`)
    }
    if (
      statusLines
        .filter((line) => line.startsWith('Revised:'))
        .some((line) => !VALID_REVISED_LINE_PATTERN.test(line))
    ) {
      violations.push(
        `${adr.fileName}: Revised line must be "Revised: YYYY-MM-DD, <text>"`,
      )
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
