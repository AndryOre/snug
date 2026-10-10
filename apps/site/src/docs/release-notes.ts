export interface ReleaseNote {
  version: string
  isoDate: string
  body: string
}

const RELEASE_HEADING = /^## \[(\d+\.\d+\.\d+)\] - (\d{4}-\d{2}-\d{2})$/
const UNRELEASED_HEADING = /^## \[Unreleased\]\s*$/i
const SECOND_LEVEL_HEADING = /^## /

function compareVersionsDescending(left: string, right: string): number {
  const leftParts = left.split('.').map(Number)
  const rightParts = right.split('.').map(Number)
  for (let index = 0; index < 3; index += 1) {
    const difference = (rightParts[index] ?? 0) - (leftParts[index] ?? 0)
    if (difference !== 0) return difference
  }
  return 0
}

function assertRealDate(isoDate: string, lineNumber: number, line: string) {
  const parsed = new Date(`${isoDate}T00:00:00Z`)
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== isoDate
  ) {
    throw new Error(
      `CHANGELOG.md line ${lineNumber}: invalid release date in "${line}"`,
    )
  }
}

interface OpenEntry {
  version: string
  isoDate: string
  lines: string[]
}

/**
 * Parses a Keep a Changelog document into release entries, newest first.
 * Everything before the first release heading is ignored, and a bare
 * `## [Unreleased]` section is skipped. Any other `## ` heading that is not
 * `## [x.y.z] - YYYY-MM-DD` throws an error naming the offending line.
 * @param markdown - The raw `CHANGELOG.md` contents.
 * @returns The release entries, newest first.
 */
export function parseChangelog(markdown: string): ReleaseNote[] {
  const entries: ReleaseNote[] = []
  let current: OpenEntry | null = null

  const flush = () => {
    if (!current) return
    entries.push({
      version: current.version,
      isoDate: current.isoDate,
      body: current.lines.join('\n').trim(),
    })
    current = null
  }

  const lines = markdown.split(/\r?\n/)
  for (const [index, line] of lines.entries()) {
    if (!SECOND_LEVEL_HEADING.test(line)) {
      current?.lines.push(line)
      continue
    }
    flush()
    if (UNRELEASED_HEADING.test(line)) continue
    const match = RELEASE_HEADING.exec(line)
    if (!match) {
      throw new Error(
        `CHANGELOG.md line ${index + 1}: malformed release heading "${line}"; expected "## [x.y.z] - YYYY-MM-DD"`,
      )
    }
    const [, version = '', isoDate = ''] = match
    assertRealDate(isoDate, index + 1, line)
    current = { version, isoDate, lines: [] }
  }
  flush()

  return entries.toSorted((left, right) =>
    compareVersionsDescending(left.version, right.version),
  )
}

/**
 * Renders the What's new page markdown: one H2 per version followed by its
 * date line and the entry body verbatim.
 * @param entries - Entries from `parseChangelog`.
 * @returns The What's new page markdown.
 */
export function renderReleaseNotesMarkdown(entries: ReleaseNote[]): string {
  const sections = entries.map(
    (entry) => `## ${entry.version}\n\n${entry.isoDate}\n\n${entry.body}`,
  )
  return `${sections.join('\n\n')}\n`
}
