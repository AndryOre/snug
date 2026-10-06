import { execFileSync } from 'node:child_process'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/**
 * Options for {@link lastCommitDate}, mainly so tests can run without git.
 */
export interface LastModifiedOptions {
  /**
   * Directory the paths are relative to. Defaults to the working directory.
   */
  cwd?: string
  /**
   * JSON object mapping a source path to its `YYYY-MM-DD` last commit date,
   * computed outside the image by `docker/last-modified.sh`. Defaults to the
   * `LAST_MODIFIED_DATES` environment variable.
   */
  passedDates?: string | undefined
}

function gitDate(
  relativePaths: readonly string[],
  cwd: string,
): string | undefined {
  try {
    const output = execFileSync(
      'git',
      ['log', '-1', '--format=%cs', '--', ...relativePaths],
      { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    ).trim()
    return ISO_DATE.test(output) ? output : undefined
  } catch {
    return undefined
  }
}

function parsePassedDates(raw: string | undefined): Map<string, string> {
  const dates = new Map<string, string>()
  if (!raw) return dates
  try {
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return dates
    for (const [source, date] of Object.entries(parsed)) {
      if (typeof date === 'string' && ISO_DATE.test(date)) {
        dates.set(source, date)
      }
    }
  } catch {
    return dates
  }
  return dates
}

function passedDate(
  relativePaths: readonly string[],
  raw: string | undefined,
): string | undefined {
  const dates = parsePassedDates(raw)
  let newest: string | undefined
  for (const requested of relativePaths) {
    const prefix = `${requested.replace(/\/+$/, '')}/`
    for (const [source, date] of dates) {
      const isMatch = source === requested || source.startsWith(prefix)
      if (isMatch && (newest === undefined || date > newest)) newest = date
    }
  }
  return newest
}

/**
 * The date of the latest commit touching any of the given files. Reads git
 * when history is available, otherwise the per-source dates passed into the
 * build (the production image has neither `.git` nor `git`).
 * @param relativePaths - Paths relative to the working directory (`apps/site`).
 * @param options - Overrides for the working directory and passed dates.
 * @returns A `YYYY-MM-DD` date, or `undefined` when neither source knows the
 * paths, so the caller omits `lastmod` instead of faking it.
 */
export function lastCommitDate(
  relativePaths: readonly string[],
  options: LastModifiedOptions = {},
): string | undefined {
  const {
    cwd = process.cwd(),
    passedDates = process.env['LAST_MODIFIED_DATES'],
  } = options
  return gitDate(relativePaths, cwd) ?? passedDate(relativePaths, passedDates)
}
