import { execFileSync } from 'node:child_process'

export type AuditStep = {
  name: string
  startedAt: string
  completedAt: string
}

export type AuditJob = {
  name: string
  conclusion?: string
  createdAt?: string
  startedAt: string
  completedAt: string
  steps?: AuditStep[]
}

export type JobSummary = {
  waitSeconds: number
  setupSeconds: number
  runSeconds: number
}

export type JobRow = JobSummary & { name: string; samples: number }

const SETUP_STEP_PATTERN =
  /^(Set up job|Run [^\s]+@[^\s]+|Install |Setup |Set up |Restore |Cache |Download )/i

function secondsBetween(from: string, to: string): number {
  const difference = (Date.parse(to) - Date.parse(from)) / 1000
  return Number.isFinite(difference) ? Math.max(0, difference) : 0
}

/**
 * Splits one job into queue wait, setup and main-run seconds.
 * @param job - A job from `gh run view --json jobs`.
 * @returns Wait (created to started), setup (leading checkout/install/cache
 * steps) and run (everything after the setup steps) in seconds.
 */
export function summarizeJob(job: AuditJob): JobSummary {
  const waitSeconds = job.createdAt
    ? secondsBetween(job.createdAt, job.startedAt)
    : 0
  const totalSeconds = secondsBetween(job.startedAt, job.completedAt)
  const steps = job.steps ?? []
  const firstMain = steps.find((step) => !SETUP_STEP_PATTERN.test(step.name))
  const setupSeconds = firstMain
    ? secondsBetween(job.startedAt, firstMain.startedAt)
    : totalSeconds
  return {
    waitSeconds,
    setupSeconds,
    runSeconds: Math.max(0, totalSeconds - setupSeconds),
  }
}

/**
 * Computes the median of a list of numbers.
 * @param values - Samples; may be empty.
 * @returns The median, or 0 for an empty list.
 */
export function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = values.toSorted((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  const upper = sorted[middle] ?? 0
  const lower = sorted[middle - 1] ?? upper
  return sorted.length % 2 === 0 ? (lower + upper) / 2 : upper
}

/**
 * Aggregates jobs from many runs into per-job-name median rows.
 * @param jobs - Jobs from all audited runs; skipped or unfinished jobs are ignored.
 * @returns Rows sorted by job name.
 */
export function aggregateJobs(jobs: AuditJob[]): JobRow[] {
  const byName = new Map<string, JobSummary[]>()
  for (const job of jobs) {
    if (
      job.conclusion === 'skipped' ||
      !(Date.parse(job.startedAt) > 0) ||
      !(Date.parse(job.completedAt) > 0)
    ) {
      continue
    }
    const samples = byName.get(job.name) ?? []
    samples.push(summarizeJob(job))
    byName.set(job.name, samples)
  }
  return byName
    .entries()
    .map(([name, samples]) => ({
      name,
      samples: samples.length,
      waitSeconds: median(samples.map((sample) => sample.waitSeconds)),
      setupSeconds: median(samples.map((sample) => sample.setupSeconds)),
      runSeconds: median(samples.map((sample) => sample.runSeconds)),
    }))
    .toArray()
    .toSorted((a, b) => a.name.localeCompare(b.name))
}

/**
 * Renders rows as a fixed-width text table.
 * @param rows - Output of `aggregateJobs`.
 * @returns The table, one line per job plus a header.
 */
export function formatTable(rows: JobRow[]): string {
  const header = ['job', 'n', 'wait_s', 'setup_s', 'run_s']
  const body = rows.map((row) => [
    row.name,
    String(row.samples),
    row.waitSeconds.toFixed(0),
    row.setupSeconds.toFixed(0),
    row.runSeconds.toFixed(0),
  ])
  const widths = header.map((title, column) =>
    Math.max(title.length, ...body.map((line) => line[column]?.length ?? 0)),
  )
  const render = (cells: string[]) =>
    cells.map((cell, column) => cell.padEnd(widths[column] ?? 0)).join('  ')
  return [render(header), ...body.map((cells) => render(cells))].join('\n')
}

export type AuditOptions = { runs: number; workflow: string }

/**
 * Parses `--runs N` and `--workflow file` from argv.
 * @param argv - Arguments after the script name.
 * @returns Options with defaults of 20 runs of `ci.yml`.
 */
export function parseArguments(argv: string[]): AuditOptions {
  const options: AuditOptions = { runs: 20, workflow: 'ci.yml' }
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index]
    const value = argv[index + 1]
    if (flag === '--runs' || flag === '--workflow') {
      if (value === undefined) throw new Error(`Missing value for ${flag}`)
      if (flag === '--workflow') options.workflow = value
      else {
        const runs = Number(value)
        if (!Number.isSafeInteger(runs) || runs < 1) {
          throw new Error(`--runs must be a positive integer, got ${value}`)
        }
        options.runs = runs
      }
      index += 1
    } else if (flag !== '--') {
      throw new Error(`Unknown argument: ${flag}`)
    }
  }
  return options
}

function runGh(ghArguments: string[]): string {
  return execFileSync('gh', ghArguments, {
    encoding: 'utf8',
    maxBuffer: 64 << 20,
  })
}

function main(): void {
  const { runs, workflow } = parseArguments(process.argv.slice(2))
  const listed = JSON.parse(
    runGh([
      'run',
      'list',
      '--workflow',
      workflow,
      '--limit',
      String(runs),
      '--json',
      'databaseId',
    ]),
  ) as { databaseId: number }[]
  const jobs = listed.flatMap(({ databaseId }) => {
    const view = JSON.parse(
      runGh(['run', 'view', String(databaseId), '--json', 'jobs']),
    ) as { jobs: AuditJob[] }
    return view.jobs
  })
  console.log(`${workflow}: ${listed.length} runs`)
  console.log(formatTable(aggregateJobs(jobs)))
}

if (import.meta.main) main()
