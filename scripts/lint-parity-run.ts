import { spawnSync } from 'node:child_process'
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { parseArgs } from 'node:util'
import ts from 'typescript'

import {
  type AcceptedEntry,
  checkExpectedFixtures,
  compareSection,
  compareText,
  type Finding,
  fixtureTargetPath,
  normalizeEslintRule,
  parseAccepted,
  parseEslintJson,
  parseOxlintJson,
  renderReport,
  type SectionResult,
} from './lint-parity'
const REPO_ROOT = path.resolve(import.meta.dirname, '..')
const FIXTURES_DIRECTORY = path.join(
  import.meta.dirname,
  'lint-parity-fixtures',
)
const FIXTURE_TREE = path.join(FIXTURES_DIRECTORY, 'tree')
const EXPECTED_FILE = path.join(FIXTURES_DIRECTORY, 'expected.json')
const ACCEPTED_FILE = path.join(FIXTURES_DIRECTORY, 'accepted.json')
const BASELINE_CONFIG_FIXTURE = path.join(
  FIXTURES_DIRECTORY,
  'baseline',
  'eslint.config.mjs.fixture',
)

/**
 * The baseline ESLint install: the exact versions `bun.lock` resolved when
 * the snapshot was taken, installed outside the repo so the baseline does not
 * depend on which lint packages the repo still carries.
 */
const BASELINE_DEPENDENCIES: Readonly<Record<string, string>> = {
  '@eslint-community/eslint-plugin-eslint-comments': '4.8.1',
  '@eslint-react/eslint-plugin': '5.28.2',
  '@shadcn/lint': '0.2.0',
  '@vitest/eslint-plugin': '1.6.27',
  eslint: '10.13.0',
  'eslint-config-prettier': '10.1.8',
  'eslint-plugin-astro': '3.2.1',
  'eslint-plugin-jsdoc': '65.3.15',
  'eslint-plugin-jsx-a11y': '6.10.2',
  'eslint-plugin-react': '7.37.5',
  'eslint-plugin-react-hooks': '7.1.1',
  'eslint-plugin-unicorn': '76.0.0',
  typescript: '6.0.3',
  'typescript-eslint': '8.71.2',
}

/**
 * One external TS/React source linted as corpus, pinned to a commit.
 * Only `directories` (relative to the checkout) are linted.
 */
interface CorpusSource {
  name: string
  url: string
  commit: string
  directories: string[]
}

const CORPUS: readonly CorpusSource[] = [
  {
    name: 'vercel-commerce',
    url: 'https://github.com/vercel/commerce.git',
    commit: 'f7521d57d29f0eb3d23c1399cf9bb299d61fcd21',
    directories: ['app', 'components', 'lib'],
  },
  {
    name: 'shadcn-taxonomy',
    url: 'https://github.com/shadcn-ui/taxonomy.git',
    commit: '298a8857c7128a0d121e7f699dfd729f23b3966d',
    directories: ['app', 'components', 'config', 'hooks', 'lib'],
  },
  {
    name: 'pmndrs-zustand',
    url: 'https://github.com/pmndrs/zustand.git',
    commit: '382d29c485e67018c06e75ec7235130d0968522c',
    directories: ['src'],
  },
]

const HELP = `bun run lint:parity [options]

Differential lint parity gate: the baseline (a snapshot of the pre-migration
eslint.config.mjs, installed outside the repo) against the candidate (Oxlint
with --type-aware for every file, plus the repo's own ESLint for **/*.astro),
diffed per (file, line, rule). Exits 1 on any unexplained ESLint-only finding
or harness problem.

Inputs
  fixtures  scripts/lint-parity-fixtures/tree/**, one or more violations per
            enforced rule and policy, copied to their repo-relative paths
            (minus the .fixture suffix) for the run and removed afterwards.
  corpus    pinned external TS/React repos cloned into <work-dir>/corpus.
  The type-aware rules (tsgolint vs typescript-eslint) are reported apart.

Options
  --mode <fixtures|corpus|all>  what to compare (default all)
  --work-dir <path>             outside the repo (default ~/.cache/snug-lint-parity)
  --report <path>               also write the Markdown report here
  --write-expected              rewrite expected.json from the baseline findings
  --help                        show this text
`

type Mode = 'fixtures' | 'corpus' | 'all'

