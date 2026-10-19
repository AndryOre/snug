import { spawn, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

/**
 * Builds the commitlint invocation, mirroring the `commitlint` job of
 * `.github/workflows/ci.yml`.
 * @param base The commit to lint from.
 * @param head The commit to lint to.
 * @returns The command and its arguments.
 */
export function buildCommitlintCommand(base: string, head: string): string[] {
  return ['bunx', 'commitlint', '--from', base, '--to', head, '--verbose']
}

/**
Result of a git invocation.
 */
export interface GitResult {
  ok: boolean
  output: string
}

/**
Runs git with the given arguments.
 */
export type GitRunner = (arguments_: string[]) => GitResult

function runGit(arguments_: string[]): GitResult {
  const result = spawnSync('git', arguments_, { encoding: 'utf8' })
  return {
    ok: result.status === 0,
    output: (result.status === 0 ? result.stdout : result.stderr).trim(),
  }
}

/**
 * Resolves the merge-base of `origin/main` (or local `main`) and HEAD.
 * @param git The git runner, defaults to the real `git`.
 * @returns The merge-base commit SHA.
 */
export function resolveCommitlintBase(git: GitRunner = runGit): string {
  for (const mainReference of ['origin/main', 'main']) {
    const result = git(['merge-base', mainReference, 'HEAD'])
    if (result.ok) return result.output
  }
  throw new Error(
    'lint-commits: could not resolve a merge-base against "origin/main" or "main".',
  )
}

function exitCodeOf(code: number | null): number {
  return typeof code === 'number' ? code : 1
}

/**
Injectable collaborators of {@link runLintCommits}.
 */
export interface LintCommitsDependencies {
  git: GitRunner
  spawnCommand: (command: string, commandArguments: string[]) => Promise<number>
}

function spawnInherited(
  command: string,
  commandArguments: string[],
): Promise<number> {
  const child = spawn(command, commandArguments, { stdio: 'inherit' })
  return new Promise<number>((resolve, reject) => {
    child.on('error', reject)
    child.on('close', (code) => {
      resolve(exitCodeOf(code))
    })
  })
}

function defaultDependencies(): LintCommitsDependencies {
  return { git: runGit, spawnCommand: spawnInherited }
}

/**
 * Lints the commits between the merge-base and HEAD with commitlint.
 * @param dependencies The git runner and process spawner, defaulting to the real ones.
 * @returns The commitlint exit code, or 0 when there is nothing to lint.
 */
export async function runLintCommits(
  dependencies: LintCommitsDependencies = defaultDependencies(),
): Promise<number> {
  const base = resolveCommitlintBase(dependencies.git)
  const head = dependencies.git(['rev-parse', 'HEAD'])
  if (!head.ok) throw new Error('lint-commits: could not resolve HEAD.')
  if (base === head.output) {
    console.log('lint-commits: HEAD is at the merge-base, nothing to lint.')
    return 0
  }
  const [command, ...commandArguments] = buildCommitlintCommand(base, 'HEAD')
  if (command === undefined) throw new Error('lint-commits: empty command.')
  return dependencies.spawnCommand(command, commandArguments)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    process.exitCode = await runLintCommits()
  } catch (error: unknown) {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  }
}
