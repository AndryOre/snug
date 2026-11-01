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

/**
 * Pseudo rule id for "unused disable directive" reports: ESLint emits them
 * without a rule id, Oxlint with an empty code, and both are enforced.
 */
export const UNUSED_DIRECTIVE_RULE = 'unused-disable-directive'

/**
 * Pseudo rule id for an Oxlint diagnostic that carries no `code` and is not
 * an unused-directive report, so it still shows up in the diff.
 */
export const OXLINT_UNCODED_RULE = 'oxlint-uncoded-diagnostic'

const UNUSED_DIRECTIVE_MESSAGE =
  /^Unused (?:eslint|oxlint)-(?:disable|enable) directive/

const UNKNOWN_RULE_MESSAGE = /^Definition for rule '.+' was not found\.?$/

const OXLINT_PLUGIN_PREFIX: Readonly<Record<string, string>> = {
  eslint: '',
  'eslint-js': '',
  typescript: '@typescript-eslint/',
  'typescript-eslint': '@typescript-eslint/',
  unicorn: 'unicorn/',
  'unicorn-js': 'unicorn/',
  'jsx-a11y': 'jsx-a11y/',
  'jsx-a11y-js': 'jsx-a11y/',
  'react-js': 'react/',
  'react-hooks-js': 'react-hooks/',
  jsdoc: 'jsdoc/',
  'jsdoc-js': 'jsdoc/',
  'eslint-comments': '@eslint-community/eslint-comments/',
  'typed-react': '@eslint-react/',
}

/**
 * ESLint id prefixes that `eslint.config.mjs` registers a second time under a
 * `-js` alias, so a disable directive is valid in both linters.
 */
const ESLINT_ALIAS_PREFIX: Readonly<Record<string, string>> = {
  'unicorn-js/': 'unicorn/',
  'jsx-a11y-js/': 'jsx-a11y/',
}

/**
 * `eslint-plugin-react-hooks` rules Oxlint ports natively under its `react`
 * plugin; every other native `react(...)` rule is `eslint-plugin-react`.
 */
const REACT_HOOKS_NATIVE_RULES = new Set([
  'rules-of-hooks',
  'exhaustive-deps',
  'static-components',
  'use-memo',
  'void-use-memo',
  'preserve-manual-memoization',
  'incompatible-library',
  'immutability',
  'globals',
  'refs',
  'set-state-in-effect',
  'error-boundaries',
  'purity',
  'set-state-in-render',
  'unsupported-syntax',
  'component-hook-factories',
  'config',
  'gating',
])

/**
 * Core rules whose typescript-eslint extension `recommendedTypeChecked`
 * enables; Oxlint's native port enforces the extension under the core id.
 */
const TYPESCRIPT_EXTENSION_RULES = new Set([
  'no-array-constructor',
  'no-unused-expressions',
  'no-unused-vars',
])

function prefixOf(plugin: string, rule: string): string {
  if (plugin === 'react') {
    return REACT_HOOKS_NATIVE_RULES.has(rule) ? 'react-hooks/' : 'react/'
  }
  const isTypescriptExtension =
    (plugin === 'eslint' || plugin === 'typescript') &&
    TYPESCRIPT_EXTENSION_RULES.has(rule)
  return isTypescriptExtension
    ? '@typescript-eslint/'
    : (OXLINT_PLUGIN_PREFIX[plugin] ?? `${plugin}/`)
}

/**
 * Maps an Oxlint diagnostic `code` (`plugin(rule)`) to the ESLint rule id the
 * baseline config reports the same rule under: native plugins, the `-js`
 * jsPlugin aliases, the local `eslint-comments` port and the `typed-react`
 * shim. Unknown plugins map to `plugin/rule`.
 * @param code - The Oxlint diagnostic code, such as `eslint(no-var)`.
 * @param message - The diagnostic message, used for uncoded diagnostics.
 * @returns The ESLint rule id.
 */
export function normalizeOxlintCode(code: string, message: string): string {
  if (code === '') {
    return UNUSED_DIRECTIVE_MESSAGE.test(message)
      ? UNUSED_DIRECTIVE_RULE
      : OXLINT_UNCODED_RULE
  }
  const match = /^([^()]+)\((.+)\)$/.exec(code)
  if (!match) return code
  const [, plugin = '', rule = ''] = match
  return `${prefixOf(plugin, rule)}${rule}`
}

/**
 * Maps an ESLint message to its comparable rule id: `-js` aliases fold into
 * the plugin's own id, and unused or unknown-rule directives become the
 * unused-directive pseudo rule.
 * @param ruleId - The message's rule id.
 * @param message - The message text.
 * @returns The rule id, or undefined for a message that is not a finding.
 */