interface Options {
  mode: Mode
  workDirectory: string
  report: string | undefined
  isWritingExpected: boolean
}

function parseOptions(argv: string[]): Options | undefined {
  const { values } = parseArgs({
    args: argv,
    options: {
      mode: { type: 'string', default: 'all' },
      'work-dir': {
        type: 'string',
        default: path.join(os.homedir(), '.cache', 'snug-lint-parity'),
      },
      report: { type: 'string' },
      'write-expected': { type: 'boolean', default: false },
      help: { type: 'boolean', default: false },
    },
  })
  if (values.help) return undefined
  if (!['fixtures', 'corpus', 'all'].includes(values.mode)) {
    throw new Error(
      `--mode must be fixtures, corpus or all, not ${values.mode}`,
    )
  }
  const workDirectory = path.resolve(values['work-dir'])
  if (!path.relative(REPO_ROOT, workDirectory).startsWith('..')) {
    throw new Error(`--work-dir must be outside the repo: ${workDirectory}`)
  }
  return {
    mode: values.mode as Mode,
    workDirectory,
    report:
      values.report === undefined ? undefined : path.resolve(values.report),
    isWritingExpected: values['write-expected'],
  }
}

function run(
  command: string,
  arguments_: readonly string[],
  cwd: string,
  environment: Readonly<Record<string, string>> = {},
): { stdout: string; stderr: string; status: number | null } {
  const result = spawnSync(command, arguments_, {
    cwd,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 1024,
    env: { ...process.env, ...environment },
  })
  if (result.error) throw result.error
  return {
    stdout: result.stdout,
    stderr: result.stderr,
    status: result.status,
  }
}

function runChecked(
  command: string,
  arguments_: readonly string[],
  cwd: string,
): void {
  const { status, stderr } = run(command, arguments_, cwd)
  if (status !== 0) {
    throw new Error(`${command} ${arguments_.join(' ')} failed:\n${stderr}`)
  }
}

function ensureBaseline(workDirectory: string): string {
  const directory = path.join(workDirectory, 'baseline')
  mkdirSync(directory, { recursive: true })
  const manifest = `${JSON.stringify(
    {
      name: 'snug-lint-parity-baseline',
      private: true,
      type: 'module',
      dependencies: BASELINE_DEPENDENCIES,
    },
    undefined,
    2,
  )}\n`
  const manifestPath = path.join(directory, 'package.json')
  const isStale =
    !existsSync(manifestPath) ||
    readFileSync(manifestPath, 'utf8') !== manifest ||
    !existsSync(path.join(directory, 'node_modules', 'eslint'))
  if (isStale) {
    writeFileSync(manifestPath, manifest)
    console.info(`Installing the baseline ESLint into ${directory}`)
    runChecked('bun', ['install', '--silent'], directory)
  }
  cpSync(BASELINE_CONFIG_FIXTURE, path.join(directory, 'eslint.config.mjs'))
  return directory
}

const ESLINT_STATUS_OK = new Set([0, 1])

function runEslint(
  binaryRoot: string,
  config: string,
  cwd: string,
  targets: readonly string[],
  environment: Readonly<Record<string, string>>,
): string {
  const { stdout, stderr, status } = run(
    'node',
    [
      path.join(binaryRoot, 'node_modules', 'eslint', 'bin', 'eslint.js'),
      '--config',
      config,
      '--no-cache',
      '--no-warn-ignored',
      '--format',
      'json',
      ...targets,
    ],
    cwd,
    environment,
  )
  if (status === null || !ESLINT_STATUS_OK.has(status)) {
    throw new Error(`eslint exited with ${String(status)}:\n${stderr}`)
  }
  return stdout
}

/**
 * Lints `targets` (relative to `root`) with the baseline snapshot.
 * @param baselineDirectory - The external baseline install.
 * @param root - The directory linted from: the repo root or a corpus checkout.
 * @param targets - Files or directories relative to `root`.
 * @param prefix - Prepended to every finding's path.
 * @returns The baseline's findings.
 */
function runBaseline(
  baselineDirectory: string,
  root: string,
  targets: readonly string[],
  prefix: string,
): Finding[] {
  const stdout = runEslint(
    baselineDirectory,
    path.join(baselineDirectory, 'eslint.config.mjs'),
    root,
    targets,
    { LINT_PARITY_REPO_ROOT: REPO_ROOT, LINT_PARITY_BASE_PATH: root },
  )
  return parseEslintJson(stdout, root, prefix)
}

