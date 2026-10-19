import { describe, expect, test } from 'vitest'
import { parse } from 'yaml'

import {
  listWorkflowFiles,
  readWorkflow,
  readWorkflowText,
  type Workflow,
  type WorkflowStep,
} from './workflow-files'

const FULL_SHA_PATTERN = /^[\da-f]{40}$/
const VERSION_COMMENT_PATTERN = /#\s*v\d+\.\d+\.\d+\s*$/
const USES_LINE_PATTERN = /^\s*(?:-\s+)?uses:\s*(\S+)(.*)$/

/**
 * Workflows still waiting for the hygiene fixes tracked in AO-2169. Remove a
 * file from this list when its violations are fixed; the follow-up ticket
 * empties it.
 */
const EXEMPT_UNTIL_AO_2169: ReadonlySet<string> = new Set([
  'codeql.yml',
  'deploy-site.yml',
  'labels.yml',
  'lint-docs.yml',
  'lint-pr.yml',
  'lint-workflows.yml',
  'scorecard.yml',
  'site-quality.yml',
])

function collectSteps(workflow: Workflow): WorkflowStep[] {
  return Object.values(workflow.jobs ?? {}).flatMap((job) => job.steps ?? [])
}

function triggerNames(workflow: Workflow): string[] {
  const trigger = workflow.on
  if (typeof trigger === 'string') return [trigger]
  if (Array.isArray(trigger)) return trigger.map(String)
  return trigger !== null && typeof trigger === 'object'
    ? Object.keys(trigger)
    : []
}

function needsList(needs: unknown): string[] {
  if (typeof needs === 'string') return [needs]
  return Array.isArray(needs) ? needs.map(String) : []
}

function usesReferences(source: string): { target: string; rest: string }[] {
  return source.split('\n').flatMap((line) => {
    const match = USES_LINE_PATTERN.exec(line)
    return match ? [{ target: match[1] ?? '', rest: match[2] ?? '' }] : []
  })
}

function hasAffectedFlag(step: WorkflowStep): boolean {
  const environmentValues = Object.values(step.env ?? {}).map(String)
  return [step.run ?? '', ...environmentValues].some((text) =>
    text.includes('--affected'),
  )
}

/**
 * Applies every repository-wide workflow hygiene rule to one workflow.
 * @param workflow The parsed workflow document.
 * @param source The raw workflow text, needed for `uses:` version comments.
 * @returns One message per violation; empty when the workflow is clean.
 */
function findViolations(workflow: Workflow, source: string): string[] {
  const violations: string[] = []
  const jobs = Object.entries(workflow.jobs ?? {})

  if (triggerNames(workflow).includes('pull_request_target')) {
    violations.push('uses the pull_request_target trigger')
  }

  const topLevel = JSON.stringify(workflow.permissions)
  if (topLevel !== '{"contents":"read"}' && topLevel !== '{}') {
    violations.push('top-level permissions are not contents: read or empty')
  }

  for (const [jobName, job] of jobs) {
    const timeout = job['timeout-minutes']
    const isReusableCall = job.uses !== undefined
    if (
      !isReusableCall &&
      typeof timeout !== 'number' &&
      typeof timeout !== 'string'
    ) {
      violations.push(`job "${jobName}" has no timeout-minutes`)
    }
    if (job.permissions === undefined) {
      violations.push(`job "${jobName}" does not declare permissions`)
    }
  }

  for (const step of collectSteps(workflow)) {
    if (
      step.uses?.startsWith('actions/checkout@') &&
      step.with?.['persist-credentials'] !== false
    ) {
      violations.push('actions/checkout without persist-credentials: false')
    }
    if (step.run?.includes('${{')) {
      violations.push(`run interpolates an expression: ${step.run.trim()}`)
    }
    if (hasAffectedFlag(step) && !step.env?.TURBO_SCM_BASE) {
      violations.push('--affected without TURBO_SCM_BASE in the step env')
    }
  }

  for (const { target, rest } of usesReferences(source)) {
    if (target.startsWith('./')) continue
    const reference = target.split('@', 2)[1] ?? ''
    if (!FULL_SHA_PATTERN.test(reference)) {
      violations.push(`${target} is not pinned to a 40-hex SHA`)
    } else if (!VERSION_COMMENT_PATTERN.test(rest)) {
      violations.push(`${target} has no # vX.Y.Z version comment`)
    }
  }

  return violations
}

const allFiles = listWorkflowFiles()
const checkedFiles = allFiles.filter(
  (fileName) => !EXEMPT_UNTIL_AO_2169.has(fileName),
)

test('there is at least one workflow to check', () => {
  expect(checkedFiles.length).toBeGreaterThan(0)
})

test('every exemption names a workflow that still exists', () => {
  for (const fileName of EXEMPT_UNTIL_AO_2169) {
    expect(allFiles).toContain(fileName)
  }
})