export function normalizeEslintRule(
  ruleId: string | null,
  message: string,
): string | undefined {
  if (UNKNOWN_RULE_MESSAGE.test(message)) return UNUSED_DIRECTIVE_RULE
  if (ruleId === null) {
    return UNUSED_DIRECTIVE_MESSAGE.test(message)
      ? UNUSED_DIRECTIVE_RULE
      : undefined
  }
  const alias = Object.keys(ESLINT_ALIAS_PREFIX).find((prefix) =>
    ruleId.startsWith(prefix),
  )
  return alias === undefined
    ? ruleId
    : `${ESLINT_ALIAS_PREFIX[alias] ?? ''}${ruleId.slice(alias.length)}`
}

/**
 * One lint finding, identified by `(file, line, rule)` in baseline ESLint
 * rule ids.
 */
export interface Finding {
  file: string
  line: number
  rule: string
}

/**
 * A documented, explained gap. Omitting `line` accepts every line of that
 * `(file, rule)`; `reason` is mandatory and must not be blank.
 */
interface AcceptedEntry {
  file: string
  line?: number
  rule: string
  reason: string
}

interface FindingsDiff {
  common: Finding[]
  eslintOnly: Finding[]
  oxlintOnly: Finding[]
}

const findingKey = (item: Finding): string =>
  `${item.file}:${String(item.line)}:${item.rule}`

const compareText = (left: string, right: string): number =>
  left.localeCompare(right)

const compareFindings = (left: Finding, right: Finding): number =>
  left.file.localeCompare(right.file) ||
  left.line - right.line ||
  left.rule.localeCompare(right.rule)

function uniqueSorted(findings: readonly Finding[]): Finding[] {
  const byKey = new Map(findings.map((item) => [findingKey(item), item]))
  return byKey.values().toArray().toSorted(compareFindings)
}

/**
 * Splits two finding sets by exact `(file, line, rule)` identity. Duplicates
 * collapse and every list comes back sorted, so output is deterministic.
 * @param eslint - Findings reported by the baseline ESLint.
 * @param oxlint - Findings reported by the candidate, in ESLint rule ids.
 * @returns The findings split into common, ESLint-only and Oxlint-only.
 */
export function diffFindings(
  eslint: readonly Finding[],
  oxlint: readonly Finding[],
): FindingsDiff {
  const eslintUnique = uniqueSorted(eslint)
  const oxlintUnique = uniqueSorted(oxlint)
  const eslintKeys = new Set(eslintUnique.map((item) => findingKey(item)))
  const oxlintKeys = new Set(oxlintUnique.map((item) => findingKey(item)))
  return {
    common: eslintUnique.filter((item) => oxlintKeys.has(findingKey(item))),
    eslintOnly: eslintUnique.filter(
      (item) => !oxlintKeys.has(findingKey(item)),
    ),
    oxlintOnly: oxlintUnique.filter(
      (item) => !eslintKeys.has(findingKey(item)),
    ),
  }
}

/**
 * Parses an `accepted.json` document. Throws on a non-array, a malformed
 * entry, or an entry whose `reason` is missing or blank: a gap is never
 * accepted without an explanation.
 * @param text - The raw `accepted.json` content.
 * @returns The validated entries.
 */
export function parseAccepted(text: string): AcceptedEntry[] {
  const document: unknown = JSON.parse(text)
  if (!Array.isArray(document)) {
    throw new TypeError('accepted.json must be a JSON array')
  }
  return (document as unknown[]).map((raw, index) => {
    const entry = raw as Partial<AcceptedEntry> | null
    const label = `accepted.json entry ${String(index)}`
    if (typeof entry?.file !== 'string' || typeof entry.rule !== 'string') {
      throw new TypeError(`${label} needs string "file" and "rule"`)
    }
    if (typeof entry.reason !== 'string' || entry.reason.trim() === '') {
      throw new TypeError(`${label} needs a non-empty "reason"`)
    }
    if (entry.line !== undefined && typeof entry.line !== 'number') {
      throw new TypeError(`${label} "line" must be a number`)
    }
    return {
      file: entry.file,
      ...(entry.line !== undefined && { line: entry.line }),
      rule: entry.rule,
      reason: entry.reason,
    }
  })
}

/**
 * How far apart, in lines, an ESLint-only and an Oxlint-only finding of the
 * same `(file, rule)` may be and still count as one finding reported at a
 * different node position (a multi-line node's start versus its name).
 */
