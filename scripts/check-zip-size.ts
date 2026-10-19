import { appendFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

/**
 * Size budget for the Chrome extension zip, in bytes.
 *
 * Derived as the CI-built `snug-2.2.0-chrome.zip` size (641_826 bytes, from the
 * `extension-chrome-zip` artifact of the `main` run on 2026-10-19) plus 10%,
 * rounded up. Raise it deliberately, in the same change that adds the weight.
 */
export const ZIP_SIZE_BUDGET_BYTES = 706_009

export type ZipSizeVerdict = {
  isWithinBudget: boolean
  summaryLine: string
}

/**
 * Compares a zip size against a budget and renders the job-summary line.
 * @param zipName - File name shown in the summary line.
 * @param sizeBytes - Actual zip size in bytes.
 * @param budgetBytes - Maximum allowed size in bytes.
 * @returns Whether the zip fits the budget, plus the summary line.
 */
export function evaluateZipSize(
  zipName: string,
  sizeBytes: number,
  budgetBytes: number,
): ZipSizeVerdict {
  const isWithinBudget = sizeBytes <= budgetBytes
  const status = isWithinBudget ? 'within' : 'OVER'
  return {
    isWithinBudget,
    summaryLine: `**Extension zip size:** \`${sizeBytes}\` bytes of \`${budgetBytes}\` budget (${status}) (\`${zipName}\`)`,
  }
}

/**
 * Locates the Chrome zip built by WXT.
 * @param outputDirectory - Directory WXT writes zips into.
 * @returns The Chrome zip path, or `undefined` when none was built.
 */
export function findChromeZip(outputDirectory: string): string | undefined {
  let entries: string[]
  try {
    entries = readdirSync(outputDirectory)
  } catch {
    return undefined
  }
  const zipName = entries.find((entry) => entry.endsWith('-chrome.zip'))
  return zipName === undefined ? undefined : path.join(outputDirectory, zipName)
}

function main(): number {
  const outputDirectory = process.argv[2] ?? 'apps/extension/.output'
  const summaryPath = process.env['GITHUB_STEP_SUMMARY']
  const report = (line: string) => {
    console.log(line)
    if (summaryPath) appendFileSync(summaryPath, `${line}\n`)
  }
  const zipPath = findChromeZip(outputDirectory)
  if (zipPath === undefined) {
    report('No extension zip built (extension not affected by this change).')
    return 0
  }
  const verdict = evaluateZipSize(
    path.basename(zipPath),
    statSync(zipPath).size,
    ZIP_SIZE_BUDGET_BYTES,
  )
  report(verdict.summaryLine)
  return verdict.isWithinBudget ? 0 : 1
}

if (import.meta.main) process.exitCode = main()
