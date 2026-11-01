import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { RuleTester } from 'oxlint/plugins-dev'
import { afterAll, describe, expect, it, vi } from 'vitest'

import typedReactPlugin from './typed-react.mjs'

RuleTester.describe = describe
RuleTester.it = it

const rule = typedReactPlugin.rules['no-leaked-conditional-rendering']

const COMPILER_OPTIONS = {
  jsx: 'react-jsx',
  strict: true,
  noEmit: true,
  skipLibCheck: true,
  types: [],
}

const temporaryRoot = fs.mkdtempSync(
  path.join(os.tmpdir(), 'typed-react-fixtures-'),
)

afterAll(() => {
  fs.rmSync(temporaryRoot, { recursive: true, force: true })
})

/**
 * Writes `contents` to `relativePath` under the temporary fixture root.
 * @param relativePath Path relative to the fixture root.
 * @param contents File contents.
 * @returns The absolute path written.
 */
function writeFixture(relativePath: string, contents: string): string {
  const absolutePath = path.join(temporaryRoot, relativePath)
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true })
  fs.writeFileSync(absolutePath, contents)
  return absolutePath
}

/**
 * Writes a component whose body renders `expression` inside a `<div>` and
 * returns a RuleTester case for it, so the on-disk source (which the shim
 * type-checks) is byte-identical to the `code` Oxlint parses.
 * @param directory Directory under the fixture root.
 * @param name Test case name, also the file name.
 * @param expression The JSX expression to render.
 * @returns A RuleTester case with `code` and `filename`.
 */
function renderCase(directory: string, name: string, expression: string) {
  const code = [
    'declare const count: number',
    'declare const items: string[]',
    'declare const label: string',
    'declare const ok: boolean',
    `export const view = <div>{${expression}}</div>`,
    '',
  ].join('\n')
  const filename = writeFixture(
    path.join(directory, `${name.replaceAll(/\W+/g, '-')}.tsx`),
    code,
  )
  return { name, code, filename }
}

writeFixture(
  'plain/tsconfig.json',
  JSON.stringify({ compilerOptions: COMPILER_OPTIONS, include: ['*.tsx'] }),
)
writeFixture(
  'solution/tsconfig.json',
  JSON.stringify({ files: [], references: [{ path: './tsconfig.app.json' }] }),
)
writeFixture(
  'solution/tsconfig.app.json',
  JSON.stringify({
    compilerOptions: { ...COMPILER_OPTIONS, composite: true },
    include: ['src'],
  }),
)

const ruleTester = new RuleTester({
  languageOptions: { sourceType: 'module', parserOptions: { lang: 'tsx' } },
})

ruleTester.run('typed-react/no-leaked-conditional-rendering', rule, {
  valid: [
    renderCase('plain', 'boolean guard', 'ok && <span />'),
    renderCase('plain', 'comparison guard', 'count > 0 && <span />'),
    renderCase('plain', 'string guard', 'label && <span />'),
    renderCase('plain', 'coerced guard', '!!count && <span />'),
    renderCase('solution/src', 'solution boolean guard', 'ok && <span />'),
  ],
  invalid: [
    {
      ...renderCase('plain', 'number guard', 'count && <span />'),
      errors: [{ messageId: 'default' }],
    },
    {
      ...renderCase('plain', 'length guard', 'items.length && <span />'),
      errors: [{ messageId: 'default' }],
    },
    {
      ...renderCase('plain', 'NaN guard', 'Number.NaN && <span />'),
      errors: [{ messageId: 'default' }],
    },
    {
      ...renderCase(
        'solution/src',
        'solution number guard',
        'count && <span />',
      ),
      errors: [{ messageId: 'default' }],
    },
  ],
})

/**
 * Builds the smallest context the shim reads before it creates the rule.
 * @param filename Absolute path of the file being linted.
 * @returns A context stand-in.
 */
function contextFor(filename: string) {
  return {
    filename,
    physicalFilename: filename,
    options: [],
    sourceCode: {},
    report: vi.fn(),
  }
}

describe('typed-react program resolution', () => {
  it('fails loudly when no tsconfig covers the file', () => {
    const filename = writeFixture('plain/uncovered/orphan.tsx', 'export {}\n')
    expect(() => rule.create?.(contextFor(filename) as never)).toThrow(
      /not part of the TypeScript program/,
    )
  })

  it('fails loudly when there is no tsconfig above the file', () => {
    const bareRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'typed-react-bare-'))
    const filename = path.join(bareRoot, 'bare.tsx')
    fs.writeFileSync(filename, 'export {}\n')
    expect(() => rule.create?.(contextFor(filename) as never)).toThrow(
      /no tsconfig\.json found/,
    )
    fs.rmSync(bareRoot, { recursive: true, force: true })
  })
})