const ASTRO_GLOB = '**/*.astro'

/**
 * Lints `targets` with the candidate toolchain: Oxlint (type-aware) for
 * everything but `.astro`, and the repo's own `eslint.config.mjs` for
 * `.astro`, which Oxlint cannot see the templates of.
 * @param root - The directory linted from: the repo root or a corpus checkout.
 * @param targets - Files or directories relative to `root`.
 * @param prefix - Prepended to every finding's path.
 * @returns The candidate's findings.
 */
function runCandidate(
  root: string,
  targets: readonly string[],
  prefix: string,
): Finding[] {
  const { stdout, stderr, status } = run(
    path.join(REPO_ROOT, 'node_modules', '.bin', 'oxlint'),
    [
      '--config',
      path.join(REPO_ROOT, 'oxlint.config.ts'),
      '--type-aware',
      '--format',
      'json',
      '--ignore-pattern',
      ASTRO_GLOB,
      ...targets,
    ],
    root,
    {
      OXLINT_TSGOLINT_PATH: path.join(
        REPO_ROOT,
        'node_modules',
        '.bin',
        'tsgolint',
      ),
    },
  )
  if (status !== 0 && status !== 1) {
    throw new Error(`oxlint exited with ${String(status)}:\n${stderr}`)
  }
  const oxlint = parseOxlintJson(stdout, root, prefix)
  const astroTargets = targets.filter((target) => target.endsWith('.astro'))
  if (astroTargets.length === 0) return oxlint
  const astro = parseEslintJson(
    runEslint(
      REPO_ROOT,
      path.join(REPO_ROOT, 'eslint.config.mjs'),
      root,
      astroTargets,
      {},
    ),
    root,
    prefix,
  )
  return [...oxlint, ...astro]
}

function listFiles(directory: string): string[] {
  return readdirSync(directory, { recursive: true, encoding: 'utf8' })
    .filter((entry) => statSync(path.join(directory, entry)).isFile())
    .map((entry) => entry.split(path.sep).join('/'))
    .toSorted((left, right) => left.localeCompare(right))
}

/**
 * Copies the fixture tree to its repo-relative paths and returns them with a
 * cleanup that removes exactly what was created. Refuses to overwrite.
 * @returns The repo-relative fixture paths and their cleanup.
 */
function materializeFixtures(): { files: string[]; cleanup: () => void } {
  const sources = listFiles(FIXTURE_TREE)
  const files = sources.map((source) => fixtureTargetPath(source))
  const clash = files.find((file) => existsSync(path.join(REPO_ROOT, file)))
  if (clash !== undefined) {
    throw new Error(`Fixture ${clash} would overwrite an existing repo file`)
  }
  const created: string[] = []
  const cleanup = (): void => {
    for (const target of created.toReversed()) {
      rmSync(target, { recursive: true, force: true })
    }
  }
  try {
    for (const [index, source] of sources.entries()) {
      const target = path.join(REPO_ROOT, files[index] ?? source)
      let topmostMissing: string | undefined
      for (
        let directory = path.dirname(target);
        !existsSync(directory);
        directory = path.dirname(directory)
      ) {
        topmostMissing = directory
      }
      if (topmostMissing !== undefined) created.push(topmostMissing)
      mkdirSync(path.dirname(target), { recursive: true })
      cpSync(path.join(FIXTURE_TREE, source), target)
      created.push(target)
    }
  } catch (error) {
    cleanup()
    throw error
  }
  return { files, cleanup }
}

function ensureCorpus(workDirectory: string): string[] {
  return CORPUS.map((source) => {
    const target = path.join(workDirectory, 'corpus', source.name)
    if (!existsSync(path.join(target, '.git'))) {
      mkdirSync(target, { recursive: true })
      console.info(`Cloning ${source.url} at ${source.commit}`)
      runChecked('git', ['init', '--quiet'], target)
      runChecked(
        'git',
        ['fetch', '--quiet', '--depth', '1', source.url, source.commit],
        target,
      )
      runChecked(
        'git',
        ['checkout', '--quiet', '--detach', 'FETCH_HEAD'],
        target,
      )
    }
    modernizeTsconfig(path.join(target, 'tsconfig.json'))
    if (!existsSync(path.join(target, 'node_modules'))) {
      console.info(`Installing ${source.name} dependencies (no scripts)`)
      runChecked(
        'bun',
        ['install', '--ignore-scripts', '--silent', '--no-save'],
        target,
      )
    }
    return target
  })
}

