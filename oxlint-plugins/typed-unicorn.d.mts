import type { RuleTester } from 'oxlint/plugins-dev'

/**
 * Type declaration for `./typed-unicorn.mjs`, needed because this module is
 * imported from `typed-unicorn.test.ts` and TypeScript cannot infer types
 * across a `.ts` -> `.mjs` import without one.
 */
declare const typedUnicornPlugin: {
  rules: Record<string, Parameters<RuleTester['run']>[1]>
}

export default typedUnicornPlugin
