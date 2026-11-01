import path from 'node:path'

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
export interface AcceptedEntry {
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

export const compareText = (left: string, right: string): number =>
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
export interface SectionResult {
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
