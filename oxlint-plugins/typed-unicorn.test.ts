import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { RuleTester } from 'oxlint/plugins-dev'
import { afterAll, describe, it } from 'vitest'

import typedUnicornPlugin from './typed-unicorn.mjs'

RuleTester.describe = describe
RuleTester.it = it

const temporaryRoot = fs.mkdtempSync(
  path.join(os.tmpdir(), 'typed-unicorn-fixtures-'),
)

afterAll(() => {
  fs.rmSync(temporaryRoot, { recursive: true, force: true })
})

fs.writeFileSync(
  path.join(temporaryRoot, 'tsconfig.json'),
  JSON.stringify({
    compilerOptions: { strict: true, noEmit: true, skipLibCheck: true },
    include: ['*.ts'],
  }),
)

/**
 * Writes `code` to `name` under the temporary root and returns a RuleTester
 * case for it, so the on-disk source the shim type-checks is the code Oxlint
 * parses.
 * @param name File name under the temporary root.
 * @param code File contents.
 * @returns A RuleTester case with `code` and `filename`.
 */
function typedCase(name: string, code: string) {
  const filename = path.join(temporaryRoot, name)
  fs.writeFileSync(filename, code)
  return { name, code, filename }
}

/**
 * Looks up a wrapped unicorn rule, failing loudly on a typo.
 * @param name Rule id without its `unicorn/` prefix, such as `no-blob-to-file`.
 * @returns The wrapped rule.
 */
function unicornRule(name: string) {
  const rule = typedUnicornPlugin.rules[name]
  if (rule === undefined) {
    throw new Error(`typed-unicorn has no rule ${name}`)
  }
  return rule
}

const typeScriptTester = new RuleTester({
  languageOptions: { sourceType: 'module', parserOptions: { lang: 'ts' } },
})

typeScriptTester.run(
  'unicorn-js/no-non-function-verb-prefix',
  unicornRule('no-non-function-verb-prefix'),
  {
    valid: [
      typedCase(
        'function.ts',
        'declare const value: () => string\nexport const getName = value\n',
      ),
    ],
    invalid: [
      {
        ...typedCase(
          'string.ts',
          'declare const value: string\nexport const getName = value\n',
        ),
        errors: 1,
      },
    ],
  },
)

const javaScriptTester = new RuleTester({
  languageOptions: { sourceType: 'module' },
})

javaScriptTester.run(
  'unicorn-js/prefer-private-class-fields',
  unicornRule('prefer-private-class-fields'),
  {
    valid: [
      {
        name: 'private field',
        code: 'export class Foo {\n  #field = 1\n}\n',
        filename: 'private.js',
      },
    ],
    invalid: [
      {
        name: 'underscore field without a modifier',
        code: 'class Foo {\n  _field = 1\n}\nexport const foo = new Foo()\n',
        filename: 'underscore.js',
        output: 'class Foo {\n  #field = 1\n}\nexport const foo = new Foo()\n',
        errors: 1,
      },
    ],
  },
)

javaScriptTester.run(
  'unicorn-js/no-blob-to-file',
  unicornRule('no-blob-to-file'),
  {
    valid: [
      {
        name: 'let binding',
        code: "let blob = new Blob()\nlet file = new File([blob], 'a.jpg')\nexport const url = URL.createObjectURL(file)\n",
        filename: 'let.js',
      },
    ],
    invalid: [
      {
        name: 'const binding',
        code: "const blob = new Blob()\nconst file = new File([blob], 'a.jpg')\nexport const url = URL.createObjectURL(file)\n",
        filename: 'const.js',
        errors: 1,
      },
    ],
  },
)
