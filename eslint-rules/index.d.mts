import type { Rule } from 'eslint'

/**
 * Type declaration for `./index.mjs`, needed because this module is imported
 * from `index.test.ts` and TypeScript cannot infer types across a `.ts` ->
 * `.mjs` import without one.
 */
declare const localPlugin: { rules: Record<string, Rule.RuleModule> }

export default localPlugin
