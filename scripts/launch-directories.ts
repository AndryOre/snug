/**
 * Validation for the Launch kit's directory tracker
 * (`docs/launch/directories.csv`). Every row carries a Campaign tag that is
 * echoed as `c=` on its Landing page link and Install redirect link.
 */

/**
Columns the tracker must contain: the skill template's plus the launch-kit additions.
 */
export const REQUIRED_COLUMNS = [
  'Directory',
  'Tier',
  'URL',
  'Category',
  'DR',
  'Dofollow',
  'Submission Date',
  'Status',
  'Live URL',
  'Backlink Verified',
  'Positioning Variant Used',
  'Tags Used',
  'Account Email',
  'Notes',
  'Batch',
  'Language',
  'Campaign Tag',
  'Website URL',
  'Install URL',
] as const

/**
The fixed set of positioning variant IDs.
 */
const VARIANT_IDS = [
  'extension',
  'alternatives',
  'open-source',
  'privacy',
  'es',
] as const

const CAMPAIGN_TAG_PATTERN = /^[A-Za-z0-9_-]{1,32}$/
const FIXED_RESERVED_TAGS = new Set([
  'producthunt',
  'hn',
  'x',
  'youtube',
  'github',
])
const REDDIT_TAG_PATTERN = /^reddit-[A-Za-z0-9_]+$/
const TRACKER_HOST = 'snug.andryore.dev'

/**
 * Parses CSV text with RFC 4180 quoting (quoted cells, doubled quotes).
 * @param text The raw CSV text.
 * @returns Rows of cells; fully blank lines are dropped.
 */
export function parseCsv(text: string): string[][] {
  const cellPattern = /("(?:[^"]|"")*"|[^\n\r,"]*)(,|\r\n|\n|\r|$)/y
  const rows: string[][] = []
  let row: string[] = []
  while (cellPattern.lastIndex < text.length) {
    const match = cellPattern.exec(text)
    if (match === null) {
      throw new Error(
        `parseCsv: malformed CSV near offset ${cellPattern.lastIndex}`,
      )
    }
    const [, rawCell = '', separator = ''] = match
    row.push(
      rawCell.startsWith('"')
        ? rawCell.slice(1, -1).replaceAll('""', '"')
        : rawCell,
    )
    if (separator === ',') {
      continue
    }

    rows.push(row)
    row = []
  }
  return rows.filter((cells) => cells.some((value) => value.trim() !== ''))
}

/**
 * Parses the tracker CSV into one record per data row, keyed by header name.
 * @param text The raw tracker CSV text.
 * @returns Records for every row after the header.
 */
export function parseTracker(text: string): Record<string, string>[] {
  const [header = [], ...rows] = parseCsv(text)
  return rows.map((cells) =>
    Object.fromEntries(
      header.map((name, index) => [name, (cells[index] ?? '').trim()]),
    ),
  )
}

/**
 * Whether a Campaign tag is one of the reserved launch-channel tags, which
 * belong to channels rather than directories and carry no Batch.
 * @param tag The Campaign tag.
 * @returns True for producthunt, hn, x, youtube, github and reddit-<sub>.
 */
function isReservedTag(tag: string): boolean {
  return FIXED_RESERVED_TAGS.has(tag) || REDDIT_TAG_PATTERN.test(tag)
}

/**
 * Checks a tracker URL is https, on the Landing page host, at the expected
 * path, and carries a `c=` equal to the row's Campaign tag.
 * @param value The URL cell.
 * @param pathname The required path (`/` or `/install`).
 * @param tag The row's Campaign tag.
 * @returns Whether the URL is valid for the row.
 */
function isTaggedLink(value: string, pathname: string, tag: string): boolean {
  try {
    const url = new URL(value)
    return (
      url.protocol === 'https:' &&
      url.hostname === TRACKER_HOST &&
      url.pathname === pathname &&
      url.searchParams.get('c') === tag
    )
  } catch {
    return false
  }
}

/**
 * Validates the directory tracker against the Launch kit rules.
 * @param text The raw tracker CSV text.
 * @returns Human-readable violations; an empty array means the tracker is valid.
 */
export function validateDirectoryTracker(text: string): string[] {
  const problems: string[] = []
  const [header = []] = parseCsv(text)
  const missing = REQUIRED_COLUMNS.filter((name) => !header.includes(name))
  if (missing.length > 0) {
    return [`missing required columns: ${missing.join(', ')}`]
  }

  const seenTags = new Set<string>()
  for (const [index, row] of parseTracker(text).entries()) {
    const label = `row ${index + 2} (${row['Directory'] || 'unnamed'})`
    const tag = row['Campaign Tag'] ?? ''

    if (!CAMPAIGN_TAG_PATTERN.test(tag)) {
      problems.push(
        `${label}: Campaign Tag "${tag}" must match ${CAMPAIGN_TAG_PATTERN}`,
      )
    } else if (seenTags.has(tag)) {
      problems.push(`${label}: duplicate Campaign Tag "${tag}"`)
    }
    seenTags.add(tag)

    const variant = row['Positioning Variant Used'] ?? ''
    if (!(VARIANT_IDS as readonly string[]).includes(variant)) {
      problems.push(
        `${label}: variant "${variant}" must be one of ${VARIANT_IDS.join(', ')}`,
      )
    }

    const batch = row['Batch'] ?? ''
    if (batch === '') {
      if (!isReservedTag(tag)) {
        problems.push(`${label}: Batch may be empty only for reserved tags`)
      }
    } else if (!/^[1-3]$/.test(batch)) {
      problems.push(`${label}: Batch "${batch}" must be 1, 2 or 3`)
    }

    if (!isTaggedLink(row['Website URL'] ?? '', '/', tag)) {
      problems.push(
        `${label}: Website URL must be https://${TRACKER_HOST}/?c=${tag}`,
      )
    }
    const installUrl = row['Install URL'] ?? ''
    if (installUrl !== '' && !isTaggedLink(installUrl, '/install', tag)) {
      problems.push(
        `${label}: Install URL must be empty or https://${TRACKER_HOST}/install?c=${tag}`,
      )
    }
  }
  return problems
}