describe.each(checkedFiles)('%s', (fileName) => {
  test('satisfies the workflow hygiene rules', () => {
    const violations = findViolations(
      readWorkflow(fileName),
      readWorkflowText(fileName),
    )
    expect(violations).toEqual([])
  })
})

describe('the hygiene rules reject a broken workflow', () => {
  const broken = `
on:
  pull_request_target:
permissions: write-all
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/cache@55cc8345863c7cc4c66a329aec7e433d2d1c52a9
      - run: echo \${{ github.head_ref }}
      - run: bunx turbo run check --affected
`
  const violations = findViolations(parse(broken) as Workflow, broken)

  test.each([
    'uses the pull_request_target trigger',
    'top-level permissions are not contents: read or empty',
    'job "build" has no timeout-minutes',
    'job "build" does not declare permissions',
    'actions/checkout without persist-credentials: false',
    'actions/checkout@v4 is not pinned to a 40-hex SHA',
    'actions/cache@55cc8345863c7cc4c66a329aec7e433d2d1c52a9 has no # vX.Y.Z version comment',
    'run interpolates an expression: echo ${{ github.head_ref }}',
    '--affected without TURBO_SCM_BASE in the step env',
  ])('reports: %s', (message) => {
    expect(violations).toContain(message)
  })
})

describe('ci.yml', () => {
  const workflow = readWorkflow('ci.yml')

  test('keeps the aggregate job name', () => {
    expect(workflow.jobs?.['ci-passed']).toMatchObject({ name: 'CI passed' })
  })

  test('keeps BrowserStack out of the ci-passed needs on purpose', () => {
    const needs = workflow.jobs?.['ci-passed']?.needs
    expect(needs).toEqual(
      expect.arrayContaining(['quality', 'build', 'e2e', 'commitlint']),
    )
    expect(needs).not.toContain('browserstack')
  })

  test('keys the eslint cache on the local eslint rules too', () => {
    const cacheStep = collectSteps(workflow).find((step) =>
      String(step.with?.path).includes('.eslintcache'),
    )
    expect(String(cacheStep?.with?.key)).toContain('eslint-rules/**')
  })

  test('every checkout that feeds turbo fetches full history', () => {
    const jobs = Object.values(workflow.jobs ?? {})
    for (const job of jobs) {
      if (!job.steps?.some((step) => step.run?.includes('turbo run'))) continue
      const checkout = job.steps.find((step) =>
        step.uses?.startsWith('actions/checkout@'),
      )
      expect(checkout?.with?.['fetch-depth']).toBe(0)
    }
  })

  test('affected runs resolve the pull request base ref', () => {
    const affectedSteps = collectSteps(workflow).filter((step) =>
      hasAffectedFlag(step),
    )
    expect(affectedSteps.length).toBeGreaterThan(0)
    for (const step of affectedSteps) {
      expect(step.env?.TURBO_SCM_BASE).toBe('origin/${{ github.base_ref }}')
    }
  })
})

describe('codeql.yml', () => {
  test('exists as a workflow (ADR 0004)', () => {
    expect(allFiles).toContain('codeql.yml')
  })
})

describe('release.yml (ADR 0026)', () => {
  const workflow = readWorkflow('release.yml')
  const jobs = Object.entries(workflow.jobs ?? {})
  const verifyRuns = (workflow.jobs?.verify?.steps ?? [])
    .map((step) => step.run ?? '')
    .join('\n')

  test('has a read-only verify job', () => {
    expect(workflow.jobs?.verify).toBeDefined()
    expect(workflow.jobs?.verify?.permissions).toEqual({
      contents: 'read',
      checks: 'read',
    })
  })

  test('verify checks main ancestry, CI passed, check, test and build', () => {
    expect(verifyRuns).toContain('merge-base --is-ancestor')
    expect(verifyRuns).toContain('CI passed')
    expect(verifyRuns).toContain('bun run check')
    expect(verifyRuns).toContain('bun run test')
    expect(verifyRuns).toContain('bun run build')
  })

  test('every job except verify needs verify', () => {
    const others = jobs.filter(([name]) => name !== 'verify')
    expect(others.length).toBeGreaterThan(0)
    for (const [, job] of others) {
      expect(needsList(job.needs)).toContain('verify')
    }
  })

  test('publish jobs skip a version already released', () => {
    const publishJobs = jobs.filter(([name]) => name.startsWith('publish-'))
    expect(publishJobs.length).toBeGreaterThan(0)
    for (const [, job] of publishJobs) {
      expect(job.if).toContain('already-released')
    }
  })
})

describe('upload-artifact pins', () => {
  test('ci, release and browserstack share one version', () => {
    const pins = new Set(
      ['ci.yml', 'release.yml', 'browserstack.yml'].flatMap((fileName) =>
        usesReferences(readWorkflowText(fileName))
          .filter(({ target }) => target.startsWith('actions/upload-artifact@'))
          .map(({ target, rest }) => `${target}${rest}`),
      ),
    )
    expect(pins.size).toBe(1)
  })
})
