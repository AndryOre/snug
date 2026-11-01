import JSON5 from 'json5'
import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'vitest'

interface PackageRule {
  groupName?: string
  matchDepNames?: string[]
  matchPackageNames?: string[]
  rangeStrategy?: string
  automerge?: boolean
  matchDepTypes?: string[]
}

const config = JSON5.parse<{ packageRules: PackageRule[] }>(
  readFileSync(new URL('../renovate.json5', import.meta.url), 'utf8'),
)

const OXC_PACKAGES = ['oxlint', 'oxlint-tsgolint', 'oxfmt', 'typescript7']

describe('renovate.json5', () => {
  const oxcRule = config.packageRules.find((rule) => rule.groupName === 'oxc')

  test('groups the Oxc toolchain, exact-pinned and without automerge', () => {
    expect(oxcRule?.matchDepNames).toEqual(OXC_PACKAGES)
    expect(oxcRule?.rangeStrategy).toBe('pin')
    expect(oxcRule?.automerge).toBe(false)
  })

  test('declares the oxc rule after the devDependencies automerge rule', () => {
    const automergeIndex = config.packageRules.findIndex(
      (rule) =>
        rule.matchDepTypes?.includes('devDependencies') && rule.automerge,
    )
    expect(automergeIndex).toBeGreaterThanOrEqual(0)
    expect(config.packageRules.indexOf(oxcRule as PackageRule)).toBeGreaterThan(
      automergeIndex,
    )
  })

  test('no longer carries the retired eslint group', () => {
    expect(
      config.packageRules.some((rule) => rule.groupName === 'eslint'),
    ).toBe(false)
  })
})

describe('Oxc toolchain pins', () => {
  const manifest = JSON.parse(
    readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
  ) as {
    devDependencies: Record<string, string>
    workspaces: { catalog: Record<string, string> }
  }

  test.each(['oxlint', 'oxlint-tsgolint', 'oxfmt'])(
    '%s is pinned to an exact version',
    (name) => {
      expect(manifest.devDependencies[name]).toMatch(/^\d+\.\d+\.\d+/)
    },
  )

  test('typescript7 is pinned to an exact version', () => {
    expect(manifest.workspaces.catalog['typescript7']).toMatch(
      /^npm:typescript@\d+\.\d+\.\d+/,
    )
  })
})