const LINE_SHIFT_WINDOW = 2

/**
 * One finding both linters report, on lines up to `LINE_SHIFT_WINDOW` apart.
 */
interface LineShift {
  eslint: Finding
  oxlint: Finding
}

const lineDistance = (pair: LineShift): number =>
  Math.abs(pair.oxlint.line - pair.eslint.line)

function pairLineShifts(
  eslintOnly: readonly Finding[],
  oxlintOnly: readonly Finding[],
): { lineShifts: LineShift[]; eslintOnly: Finding[]; oxlintOnly: Finding[] } {
  const candidates = eslintOnly
    .flatMap((eslint) =>
      oxlintOnly
        .filter(
          (oxlint) =>
            oxlint.file === eslint.file &&
            oxlint.rule === eslint.rule &&
            Math.abs(oxlint.line - eslint.line) <= LINE_SHIFT_WINDOW,
        )
        .map((oxlint) => ({ eslint, oxlint })),
    )
    .toSorted(
      (left, right) =>
        lineDistance(left) - lineDistance(right) ||
        compareFindings(left.eslint, right.eslint),
    )
  const pairedEslint = new Set<Finding>()
  const pairedOxlint = new Set<Finding>()
  const lineShifts: LineShift[] = []
  for (const pair of candidates) {
    if (pairedEslint.has(pair.eslint) || pairedOxlint.has(pair.oxlint)) continue
    pairedEslint.add(pair.eslint)
    pairedOxlint.add(pair.oxlint)
    lineShifts.push(pair)
  }
  return {
    lineShifts: lineShifts.toSorted((left, right) =>
      compareFindings(left.eslint, right.eslint),
    ),
    eslintOnly: eslintOnly.filter((item) => !pairedEslint.has(item)),
    oxlintOnly: oxlintOnly.filter((item) => !pairedOxlint.has(item)),
  }
}

const isCoveredBy = (entry: AcceptedEntry, item: Finding): boolean =>
  entry.file === item.file &&
  entry.rule === item.rule &&
  (entry.line === undefined || entry.line === item.line)

/**
 * The inputs of one comparison: what the baseline ESLint and the candidate
 * (Oxlint, plus the `.astro`-scoped ESLint) report over the same files.
 */
interface SectionInput {
  name: string
  baseline: readonly Finding[]
  candidate: readonly Finding[]
  accepted: readonly AcceptedEntry[]
}

/**
 * The outcome of one comparison. `unexplained` fails the gate; `explained`
 * gaps carry their `accepted.json` reason; `lineShifts` are findings both
 * sides report a line or two apart; `stale` accepted entries matched nothing.
 */
interface SectionResult {
  name: string
  common: Finding[]
  oxlintOnly: Finding[]
  lineShifts: LineShift[]
  explained: (Finding & { reason: string })[]
  unexplained: Finding[]
  stale: AcceptedEntry[]
  exitCode: 0 | 1
}

/**
 * Diffs one section, pairs line shifts, then applies the accepted gaps to
 * what is left ESLint-only. Anything still unexplained fails the gate.
 * @param input - The section's findings and accepted gaps.
 * @returns The classified findings and the section's exit code.
 */
export function compareSection(input: SectionInput): SectionResult {
  const diff = diffFindings(input.baseline, input.candidate)
  const paired = pairLineShifts(diff.eslintOnly, diff.oxlintOnly)
  const unexplained: Finding[] = []
  const explained: SectionResult['explained'] = []
  const used = new Set<AcceptedEntry>()
  for (const item of paired.eslintOnly) {
    const match = input.accepted.find((entry) => isCoveredBy(entry, item))
    if (match === undefined) {
      unexplained.push(item)
    } else {
      used.add(match)
      explained.push({ ...item, reason: match.reason })
    }
  }
  return {
    name: input.name,
    common: diff.common,
    oxlintOnly: paired.oxlintOnly,
    lineShifts: paired.lineShifts,
    explained,
    unexplained,
    stale: input.accepted.filter((entry) => !used.has(entry)),
    exitCode: unexplained.length > 0 ? 1 : 0,
  }
}

/**
 * Per-rule counts of a section: common findings, unexplained ESLint-only
 * gaps, Oxlint-only extras, and explained differences (accepted gaps plus
 * line shifts).
 */
interface RuleSummary {
  rule: string
  common: number
  eslintOnly: number
  oxlintOnly: number
  explained: number
}

type RuleCount = Exclude<keyof RuleSummary, 'rule'>

/**
 * Groups a section's findings per rule, sorted by rule id.
 * @param result - A compared section.
 * @returns One row per rule that appears anywhere in the section.
 */
