import { RuleTester } from 'oxlint/plugins-dev'
import { describe, it } from 'vitest'

import eslintCommentsPlugin from './eslint-comments.mjs'

RuleTester.describe = describe
RuleTester.it = it

const ruleTester = new RuleTester({
  languageOptions: { sourceType: 'module', parserOptions: { lang: 'ts' } },
})

ruleTester.run(
  'eslint-comments/require-description',
  eslintCommentsPlugin.rules['require-description'],
  {
    valid: [
      {
        name: 'described disable-next-line',
        code: '// eslint-disable-next-line no-console -- debugging aid\nconsole.log(1)\n',
      },
      { name: 'no directive', code: 'export const value = 1\n' },
    ],
    invalid: [
      {
        name: 'undescribed disable-next-line',
        code: '// eslint-disable-next-line no-console\nconsole.log(1)\n',
        errors: [{ messageId: 'missingDescription' }],
      },
      {
        name: 'undescribed block enable',
        code: '/* eslint-disable no-console -- paired */\nconsole.log(1)\n/* eslint-enable no-console */\n',
        errors: [{ messageId: 'missingDescription' }],
      },
    ],
  },
)

ruleTester.run(
  'eslint-comments/no-unlimited-disable',
  eslintCommentsPlugin.rules['no-unlimited-disable'],
  {
    valid: [
      {
        name: 'named rule',
        code: '// eslint-disable-next-line no-console\nconsole.log(1)\n',
      },
    ],
    invalid: [
      {
        name: 'unnamed disable-next-line',
        code: '// eslint-disable-next-line\nconsole.log(1)\n',
        errors: [{ messageId: 'unexpected' }],
      },
      {
        name: 'unnamed block disable',
        code: '/* eslint-disable */\nconsole.log(1)\n',
        errors: [{ messageId: 'unexpected' }],
      },
    ],
  },
)

ruleTester.run(
  'eslint-comments/no-unused-enable',
  eslintCommentsPlugin.rules['no-unused-enable'],
  {
    valid: [
      {
        name: 'enable after disable',
        code: '/* eslint-disable no-console */\nconsole.log(1)\n/* eslint-enable no-console */\n',
      },
    ],
    invalid: [
      {
        name: 'enable without disable',
        code: '/* eslint-enable no-console */\nconsole.log(1)\n',
        errors: [{ messageId: 'unusedRule' }],
      },
      {
        name: 'bare enable without disable',
        code: '/* eslint-enable */\nconsole.log(1)\n',
        errors: [{ messageId: 'unused' }],
      },
    ],
  },
)

ruleTester.run(
  'eslint-comments/disable-enable-pair',
  eslintCommentsPlugin.rules['disable-enable-pair'],
  {
    valid: [
      {
        name: 'disable then enable',
        code: '/* eslint-disable no-console */\nconsole.log(1)\n/* eslint-enable no-console */\n',
      },
    ],
    invalid: [
      {
        name: 'disable never re-enabled',
        code: 'export const value = 1\n/* eslint-disable no-console */\nconsole.log(1)\n',
        errors: [{ messageId: 'missingRulePair' }],
      },
    ],
  },
)

ruleTester.run(
  'eslint-comments/no-duplicate-disable',
  eslintCommentsPlugin.rules['no-duplicate-disable'],
  {
    valid: [
      {
        name: 'single disable',
        code: '/* eslint-disable no-console */\nconsole.log(1)\n',
      },
    ],
    invalid: [
      {
        name: 'second disable of the same rule',
        code: '/* eslint-disable no-console */\n/* eslint-disable no-console */\nconsole.log(1)\n',
        errors: [{ messageId: 'duplicateRule' }],
      },
    ],
  },
)

ruleTester.run(
  'eslint-comments/no-aggregating-enable',
  eslintCommentsPlugin.rules['no-aggregating-enable'],
  {
    valid: [
      {
        name: 'one enable per disable',
        code: '/* eslint-disable no-console */\nconsole.log(1)\n/* eslint-enable no-console */\n',
      },
    ],
    invalid: [
      {
        name: 'one enable re-enabling two disables',
        code: '/* eslint-disable no-console */\n/* eslint-disable no-alert */\nconsole.log(1)\n/* eslint-enable */\n',
        errors: [{ messageId: 'aggregatingEnable' }],
      },
    ],
  },
)
