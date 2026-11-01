import eslintComments from '@eslint-community/eslint-plugin-eslint-comments'

import { forwardWith } from './forward-with.mjs'

/**
 * Names of the `@eslint-community/eslint-plugin-eslint-comments` rules this
 * repo enforces: the `recommended` set plus `require-description`.
 */
const ENFORCED_RULE_NAMES = [
  'disable-enable-pair',
  'no-aggregating-enable',
  'no-duplicate-disable',
  'no-unlimited-disable',
  'no-unused-enable',
  'require-description',
]

/**
 * Rewrites the "force location" the upstream rules report with — a start
 * column of `-1`, meaning "the whole line" to ESLint — into an empty range
 * at column `0` of that line. Oxlint throws "Line/column pair translates to
 * an out of range offset" on the `-1` (oxc#23330). The range is empty so it
 * ends before the reported comment starts: ESLint's plugin patches the
 * linter so its reports are never suppressed, while Oxlint drops a report
 * that overlaps the `eslint-disable` comment it is about.
 * @param descriptor The report descriptor an upstream rule passed.
 * @returns The same descriptor with a non-negative start column.
 */
function clampReportLocation(descriptor) {
  const location = descriptor.loc
  if (!location?.start || location.start.column >= 0) {
    return descriptor
  }
  const lineStart = { line: location.start.line, column: 0 }
  return {
    ...descriptor,
    loc: { start: lineStart, end: lineStart },
  }
}

/**
 * Wraps an upstream rule so its reports survive Oxlint's stricter location
 * check, leaving its detection logic untouched.
 * @param rule The upstream rule module.
 * @returns A rule with the same `meta` and behavior.
 */
function withClampedReports(rule) {
  return {
    meta: rule.meta,
    create(context) {
      const clampedContext = forwardWith(context, {
        report: (descriptor) => context.report(clampReportLocation(descriptor)),
      })
      return rule.create(clampedContext)
    },
  }
}

/**
 * Local Oxlint plugin running the upstream `eslint-comments` rules this repo
 * enforces. The upstream plugin loaded as a jsPlugin crashes on the rules that
 * report a forced location (`require-description`, `no-unlimited-disable`,
 * `no-unused-enable`), so all six run through `withClampedReports`.
 * Registered as `eslint-comments` in `oxlint.config.ts`.
 */
const eslintCommentsPlugin = {
  meta: { name: 'eslint-comments' },
  rules: Object.fromEntries(
    ENFORCED_RULE_NAMES.map((name) => [
      name,
      withClampedReports(eslintComments.rules[name]),
    ]),
  ),
}

export default eslintCommentsPlugin
