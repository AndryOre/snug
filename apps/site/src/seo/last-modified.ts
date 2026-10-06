import { execFileSync } from 'node:child_process'

/**
 * The date of the latest git commit touching any of the given files.
 * @param relativePaths - Paths relative to the working directory (`apps/site`).
 * @returns A `YYYY-MM-DD` date, or `undefined` when git history is not
 * available at build time, so the caller omits `lastmod` instead of faking it.
 */
export function lastCommitDate(
  relativePaths: readonly string[],
): string | undefined {
  try {
    const output = execFileSync(
      'git',
      ['log', '-1', '--format=%cs', '--', ...relativePaths],
      {
        cwd: process.cwd(),
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      },
    ).trim()
    return /^\d{4}-\d{2}-\d{2}$/.test(output) ? output : undefined
  } catch {
    return undefined
  }
}