export function summarizeByRule(result: SectionResult): RuleSummary[] {
  const rows = new Map<string, RuleSummary>()
  const tally = (rule: string, column: RuleCount): void => {
    const row = rows.get(rule) ?? {
      rule,
      common: 0,
      eslintOnly: 0,
      oxlintOnly: 0,
      explained: 0,
    }
    row[column] += 1
    rows.set(rule, row)
  }
  for (const item of result.common) tally(item.rule, 'common')
  for (const item of result.unexplained) tally(item.rule, 'eslintOnly')
  for (const item of result.oxlintOnly) tally(item.rule, 'oxlintOnly')
  for (const item of result.explained) tally(item.rule, 'explained')
  for (const pair of result.lineShifts) tally(pair.eslint.rule, 'explained')
  return rows
    .values()
    .toArray()
    .toSorted((left, right) => left.rule.localeCompare(right.rule))
}

interface EslintResult {
  filePath: string
  messages: {
    ruleId: string | null
    line: number
    message?: string
    fatal?: boolean
  }[]
}

/**
 * Reads `eslint --format json` output. Fatal messages (parse errors) throw so
 * a file ESLint could not analyse never silently drops out of the comparison.
 * @param text - The raw `eslint --format json` output.
 * @param root - The directory paths become relative to.
 * @param prefix - Prepended to every relative path, such as `corpus/<name>/`.
 * @returns The findings, one per reported rule.
 */
export function parseEslintJson(
  text: string,
  root: string,
  prefix: string,
): Finding[] {
  const results = JSON.parse(text) as EslintResult[]
  const fatal = results.flatMap((result) =>
    result.messages
      .filter((message) => message.fatal === true)
      .map((message) => `${result.filePath}: ${message.message ?? 'fatal'}`),
  )
  if (fatal.length > 0) {
    throw new Error(`ESLint reported fatal errors:\n${fatal.join('\n')}`)
  }
  return results.flatMap((result) =>
    result.messages.flatMap((message) => {
      const rule = normalizeEslintRule(message.ruleId, message.message ?? '')
      return rule === undefined
        ? []
        : {
            file: `${prefix}${path.relative(root, result.filePath)}`,
            line: message.line,
            rule,
          }
    }),
  )
}

interface OxlintOutput {
  diagnostics: {
    code?: string
    message?: string
    filename: string
    labels?: { span: { line: number } }[]
  }[]
}

/**
 * Reads `oxlint --format json` output. A diagnostic without a label has no
 * location and is kept at line 0 so it still shows up in the diff.
 * @param text - The raw `oxlint --format json` output.
 * @param root - The directory relative paths are resolved against.
 * @param prefix - Prepended to every relative path, such as `corpus/<name>/`.
 * @returns The findings, one per diagnostic.
 */
export function parseOxlintJson(
  text: string,
  root: string,
  prefix: string,
): Finding[] {
  const output = JSON.parse(text) as OxlintOutput
  return output.diagnostics.map((diagnostic) => {
    const relative = path.isAbsolute(diagnostic.filename)
      ? path.relative(root, diagnostic.filename)
      : diagnostic.filename
    return {
      file: `${prefix}${relative}`,
      line: diagnostic.labels?.[0]?.span.line ?? 0,
      rule: normalizeOxlintCode(
        diagnostic.code ?? '',
        diagnostic.message ?? '',
      ),
    }
  })
}

const FIXTURE_SUFFIX = '.fixture'

/**
 * The repo-relative path a fixture is copied to for the run. Every fixture
 * carries a `.fixture` suffix so lint, typecheck, format, knip and the test
 * runner never pick it up where it is committed.
 * @param fixture - The fixture path relative to the fixture tree.
 * @returns The path without the suffix.
 */
export function fixtureTargetPath(fixture: string): string {
  if (!fixture.endsWith(FIXTURE_SUFFIX)) {
    throw new Error(`Fixture ${fixture} must end in ${FIXTURE_SUFFIX}`)
  }
  return fixture.slice(0, -FIXTURE_SUFFIX.length)
}

/**
 * Harness check: the baseline must flag every rule `expected.json` lists for
 * a fixture, and every fixture must be listed, so a fixture that stops
 * violating its rule cannot silently empty the comparison.
 * @param expected - Fixture path to the rule ids it must trigger.
 * @param baseline - The baseline's findings on the fixtures.
 * @param files - Every materialized fixture path.
 * @returns One message per problem; empty when the fixtures are sound.
 */
