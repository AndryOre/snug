import { spawnSync } from 'node:child_process'
import path from 'node:path'

const DIAGNOSTIC_START = /^(\S.*)\((\d+),(\d+)\): error (TS\d+): (.*)$/

const STARLIGHT_SEARCH_COMPONENT =
  /[\\/]@astrojs[\\/]starlight[\\/]dist[\\/]components[\\/]Search\.astro$/

/**
 * Virtual modules that starlight 0.42.6 imports from `Search.astro` without
 * shipping type declarations for them.
 */
const UNTYPED_STARLIGHT_MODULES = new Set([
  'virtual:starlight/project-context',
  'virtual:starlight/pagefind-config',
])

export type DiagnosticBlock = {
  headline: string
  lines: string[]
}

export type SiteTypecheckVerdict = {
  remaining: DiagnosticBlock[]
  ignored: DiagnosticBlock[]
  exitCode: number
}

/**
 * Splits `tsc` output into diagnostics, attaching indented continuation lines
 * to the diagnostic they follow. Lines outside any diagnostic are dropped.
 * @param output - Combined stdout of `tsc --noEmit`.
 * @returns One block per `error TSxxxx` diagnostic.
 */
export function parseDiagnostics(output: string): DiagnosticBlock[] {
  const blocks: DiagnosticBlock[] = []
  for (const line of output.split(/\r?\n/)) {
    if (DIAGNOSTIC_START.test(line)) {
      blocks.push({ headline: line, lines: [line] })
    } else if (/^\s+\S/.test(line) && blocks.length > 0) {
      blocks.at(-1)?.lines.push(line)
    }
  }
  return blocks
}

/**
 * Tells whether a diagnostic is one of the two known starlight `Search.astro`
 * errors: TS2307 on exactly one of the untyped virtual modules, reported in
 * starlight's own `Search.astro`. Anything else, in any other file or about any
 * other module, is a real error.
 * @param block - A parsed diagnostic.
 * @returns Whether the diagnostic is a known, harmless one.
 */
export function isKnownStarlightDiagnostic(block: DiagnosticBlock): boolean {
  const match = DIAGNOSTIC_START.exec(block.headline)
  if (!match) return false
  const file = match[1] ?? ''
  const code = match[4]
  if (code !== 'TS2307' || !STARLIGHT_SEARCH_COMPONENT.test(file)) return false
  const message = match[5] ?? ''
  const moduleName =
    /^Cannot find module '([^']+)' or its corresponding type declarations\.$/.exec(
      message,
    )?.[1]
  return moduleName !== undefined && UNTYPED_STARLIGHT_MODULES.has(moduleName)
}

/**
 * Decides the site typecheck outcome from `tsc` output and exit status.
 * A non-zero exit with no recognised diagnostic (a crash, a config error) fails.
 * @param output - Combined stdout of `tsc --noEmit --runExternalCode`.
 * @param tscExitCode - Exit status of that run.
 * @returns The diagnostics to show, the ones ignored, and the exit code.
 */
export function evaluateSiteTypecheck(
  output: string,
  tscExitCode: number,
): SiteTypecheckVerdict {
  const blocks = parseDiagnostics(output)
  const ignored = blocks.filter((block) => isKnownStarlightDiagnostic(block))
  const remaining = blocks.filter((block) => !isKnownStarlightDiagnostic(block))
  const isCrashWithoutDiagnostics = tscExitCode !== 0 && blocks.length === 0
  const isFailure = remaining.length > 0 || isCrashWithoutDiagnostics
  return { remaining, ignored, exitCode: isFailure ? 1 : 0 }
}

/**
 * Syncs Astro's generated types, then typechecks the site (including `.astro`
 * files, through `@astrojs/ts-content-mapper`) with TypeScript 7.
 * @returns The process exit code.
 */
function main(): number {
  const siteDirectory = path.resolve(import.meta.dirname, '../apps/site')
  const tsc = path.resolve(
    import.meta.dirname,
    '../node_modules/typescript7/bin/tsc',
  )
  const sync = spawnSync('bun', ['run', 'astro', 'sync'], {
    cwd: siteDirectory,
    stdio: 'inherit',
  })
  if (sync.status !== 0) return sync.status ?? 1

  const result = spawnSync(
    process.execPath,
    [tsc, '--noEmit', '--runExternalCode', '--pretty', 'false'],
    { cwd: siteDirectory, encoding: 'utf8' },
  )
  const output = `${result.stdout}${result.stderr}`
  const verdict = evaluateSiteTypecheck(output, result.status ?? 1)
  for (const block of verdict.remaining) console.error(block.lines.join('\n'))
  if (verdict.exitCode !== 0 && verdict.remaining.length === 0) {
    console.error(output)
  }
  return verdict.exitCode
}

if (import.meta.main) process.exitCode = main()
