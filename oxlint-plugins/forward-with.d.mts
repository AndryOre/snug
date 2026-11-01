/**
 * Type declaration for `./forward-with.mjs`, needed because this module is
 * imported from `forward-with.test.ts` and TypeScript cannot infer types
 * across a `.ts` -> `.mjs` import without one.
 */
export declare function forwardWith(
  target: object,
  overrides: Record<string, unknown>,
): object