/**
 * Compiler options TypeScript 7 (tsgolint) removed. A corpus checkout gets
 * them rewritten to their modern equivalents, so both linters type-check the
 * corpus under the same, loadable config instead of tsgolint rejecting it.
 */
const REMOVED_COMPILER_OPTIONS = new Set(['baseUrl', 'downlevelIteration'])

const MODERN_COMPILER_OPTIONS = {
  target: 'es2022',
  module: 'esnext',
  moduleResolution: 'bundler',
}

function modernizeTsconfig(file: string): void {
  const parsed = ts.parseConfigFileTextToJson(file, readFileSync(file, 'utf8'))
  if (parsed.error !== undefined) {
    throw new Error(
      `Cannot parse ${file}: ${ts.flattenDiagnosticMessageText(parsed.error.messageText, '\n')}`,
    )
  }
  const config = parsed.config as { compilerOptions?: Record<string, unknown> }
  const compilerOptions = Object.fromEntries(
    Object.entries(config.compilerOptions ?? {}).filter(
      ([option]) => !REMOVED_COMPILER_OPTIONS.has(option),
    ),
  )
  writeFileSync(
    file,
    JSON.stringify(
      {
        ...config,
        compilerOptions: { ...compilerOptions, ...MODERN_COMPILER_OPTIONS },
      },
      undefined,
      2,
    ),
  )
}

interface LoadedPlugin {
  default?: { rules?: unknown; plugin?: { rules?: unknown } }
  plugin?: { rules?: unknown }
  rules?: unknown
}

type RuleModules = Record<
  string,
  { meta?: { docs?: { requiresTypeChecking?: boolean } } }
>

async function typeAwareRuleIds(
  baselineDirectory: string,
): Promise<Set<string>> {
  const plugins: [string, string][] = [
    ['@typescript-eslint/', 'typescript-eslint'],
    ['@eslint-react/', '@eslint-react/eslint-plugin'],
  ]
  const ids = await Promise.all(
    plugins.map(async ([prefix, name]) => {
      const loaded = (await import(
        Bun.resolveSync(name, baselineDirectory)
      )) as LoadedPlugin
      const rules = (loaded.plugin?.rules ??
        loaded.default?.plugin?.rules ??
        loaded.default?.rules ??
        loaded.rules ??
        {}) as RuleModules
      return Object.entries(rules)
        .filter(([, rule]) => rule.meta?.docs?.requiresTypeChecking === true)
        .map(([rule]) => `${prefix}${rule}`)
    }),
  )
  return new Set(ids.flat())
}

const SEVERITY_OFF = new Set([0, 'off'])

function enforcedRules(
  baselineDirectory: string,
  files: readonly string[],
): Set<string> {
  const enforced = new Set<string>()
  for (const file of files) {
    const { stdout, status, stderr } = run(
      'node',
      [
        path.join(
          baselineDirectory,
          'node_modules',
          'eslint',
          'bin',
          'eslint.js',
        ),
        '--config',
        path.join(baselineDirectory, 'eslint.config.mjs'),
        '--print-config',
        file,
      ],
      REPO_ROOT,
      { LINT_PARITY_REPO_ROOT: REPO_ROOT, LINT_PARITY_BASE_PATH: REPO_ROOT },
    )
    if (status !== 0)
      throw new Error(`eslint --print-config ${file}:\n${stderr}`)
    const config = JSON.parse(stdout) as { rules?: Record<string, unknown> }
    const settings = Object.entries(config.rules ?? {})
    for (const [rule, setting] of settings) {
      const severity: unknown = Array.isArray(setting) ? setting[0] : setting
      const normalized = normalizeEslintRule(rule, '')
      if (normalized !== undefined && !SEVERITY_OFF.has(severity as never)) {
        enforced.add(normalized)
      }
    }
  }
  return enforced
}

interface Collected {
  baseline: Finding[]
  candidate: Finding[]
}

