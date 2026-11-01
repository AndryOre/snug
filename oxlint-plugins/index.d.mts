import type { RuleTester } from 'oxlint/plugins-dev'

/**
 * Type declaration for `./index.mjs`, needed because this module is imported
 * from `index.test.ts` and TypeScript cannot infer types across a `.ts` ->
 * `.mjs` import without one.
 */
declare const localPlugin: {
  rules: Record<'no-non-doc-comments', Parameters<RuleTester['run']>[1]>
}

export default localPlugin
