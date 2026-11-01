import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { RuleTester } from 'oxlint/plugins-dev'
import { afterAll, describe, it } from 'vitest'

import typedTypescriptEslintPlugin from './typed-typescript-eslint.mjs'

RuleTester.describe = describe
RuleTester.it = it

const temporaryRoot = fs.mkdtempSync(
  path.join(os.tmpdir(), 'typed-typescript-eslint-fixtures-'),
)

afterAll(() => {
  fs.rmSync(temporaryRoot, { recursive: true, force: true })
})

fs.writeFileSync(
  path.join(temporaryRoot, 'tsconfig.json'),
  JSON.stringify({
    compilerOptions: {
      jsx: 'preserve',
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      types: [],
    },
    include: ['*.tsx'],
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

const JSX_PRELUDE = [
  'declare global {',
  '  namespace JSX {',
  "    interface Element { readonly kind: 'element' }",
  '    interface IntrinsicElements { [name: string]: unknown }',
  '  }',
  '}',
  'declare function Foo(props: { a: any; b: string }): null',
  'declare const loose: any',
  '',
].join('\n')

const ruleTester = new RuleTester({
  languageOptions: { sourceType: 'module', parserOptions: { lang: 'tsx' } },
})

ruleTester.run(
  'typescript-eslint-js/no-unsafe-assignment',
  typedTypescriptEslintPlugin.rules['no-unsafe-assignment'],
  {
    valid: [
      typedCase(
        'typed-prop.tsx',
        `${JSX_PRELUDE}export const element = <Foo a={1} b="x" />\n`,
      ),
      typedCase(
        'method.tsx',
        'export const object = {\n  method(): number {\n    return 1\n  },\n}\n',
      ),
    ],
    invalid: [
      {
        ...typedCase(
          'any-prop.tsx',
          [
            JSX_PRELUDE,
            'export const element = <Foo a={loose} b="x" />',
            '',
          ].join('\n'),
        ),
        errors: 1,
      },
      {
        ...typedCase(
          'annotated.tsx',
          'declare const loose: any\nexport const value: number = loose\n',
        ),
        errors: 1,
      },
    ],
  },
)
