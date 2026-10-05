import { spawnSync } from 'node:child_process'
import { chmodSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const scriptPath = path.join(
  import.meta.dirname,
  '../../scripts/lighthouse-budget.sh',
)

type Scores = Record<string, number | null>

function runBudget(scores: Scores) {
  const directory = mkdtempSync(path.join(tmpdir(), 'lighthouse-budget-'))
  const report = {
    categories: Object.fromEntries(
      Object.entries(scores).map(([name, score]) => [name, { score }]),
    ),
  }
  const fixture = path.join(directory, 'fixture.json')
  writeFileSync(fixture, JSON.stringify(report))
  const stub = path.join(directory, 'bunx')
  writeFileSync(
    stub,
    [
      '#!/usr/bin/env bash',
      'for arg in "$@"; do',
      '  case "$arg" in --output-path=*) cp "$FIXTURE" "${arg#--output-path=}" ;; esac',
      'done',
      '',
    ].join('\n'),
  )
  chmodSync(stub, 0o755)
  return spawnSync('bash', [scriptPath], {
    encoding: 'utf8',
    env: {
      ...process.env,
      PATH: `${directory}:${process.env.PATH}`,
      FIXTURE: fixture,
    },
  })
}

const passing: Scores = {
  performance: 1,
  accessibility: 1,
  'best-practices': 1,
  seo: 1,
}

describe('lighthouse-budget.sh', () => {
  it('passes when every category meets its budget', () => {
    expect(runBudget(passing).status).toBe(0)
  })

  it('fails when a category is below its budget', () => {
    const result = runBudget({ ...passing, seo: 0.5 })
    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('FAIL')
  })

  it('fails with a readable message when a category score is null', () => {
    const result = runBudget({ ...passing, performance: null })
    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('performance')
    expect(result.stderr).toMatch(/null/i)
    expect(result.stderr).not.toMatch(/jq:|integer expression/)
  })
})