function collectFixtures(
  baselineDirectory: string,
  options: Options,
): Collected & { problems: string[]; uncoveredRules: string[] } {
  const { files, cleanup } = materializeFixtures()
  const handleSignal = (signal: NodeJS.Signals): void => {
    cleanup()
    process.off('SIGINT', handleSignal)
    process.off('SIGTERM', handleSignal)
    process.kill(process.pid, signal)
  }
  process.once('SIGINT', handleSignal)
  process.once('SIGTERM', handleSignal)
  try {
    const baseline = runBaseline(baselineDirectory, REPO_ROOT, files, '')
    if (options.isWritingExpected) {
      const expected = Object.fromEntries(
        files.map((file) => [
          file,
          [
            ...new Set(
              baseline
                .filter((item) => item.file === file)
                .map((item) => item.rule),
            ),
          ].toSorted(compareText),
        ]),
      )
      writeFileSync(
        EXPECTED_FILE,
        `${JSON.stringify(expected, undefined, 2)}\n`,
      )
      runChecked(
        path.join(REPO_ROOT, 'node_modules', '.bin', 'oxfmt'),
        [EXPECTED_FILE],
        REPO_ROOT,
      )
    }
    const expected = JSON.parse(readFileSync(EXPECTED_FILE, 'utf8')) as Record<
      string,
      string[]
    >
    const exercised = new Set(baseline.map((item) => item.rule))
    const uncoveredRules = [...enforcedRules(baselineDirectory, files)]
      .filter((rule) => !exercised.has(rule))
      .toSorted(compareText)
    return {
      baseline,
      candidate: runCandidate(REPO_ROOT, files, ''),
      problems: checkExpectedFixtures(expected, baseline, files),
      uncoveredRules,
    }
  } finally {
    process.off('SIGINT', handleSignal)
    process.off('SIGTERM', handleSignal)
    cleanup()
  }
}

function collectCorpus(baselineDirectory: string, options: Options): Collected {
  const checkouts = ensureCorpus(options.workDirectory)
  const collected: Collected = { baseline: [], candidate: [] }
  for (const [index, checkout] of checkouts.entries()) {
    const source = CORPUS[index]
    if (source === undefined) continue
    const prefix = `corpus/${source.name}/`
    console.info(`Linting corpus ${source.name}`)
    collected.baseline.push(
      ...runBaseline(baselineDirectory, checkout, source.directories, prefix),
    )
    collected.candidate.push(
      ...runCandidate(checkout, source.directories, prefix),
    )
  }
  return collected
}

function loadAccepted(): AcceptedEntry[] {
  return existsSync(ACCEPTED_FILE)
    ? parseAccepted(readFileSync(ACCEPTED_FILE, 'utf8'))
    : []
}

async function main(): Promise<number> {
  const options = parseOptions(process.argv.slice(2))
  if (options === undefined) {
    console.info(HELP)
    return 0
  }
  const baselineDirectory = ensureBaseline(options.workDirectory)
  const accepted = loadAccepted()
  const sections: SectionResult[] = []
  const problems: string[] = []
  let uncoveredRules: string[] = []
  if (options.mode !== 'corpus') {
    console.info('Linting fixtures')
    const fixtures = collectFixtures(baselineDirectory, options)
    problems.push(...fixtures.problems)
    uncoveredRules = fixtures.uncoveredRules
    sections.push(
      compareSection({ name: '(a) fixtures', ...fixtures, accepted }),
    )
  }
  if (options.mode !== 'fixtures') {
    const corpus = collectCorpus(baselineDirectory, options)
    sections.push(compareSection({ name: '(b) corpus', ...corpus, accepted }))
  }
  const report = renderReport({
    sections,
    typeAwareRules: await typeAwareRuleIds(baselineDirectory),
    problems,
    uncoveredRules,
  })
  const reportPath = path.join(options.workDirectory, 'report.md')
  writeFileSync(reportPath, report)
  writeFileSync(
    path.join(options.workDirectory, 'report.json'),
    JSON.stringify({ sections, problems, uncoveredRules }, undefined, 2),
  )
  if (options.report !== undefined) writeFileSync(options.report, report)
  console.info(report)
  console.info(`Report written to ${reportPath}`)
  const isPass =
    problems.length === 0 && sections.every((section) => section.exitCode === 0)
  return isPass ? 0 : 1
}

if (import.meta.main) process.exitCode = await main()
