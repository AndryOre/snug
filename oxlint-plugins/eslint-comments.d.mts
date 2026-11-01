import type { RuleTester } from 'oxlint/plugins-dev'

/**
 * Type declaration for `./eslint-comments.mjs`, needed because this module is
 * imported from `eslint-comments.test.ts` and TypeScript cannot infer types
 * across a `.ts` -> `.mjs` import without one.
 */
declare const eslintCommentsPlugin: {
  rules: Record<
    | 'disable-enable-pair'
    | 'no-aggregating-enable'
    | 'no-duplicate-disable'
    | 'no-unlimited-disable'
    | 'no-unused-enable'
    | 'require-description',
    Parameters<RuleTester['run']>[1]
  >
}

export default eslintCommentsPlugin