export function checkExpectedFixtures(
  expected: Readonly<Record<string, readonly string[]>>,
  baseline: readonly Finding[],
  files: readonly string[],
): string[] {
  const seen = new Set(baseline.map((item) => `${item.file}|${item.rule}`))
  const missing = Object.entries(expected).flatMap(([file, rules]) =>
    rules
      .filter((rule) => !seen.has(`${file}|${rule}`))
      .map((rule) => `ESLint did not report ${rule} on fixture ${file}`),
  )
  const unlisted = files
    .filter((file) => !Object.hasOwn(expected, file))
    .map((file) => `Fixture ${file} is missing from expected.json`)
  return [...missing, ...unlisted]
}

const formatFinding = (item: Finding): string =>
  `- \`${item.file}:${String(item.line)}\` \`${item.rule}\``

function renderRuleTable(rows: readonly RuleSummary[]): string[] {
  if (rows.length === 0) return ['_No findings._']
  return [
    '| Rule | Common | ESLint-only (gap) | Oxlint-only (extra) | Explained |',
    '| --- | ---: | ---: | ---: | ---: |',
    ...rows.map(
      (row) =>
        `| \`${row.rule}\` | ${String(row.common)} | ${String(row.eslintOnly)} | ${String(row.oxlintOnly)} | ${String(row.explained)} |`,
    ),
  ]
}

function renderSection(result: SectionResult): string[] {
  const explainedCount = result.explained.length + result.lineShifts.length
  return [
    `## ${result.name}`,
    '',
    ...renderRuleTable(summarizeByRule(result)),
    '',
    `### ESLint-only, UNEXPLAINED (${String(result.unexplained.length)})`,
    '',
    ...result.unexplained.map((item) => formatFinding(item)),
    '',
    `### Explained differences (${String(explainedCount)})`,
    '',
    ...result.explained.map((item) => `${formatFinding(item)}: ${item.reason}`),
    ...result.lineShifts.map(
      (pair) =>
        `${formatFinding(pair.eslint)}: same rule reported by Oxlint on line ${String(pair.oxlint.line)}`,
    ),
    '',
    `### Oxlint-only (${String(result.oxlintOnly.length)})`,
    '',
    ...result.oxlintOnly.map((item) => formatFinding(item)),
    '',
    ...(result.stale.length > 0
      ? [
          `### Stale accepted entries (${String(result.stale.length)})`,
          '',
          ...result.stale.map(
            (entry) =>
              `- \`${entry.file}:${String(entry.line ?? '*')}\` \`${entry.rule}\``,
          ),
          '',
        ]
      : []),
  ]
}

/**
 * Everything the report needs: the compared sections, which rule ids are
 * type-aware (section (c)), harness problems and the enforced rules no
 * fixture exercises.
 */
interface ReportInput {
  sections: readonly SectionResult[]
  typeAwareRules: ReadonlySet<string>
  problems: readonly string[]
  uncoveredRules: readonly string[]
}

/**
 * Renders the Markdown parity report: the gate verdict, one per-rule table
 * per section, the type-aware rules (tsgolint versus typescript-eslint)
 * across every section, harness problems and fixture coverage gaps.
 * @param input - The compared sections and their context.
 * @returns The report as Markdown.
 */
export function renderReport(input: ReportInput): string {
  const unexplained = input.sections.flatMap((result) => result.unexplained)
  const isPass = unexplained.length === 0 && input.problems.length === 0
  const typeAwareRows = input.sections.flatMap((result) =>
    summarizeByRule(result)
      .filter((row) => input.typeAwareRules.has(row.rule))
      .map((row) => ({ ...row, rule: `${result.name}: ${row.rule}` })),
  )
  const problemLines =
    input.problems.length > 0
      ? [
          '## Harness problems',
          '',
          ...input.problems.map((problem) => `- ${problem}`),
          '',
        ]
      : []
  return [
    '# Lint parity report: baseline ESLint vs Oxlint',
    '',
    `Gate: ${isPass ? 'PASS' : 'FAIL'}`,
    '',
    `UNEXPLAINED ESLint-only findings: ${String(unexplained.length)}`,
    '',
    ...unexplained.map((item) => formatFinding(item)),
    '',
    ...problemLines,
    ...input.sections.flatMap((result) => renderSection(result)),
    '## (c) Type-aware rules: tsgolint vs typescript-eslint',
    '',
    ...renderRuleTable(typeAwareRows),
    '',
    `## Enforced rules no fixture exercises (${String(input.uncoveredRules.length)})`,
    '',
    ...input.uncoveredRules.map((rule) => `- \`${rule}\``),
    '',
  ].join('\n')
}

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
