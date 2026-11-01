import { describe, expect, it } from 'vitest'

import {
  evaluateSiteTypecheck,
  isKnownStarlightDiagnostic,
  parseDiagnostics,
} from './typecheck-site'

const searchPath =
  '../../node_modules/.bun/@astrojs+starlight@0.42.6+x/node_modules/@astrojs/starlight/dist/components/Search.astro'

const projectContextError = `${searchPath}(3,21): error TS2307: Cannot find module 'virtual:starlight/project-context' or its corresponding type declarations.`
const pagefindError = `${searchPath}(77,37): error TS2307: Cannot find module 'virtual:starlight/pagefind-config' or its corresponding type declarations.`
const realError =
  "src/components/Hero.astro(4,7): error TS2322: Type 'string' is not assignable to type 'number'."

describe('parseDiagnostics', () => {
  it('attaches indented continuation lines to the previous diagnostic', () => {
    const blocks = parseDiagnostics(
      `${realError}\n  Type detail line\nnoise\n${projectContextError}`,
    )
    expect(blocks).toHaveLength(2)
    expect(blocks[0]?.lines).toEqual([realError, '  Type detail line'])
  })
})

describe('isKnownStarlightDiagnostic', () => {
  it('accepts the two known Search.astro virtual module errors', () => {
    for (const line of [projectContextError, pagefindError]) {
      const [block] = parseDiagnostics(line)
      expect(block && isKnownStarlightDiagnostic(block)).toBe(true)
    }
  })

  it('rejects the same message in another file', () => {
    const [block] = parseDiagnostics(
      projectContextError.replace('Search.astro', 'LanguageSelect.astro'),
    )
    expect(block && isKnownStarlightDiagnostic(block)).toBe(false)
  })

  it('rejects another unresolved module in Search.astro', () => {
    const [block] = parseDiagnostics(
      projectContextError.replace('project-context', 'something-else'),
    )
    expect(block && isKnownStarlightDiagnostic(block)).toBe(false)
  })

  it('rejects another error code in Search.astro', () => {
    const [block] = parseDiagnostics(
      projectContextError.replace('TS2307', 'TS2322'),
    )
    expect(block && isKnownStarlightDiagnostic(block)).toBe(false)
  })

  it('rejects an unresolved module in a site file', () => {
    const [block] = parseDiagnostics(
      "src/pages/index.astro(2,18): error TS2307: Cannot find module 'virtual:starlight/project-context' or its corresponding type declarations.",
    )
    expect(block && isKnownStarlightDiagnostic(block)).toBe(false)
  })
})

describe('evaluateSiteTypecheck', () => {
  it('passes when only the known diagnostics remain', () => {
    const verdict = evaluateSiteTypecheck(
      `${projectContextError}\n${pagefindError}\n`,
      2,
    )
    expect(verdict.exitCode).toBe(0)
    expect(verdict.ignored).toHaveLength(2)
  })

  it('fails on a real error next to the known ones', () => {
    const verdict = evaluateSiteTypecheck(
      `${projectContextError}\n${realError}\n${pagefindError}\n`,
      2,
    )
    expect(verdict.exitCode).toBe(1)
    expect(verdict.remaining.map((block) => block.headline)).toEqual([
      realError,
    ])
  })

  it('fails on a file-less error next to the known ones', () => {
    const globalError =
      "error TS2688: Cannot find type definition file for 'vite/client'."
    const verdict = evaluateSiteTypecheck(
      `${projectContextError}\n${globalError}\n${pagefindError}\n`,
      2,
    )
    expect(verdict.exitCode).toBe(1)
    expect(verdict.remaining.map((block) => block.headline)).toEqual([
      globalError,
    ])
  })

  it('passes on a clean run', () => {
    expect(evaluateSiteTypecheck('', 0).exitCode).toBe(0)
  })

  it('fails on a non-zero exit with no diagnostics', () => {
    expect(evaluateSiteTypecheck('error TS5083: bad config', 1).exitCode).toBe(
      1,
    )
  })
})
