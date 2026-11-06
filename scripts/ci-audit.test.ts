import { describe, expect, it } from 'vitest'

import {
  aggregateJobs,
  formatTable,
  median,
  parseArguments,
  summarizeJob,
  type AuditJob,
} from './ci-audit'

const job: AuditJob = {
  name: 'Quality',
  conclusion: 'success',
  createdAt: '2026-01-01T00:00:00Z',
  startedAt: '2026-01-01T00:00:10Z',
  completedAt: '2026-01-01T00:02:10Z',
  steps: [
    {
      name: 'Set up job',
      startedAt: '2026-01-01T00:00:10Z',
      completedAt: '2026-01-01T00:00:12Z',
    },
    {
      name: 'Run actions/checkout@abc',
      startedAt: '2026-01-01T00:00:12Z',
      completedAt: '2026-01-01T00:00:20Z',
    },
    {
      name: 'Install dependencies',
      startedAt: '2026-01-01T00:00:20Z',
      completedAt: '2026-01-01T00:00:40Z',
    },
    {
      name: 'Check and test workspaces',
      startedAt: '2026-01-01T00:00:40Z',
      completedAt: '2026-01-01T00:02:10Z',
    },
  ],
}

describe('summarizeJob', () => {
  it('splits wait, setup and run seconds', () => {
    expect(summarizeJob(job)).toEqual({
      waitSeconds: 10,
      setupSeconds: 30,
      runSeconds: 90,
    })
  })

  it('counts a job with only setup steps as all setup', () => {
    const onlySetup = { ...job, steps: job.steps?.slice(0, 3) }
    expect(summarizeJob(onlySetup)).toMatchObject({
      setupSeconds: 120,
      runSeconds: 0,
    })
  })
})

describe('median', () => {
  it('handles empty, odd and even lists', () => {
    expect(median([])).toBe(0)
    expect(median([3, 1, 2])).toBe(2)
    expect(median([1, 2, 3, 4])).toBe(2.5)
  })
})

describe('aggregateJobs and formatTable', () => {
  it('ignores skipped jobs and prints one row per job name', () => {
    const rows = aggregateJobs([
      job,
      { ...job, conclusion: 'skipped' },
      { ...job, name: 'Build' },
    ])
    expect(rows.map((row) => row.name)).toEqual(['Build', 'Quality'])
    expect(rows[1]?.samples).toBe(1)
    const table = formatTable(rows)
    expect(table).toContain('wait_s')
    expect(table.split('\n')).toHaveLength(3)
  })
})

describe('parseArguments', () => {
  it('defaults and parses flags, tolerating the bun separator', () => {
    expect(parseArguments([])).toEqual({ runs: 20, workflow: 'ci.yml' })
    expect(
      parseArguments(['--', '--runs', '5', '--workflow', 'x.yml']),
    ).toEqual({ runs: 5, workflow: 'x.yml' })
  })

  it('rejects bad input', () => {
    expect(() => parseArguments(['--runs', '0'])).toThrow()
    expect(() => parseArguments(['--runs'])).toThrow()
    expect(() => parseArguments(['--nope'])).toThrow()
  })
})
