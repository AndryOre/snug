import unicorn from 'eslint-plugin-unicorn'

import { withTypeInformation } from './typed-react.mjs'

const TYPESCRIPT_FILE = /\.tsx?$/

const SKIPPED_KEYS = new Set(['parent', 'loc', 'range'])

const normalizedPrograms = new WeakSet()

/**
 * Rewrites the `accessibility: null` Oxlint puts on every class member to
 * `undefined`, the value both espree and `@typescript-eslint/parser` leave
 * when a member has no modifier. Rules such as `prefer-private-class-fields`
 * and `no-static-only-class` test `accessibility !== undefined` and report
 * nothing on the `null` form.
 * @param program The file's root AST node.
 */
function clearNullAccessibility(program) {
  const pending = [program]
  while (pending.length > 0) {
    const node = pending.pop()
    if (node.accessibility === null) {
      node.accessibility = undefined
    }
    for (const [key, value] of Object.entries(node)) {
      if (
        typeof value !== 'object' ||
        value === null ||
        SKIPPED_KEYS.has(key)
      ) {
        continue
      }
      const children = Array.isArray(value) ? value : [value]
      for (const child of children) {
        if (typeof child?.type === 'string') {
          pending.push(child)
        }
      }
    }
  }
}

/**
 * Adds the `kind` (`const`, `let`, `var`) that `eslint-scope` sets on every
 * variable definition, which the TypeScript scope manager Oxlint uses
 * leaves out. ESLint lints JavaScript files with `eslint-scope`, so rules
 * such as `no-blob-to-file` and `prefer-set-has` that require
 * `definition.kind === 'const'` only report there.
 * @param scopeManager The file's scope manager.
 */
function addDefinitionKinds(scopeManager) {
  for (const scope of scopeManager.scopes) {
    for (const variable of scope.variables) {
      for (const definition of variable.defs) {
        if (definition.type === 'Variable' && definition.kind === undefined) {
          definition.kind = definition.parent?.kind
        }
      }
    }
  }
}

/**
 * Brings the file's AST and scopes to the shape ESLint gives unicorn rules:
 * the espree or typescript-eslint AST, and `eslint-scope` definitions on
 * JavaScript files. Runs once per file, however many rules ask; keyed by
 * the file's AST, because Oxlint reuses one `scopeManager` object across
 * files.
 * @param context The rule context.
 * @param isTypeScript Whether the file is linted as TypeScript.
 */
function normalizeForEslint(context, isTypeScript) {
  const { sourceCode } = context
  if (normalizedPrograms.has(sourceCode.ast)) {
    return
  }
  normalizedPrograms.add(sourceCode.ast)
  clearNullAccessibility(sourceCode.ast)
  if (!isTypeScript) {
    addDefinitionKinds(sourceCode.scopeManager)
  }
}

/**
 * Wraps an `eslint-plugin-unicorn` rule so it sees what ESLint gives it.
 * TypeScript files get TypeScript `parserServices`, as under
 * `@typescript-eslint/parser`: many unicorn rules ask the type checker
 * whether a value is a string, an array or a function before reporting, and
 * report nothing without it. Every file gets the AST and scope shape the
 * rule expects (see `normalizeForEslint`).
 * @param rule The original unicorn rule module.
 * @returns A rule with the same `meta` and options.
 */
function withEslintCompatibility(rule) {
  const typedRule = withTypeInformation(rule)
  return {
    meta: rule.meta,
    create(context) {
      const fileName = context.physicalFilename ?? context.filename
      const isTypeScript = TYPESCRIPT_FILE.test(fileName)
      normalizeForEslint(context, isTypeScript)
      return isTypeScript ? typedRule.create(context) : rule.create(context)
    },
  }
}

/**
 * Local Oxlint plugin running every `eslint-plugin-unicorn` rule as the
 * original ESLint rule, with type information on TypeScript files. Registered
 * as `unicorn-js` in `oxlint.config.ts`, so `unicorn-js/*` directives stay
 * valid in both linters.
 */
const typedUnicornPlugin = {
  meta: { name: 'unicorn-js' },
  rules: Object.fromEntries(
    Object.entries(unicorn.rules).map(([name, rule]) => [
      name,
      withEslintCompatibility(rule),
    ]),
  ),
}

export default typedUnicornPlugin
