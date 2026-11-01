import type { RuleTester } from 'oxlint/plugins-dev'

/**
 * Type declaration for `./typed-typescript-eslint.mjs`, needed because this
 * module is imported from `typed-typescript-eslint.test.ts` and TypeScript
 * cannot infer types across a `.ts` -> `.mjs` import without one.
 */
declare const typedTypescriptEslintPlugin: {
  rules: Record<'no-unsafe-assignment', Parameters<RuleTester['run']>[1]>
}

export default typedTypescriptEslintPlugin
