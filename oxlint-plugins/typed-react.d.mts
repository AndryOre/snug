import type { RuleTester } from 'oxlint/plugins-dev'

/**
 * Type declaration for `./typed-react.mjs`, needed because this module is
 * imported from `typed-react.test.ts` and TypeScript cannot infer types
 * across a `.ts` -> `.mjs` import without one.
 */
declare const typedReactPlugin: {
  rules: Record<
    'no-leaked-conditional-rendering',
    Parameters<RuleTester['run']>[1]
  >
}

export default typedReactPlugin
