import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

import rule from './no-non-doc-comments.mjs'

RuleTester.describe = describe
RuleTester.it = it

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
})

ruleTester.run('no-non-doc-comments (ESLint engine)', rule, {
  valid: [
    {
      name: 'JSDoc block comment',
      code: '/**\n * Explains the export.\n */\nexport const value = 1\n',
    },
    {
      name: 'eslint-disable directive',
      code: '// eslint-disable-next-line no-console\nconsole.log(1)\n',
    },
    {
      name: 'oxlint-disable directive',
      code: '// oxlint-disable-next-line no-console\nconsole.log(1)\n',
    },
  ],
  invalid: [
    {
      name: 'line comment',
      code: '// explains the export\nexport const value = 1\n',
      errors: [{ messageId: 'noNonDocComment' }],
    },
    {
      name: 'non-JSDoc block comment',
      code: '/* explains the export */\nexport const value = 1\n',
      errors: [{ messageId: 'noNonDocComment' }],
    },
  ],
})
