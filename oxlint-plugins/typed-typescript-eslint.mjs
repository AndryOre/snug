import tseslint from 'typescript-eslint'

import { withTypeInformation } from './typed-react.mjs'

/**
 * Local Oxlint plugin running `@typescript-eslint/no-unsafe-assignment` as
 * the original rule with TypeScript `parserServices`, in place of the
 * tsgolint port: tsgolint does not report an `any` value passed to a JSX
 * prop typed `any` (oxc-project/tsgolint#1302), which typescript-eslint
 * reports. Registered as `typescript-eslint-js` in `oxlint.config.ts`.
 */
const typedTypescriptEslintPlugin = {
  meta: { name: 'typescript-eslint-js' },
  rules: {
    'no-unsafe-assignment': withTypeInformation(
      tseslint.plugin.rules['no-unsafe-assignment'],
    ),
  },
}

export default typedTypescriptEslintPlugin
