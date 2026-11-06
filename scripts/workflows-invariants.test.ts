import { readFileSync } from 'node:fs'
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

interface ShardedJob {
  readonly name?: string
  readonly 'runs-on'?: string
  readonly strategy?: {
    readonly 'fail-fast'?: boolean
    readonly matrix?: { readonly shard?: readonly number[] }
  }
  readonly steps?: readonly WorkflowStep[]
}

/**
 * The `runs-on` expression of every light job (ADR 0031): GitHub-hosted for
 * fork PRs, otherwise the optional `BLACKSMITH_RUNNER` repository variable,
 * falling back to `ubuntu-latest` when it is unset.
 */
const ROUTED_RUNS_ON =
  "${{ github.event.pull_request.head.repo.fork && 'ubuntu-latest' || vars.BLACKSMITH_RUNNER || 'ubuntu-latest' }}"

/**
 * The only jobs, as `<file>:<job>`, allowed to use {@link ROUTED_RUNS_ON}.
 */
const ROUTED_JOBS: readonly string[] = [
  'ci.yml:quality',
  'ci.yml:changes',
  'ci.yml:commitlint',
  'ci.yml:ci-passed',
  'lint-pr.yml:validate-title',
  'lint-docs.yml:check-links',
  'lint-workflows.yml:lint',
  'labels.yml:sync',
]

const FORBIDDEN_RUNNER_LABEL_PATTERN = /^vps-|^self-hosted$/

/**
 * The artifact the `build-site` job uploads and every E2E shard downloads.
 */
const SITE_DIST_ARTIFACT = 'site-dist'

interface SiteBuildJob {
  readonly needs?: unknown
  readonly outputs?: Record<string, string>
}

/**
 * Tells whether one line of a `run` script runs `astro build`, directly or
 * through the site's `build` or `test:e2e` scripts.
 * @param line One line of a step's `run` script.
 * @returns True when the line builds the site.
 */
function isSiteBuildLine(line: string): boolean {
  return (
    /\bastro build\b/.test(line) ||
    /--filter=@snug\/site\b/.test(line) ||
    (/\bturbo run (?:\S+ )*test:e2e(?:\s|$)/.test(line) &&
      !line.includes("--filter='!@snug/site'"))
  )
}

interface RunnerJob {
  readonly 'runs-on'?: unknown
  readonly uses?: string
}

function runnerLabels(runsOn: unknown): string[] {
  if (typeof runsOn === 'string') return [runsOn]
  if (Array.isArray(runsOn)) {
    return runsOn.flatMap((entry: unknown) => runnerLabels(entry))
  }
  if (runsOn !== null && typeof runsOn === 'object') {
    return Object.values(runsOn).flatMap((entry: unknown) =>
      runnerLabels(entry),
    )
  }
  return []
}

/**
 * Applies the runner routing rules of ADR 0031 to one workflow.
 * @param fileName The workflow file name, used to build `<file>:<job>` keys.
 * @param source The raw workflow text.
 * @param routedJobs The `<file>:<job>` keys allowed to use the routed runner.
 * @returns One message per violation; empty when the workflow is clean.
 */
function findRunnerViolations(
  fileName: string,
  source: string,
  routedJobs: readonly string[] = ROUTED_JOBS,
): string[] {
  const { jobs } = parse(source) as { jobs?: Record<string, RunnerJob> }
  const violations: string[] = []
  const jobEntries = Object.entries(jobs ?? {})
  for (const [jobName, job] of jobEntries) {
    const key = `${fileName}:${jobName}`
    const runsOn = job['runs-on']
    for (const label of runnerLabels(runsOn)) {
      if (FORBIDDEN_RUNNER_LABEL_PATTERN.test(label)) {
        violations.push(`${key} uses the forbidden runner label ${label}`)
      }
    }
    if (routedJobs.includes(key)) {
      if (runsOn !== ROUTED_RUNS_ON) {
        violations.push(`${key} does not use the routed runs-on expression`)
      }
      continue
    }
    if (JSON.stringify(job).includes('vars.BLACKSMITH_RUNNER')) {
      violations.push(`${key} reads vars.BLACKSMITH_RUNNER outside the list`)
    }
    if (runsOn !== 'ubuntu-latest' && job.uses === undefined) {
      violations.push(`${key} does not use a literal ubuntu-latest`)
    }
  }
  return violations
}

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
    return match ? { target: match[1] ?? '', rest: match[2] ?? '' } : []
  })
}

function isCacheStep(step: WorkflowStep): boolean {
  return /^actions\/cache(?:\/restore|\/save)?@/.test(step.uses ?? '')
}

function cachedPaths(step: WorkflowStep): string[] {
  const path = step.with?.path
  const lines = typeof path === 'string' ? path.split('\n') : []
  return lines.map((line) => line.trim()).filter((line) => line !== '')
}

function isNodeModulesCache(step: WorkflowStep): boolean {
  return (
    isCacheStep(step) &&
    cachedPaths(step).some((entry) => entry.endsWith('node_modules'))
  )
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
    if (
      step.uses?.startsWith('actions/checkout@') &&
      step.with?.['fetch-depth'] === 0 &&
      step.with['filter'] !== 'blob:none'
    ) {
      violations.push('full-history actions/checkout without filter: blob:none')
    }
    if (
      isCacheStep(step) &&
      !FULL_SHA_PATTERN.test(step.uses?.split('@', 2)[1] ?? '')
    ) {
      violations.push(`cache step ${step.uses} is not SHA-pinned`)
    }
    if (isNodeModulesCache(step) && step.with?.['restore-keys'] !== undefined) {
      violations.push('node_modules cache falls back through restore-keys')
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

test('there is at least one workflow to check', () => {
  expect(allFiles.length).toBeGreaterThan(0)
})

describe.each(allFiles)('%s', (fileName) => {
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
        with:
          fetch-depth: 0
      - uses: actions/cache@55cc8345863c7cc4c66a329aec7e433d2d1c52a9
      - uses: actions/cache/restore@v6
        with:
          path: node_modules
          key: modules
          restore-keys: modules-
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
    'full-history actions/checkout without filter: blob:none',
    'cache step actions/cache/restore@v6 is not SHA-pinned',
    'node_modules cache falls back through restore-keys',
    'actions/checkout@v4 is not pinned to a 40-hex SHA',
    'actions/cache@55cc8345863c7cc4c66a329aec7e433d2d1c52a9 has no # vX.Y.Z version comment',
    'run interpolates an expression: echo ${{ github.head_ref }}',
    '--affected without TURBO_SCM_BASE in the step env',
  ])('reports: %s', (message) => {
    expect(violations).toContain(message)
  })
})

describe('runner routing (ADR 0031)', () => {
  test.each(allFiles)('%s follows the runner routing rules', (fileName) => {
    expect(findRunnerViolations(fileName, readWorkflowText(fileName))).toEqual(
      [],
    )
  })

  test('every routed job exists', () => {
    const existing = new Set(
      allFiles.flatMap((fileName) =>
        Object.keys(readWorkflow(fileName).jobs ?? {}).map(
          (jobName) => `${fileName}:${jobName}`,
        ),
      ),
    )
    for (const key of ROUTED_JOBS) {
      expect(existing).toContain(key)
    }
  })

  describe('the rules reject a broken workflow', () => {
    const broken = `
jobs:
  light:
    runs-on: ubuntu-latest
  heavy:
    runs-on: \${{ vars.BLACKSMITH_RUNNER || 'ubuntu-latest' }}
  vps:
    runs-on: vps-dind
  hosted:
    runs-on: [self-hosted, linux]
  sneaky:
    runs-on: ubuntu-latest
    env:
      RUNNER: \${{ vars.BLACKSMITH_RUNNER }}
`
    const violations = findRunnerViolations('broken.yml', broken, [
      'broken.yml:light',
    ])

    test.each([
      'broken.yml:light does not use the routed runs-on expression',
      'broken.yml:heavy reads vars.BLACKSMITH_RUNNER outside the list',
      'broken.yml:heavy does not use a literal ubuntu-latest',
      'broken.yml:vps uses the forbidden runner label vps-dind',
      'broken.yml:vps does not use a literal ubuntu-latest',
      'broken.yml:hosted uses the forbidden runner label self-hosted',
      'broken.yml:sneaky reads vars.BLACKSMITH_RUNNER outside the list',
    ])('reports: %s', (message) => {
      expect(violations).toContain(message)
    })
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
      expect.arrayContaining([
        'quality',
        'build',
        'build-site',
        'e2e',
        'commitlint',
      ]),
    )
    expect(needs).not.toContain('browserstack')
  })

  test('keys the eslint cache on the local eslint rules too', () => {
    const cacheStep = collectSteps(workflow).find((step) =>
      String(step.with?.path).includes('.eslintcache'),
    )
    expect(String(cacheStep?.with?.key)).toContain('eslint-rules/**')
  })

  test('runs both linters through the quality job', () => {
    const quality = workflow.jobs?.['quality']
    expect(
      quality?.steps?.some((step) => step.run?.includes('check:root')),
    ).toBe(true)
    const rootScripts = JSON.parse(
      readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
    ) as { scripts: Record<string, string> }
    for (const script of ['lint', 'lint:fix']) {
      const command = rootScripts.scripts[script] ?? ''
      expect(command).toContain('oxlint')
      expect(command).toContain('eslint')
    }
    for (const script of ['lint:eslint', 'lint:fix']) {
      const eslintInvocations = (rootScripts.scripts[script] ?? '')
        .split('&&')
        .filter((part) => /\beslint\b/.test(part))
      expect(eslintInvocations.length).toBeGreaterThan(0)
      for (const invocation of eslintInvocations) {
        expect(invocation).toContain('"**/*.astro"')
      }
    }
    const oxlintShards = Object.keys(rootScripts.scripts).filter((script) =>
      script.startsWith('lint:oxlint:'),
    )
    expect(oxlintShards.length).toBeGreaterThan(0)
    for (const shard of oxlintShards) {
      expect(rootScripts.scripts[shard]).toMatch(
        /^oxlint --type-aware --deny-warnings(?: |$)/,
      )
      expect((rootScripts.scripts['lint:oxlint'] ?? '').split(/\s+/)).toContain(
        shard,
      )
    }
    expect(rootScripts.scripts['lint']).toContain('bun run lint:oxlint')
    expect(rootScripts.scripts['check:root']).toContain('bun run lint')
  })

  test('lint-staged runs eslint only on staged astro files', async () => {
    const lintStagedUrl = new URL('../lint-staged.config.mjs', import.meta.url)
    const { default: lintStaged } = (await import(lintStagedUrl.href)) as {
      default: Record<string, string[]>
    }
    for (const [glob, commands] of Object.entries(lintStaged)) {
      const isEslintCommand = commands.some((command) =>
        /\beslint\b/.test(command),
      )
      expect(isEslintCommand).toBe(glob === '*.astro')
    }
  })

  test('every checkout that feeds turbo fetches full history', () => {
    const jobs = Object.values(workflow.jobs ?? {})
    for (const job of jobs) {
      if (!job.steps?.some((step) => step.run?.includes('turbo run'))) continue
      const checkout = job.steps.find((step) =>
        step.uses?.startsWith('actions/checkout@'),
      )
      expect(checkout?.with?.['fetch-depth']).toBe(0)
      expect(checkout?.with?.['filter']).toBe('blob:none')
    }
  })

  test('commitlint and change detection keep a blobless full history', () => {
    for (const jobName of ['commitlint', 'changes']) {
      const checkout = workflow.jobs?.[jobName]?.steps?.find((step) =>
        step.uses?.startsWith('actions/checkout@'),
      )
      expect(checkout?.with).toMatchObject({
        'fetch-depth': 0,
        filter: 'blob:none',
      })
    }
  })

  describe.each(['quality', 'build', 'build-site', 'e2e'])(
    '%s restores node_modules on an exact bun.lock hit',
    (jobName) => {
      const steps = workflow.jobs?.[jobName]?.steps ?? []
      const cache = steps.find((step) => isNodeModulesCache(step))
      const skipped = `steps.${cache?.id ?? '?'}.outputs.cache-hit != 'true'`
      const hit = `steps.${cache?.id ?? '?'}.outputs.cache-hit == 'true'`

      test('caches root and workspace node_modules on the lockfile hash', () => {
        expect(cache?.id).toBe('node-modules')
        expect(cache?.with?.key).toBe(
          "${{ runner.os }}-node-modules-${{ hashFiles('bun.lock') }}",
        )
        expect(cache?.with?.['restore-keys']).toBeUndefined()
        expect(cachedPaths(cache ?? {})).toEqual([
          'node_modules',
          'apps/*/node_modules',
          'packages/*/node_modules',
        ])
      })

      test('skips the bun cache and bun install on a hit', () => {
        const install = steps.find((step) =>
          step.run?.startsWith('bun install'),
        )
        const bunCache = steps.find(
          (step) =>
            isCacheStep(step) &&
            String(step.with?.path).includes('.bun/install/cache'),
        )
        expect(install?.if).toBe(skipped)
        expect(bunCache?.if).toBe(skipped)
        expect(steps.indexOf(cache ?? {})).toBeLessThan(
          steps.indexOf(bunCache ?? {}),
        )
      })

      test.runIf(jobName !== 'build-site')(
        'reruns the extension postinstall on a hit',
        () => {
          const prepare = steps.find((step) => step.if === hit)
          expect(prepare?.run).toBe('bun run --cwd apps/extension postinstall')
        },
      )
    },
  )

  describe('build-site builds the site once per run', () => {
    const { jobs } = parse(readWorkflowText('ci.yml')) as {
      jobs?: Record<string, ShardedJob & SiteBuildJob>
    }
    const buildSite = jobs?.['build-site']
    const buildSiteSteps = buildSite?.steps ?? []
    const buildStep = buildSiteSteps.find((step) =>
      step.run?.includes('turbo run build'),
    )
    const e2eSteps = jobs?.e2e?.steps ?? []
    const download = e2eSteps.find((step) =>
      step.uses?.startsWith('actions/download-artifact@'),
    )
    const e2eRun = e2eSteps.find((step) => step.run?.includes('turbo run'))

    test('runs on a literal ubuntu-latest', () => {
      expect(buildSite?.['runs-on']).toBe('ubuntu-latest')
      expect(ROUTED_JOBS).not.toContain('ci.yml:build-site')
    })

    test('builds only the site, scoped to affected workspaces', () => {
      expect(buildStep?.id).toBe('site-build')
      expect(buildStep?.run).toMatch(
        /bunx turbo run build --filter=@snug\/site "\$\{affected_flags\[@\]\}"/,
      )
      expect(hasAffectedFlag(buildStep ?? {})).toBe(true)
      expect(buildStep?.run).toContain('apps/site/dist/index.html')
      expect(buildSite?.outputs?.built).toBe(
        '${{ steps.site-build.outputs.built }}',
      )
    })

    test(`uploads apps/site/dist as ${SITE_DIST_ARTIFACT} only when built`, () => {
      const upload = buildSiteSteps.find((step) =>
        step.uses?.startsWith('actions/upload-artifact@'),
      )
      expect(upload?.if).toBe("steps.site-build.outputs.built == 'true'")
      expect(upload?.with).toMatchObject({
        name: SITE_DIST_ARTIFACT,
        path: 'apps/site/dist',
        'if-no-files-found': 'error',
      })
    })

    test('every shard needs build-site and downloads dist only when built', () => {
      expect(needsList(jobs?.e2e?.needs)).toContain('build-site')
      expect(download?.if).toBe("needs.build-site.outputs.built == 'true'")
      expect(download?.with).toMatchObject({
        name: SITE_DIST_ARTIFACT,
        path: 'apps/site/dist',
      })
      expect(e2eSteps.indexOf(download ?? {})).toBeLessThan(
        e2eSteps.indexOf(e2eRun ?? {}),
      )
    })

    test('shards run the site suite against the downloaded dist', () => {
      expect(e2eRun?.run).toMatch(
        /bunx turbo run test:e2e:prebuilt "\$\{affected_flags\[@\]\}" -- --shard="\$\{SHARD\}\/4"/,
      )
      const siteScripts = (
        JSON.parse(
          readFileSync(
            new URL('../apps/site/package.json', import.meta.url),
            'utf8',
          ),
        ) as { scripts: Record<string, string> }
      ).scripts
      expect(siteScripts['test:e2e:prebuilt']).toBe('playwright test')
      const turboTasks = (
        JSON.parse(
          readFileSync(new URL('../turbo.json', import.meta.url), 'utf8'),
        ) as { tasks: Record<string, unknown> }
      ).tasks
      expect(turboTasks['test:e2e:prebuilt']).toEqual(turboTasks['test:e2e'])
    })

    test('astro build runs in build-site and nowhere else', () => {
      const siteBuilders = Object.entries(jobs ?? {}).flatMap(
        ([jobName, job]) =>
          (job.steps ?? []).flatMap((step) =>
            (step.run ?? '')
              .split('\n')
              .filter((line) => isSiteBuildLine(line))
              .map(() => jobName),
          ),
      )
      expect(siteBuilders).toEqual(['build-site'])
    })

    test.each([
      ['bunx astro build', true],
      ['bunx turbo run build --filter=@snug/site', true],
      ['bunx turbo run test:e2e "${affected_flags[@]}"', true],
      ['bunx turbo run check test:e2e', true],
      ["bunx turbo run test:e2e --filter='!@snug/site'", false],
      ['bunx turbo run test:e2e:prebuilt', false],
      ['bunx turbo run zip', false],
    ])('a step line "%s" builds the site: %s', (line, expected) => {
      expect(isSiteBuildLine(line)).toBe(expected)
    })
  })

  describe('sharded e2e', () => {
    const { jobs } = parse(readWorkflowText('ci.yml')) as {
      jobs?: Record<string, ShardedJob>
    }
    const e2e = jobs?.e2e
    const e2eRun = e2e?.steps?.find((step) =>
      step.run?.includes('turbo run test:e2e'),
    )

    test('e2e runs as 4 shards', () => {
      expect(e2e?.strategy?.['fail-fast']).toBe(false)
      expect(e2e?.strategy?.matrix?.shard).toEqual([1, 2, 3, 4])
      expect(e2e?.name).toBe('E2E (Playwright ${{ matrix.shard }}/4)')
      expect(e2e?.['runs-on']).toBe('ubuntu-latest')
    })

    test('forwards --shard to turbo', () => {
      expect(e2eRun?.env?.SHARD).toBe('${{ matrix.shard }}')
      expect(e2eRun?.run).toMatch(
        /bunx turbo run test:e2e --filter='!@snug\/site' "\$\{affected_flags\[@\]\}" -- --shard="\$\{SHARD\}\/4"/,
      )
      expect(e2eRun?.run).toMatch(
        /bunx turbo run test:e2e:prebuilt "\$\{affected_flags\[@\]\}" -- --shard="\$\{SHARD\}\/4"/,
      )
      expect(hasAffectedFlag(e2eRun ?? {})).toBe(true)
    })

    test('failure artifacts are named per shard', () => {
      const uploads = (e2e?.steps ?? []).filter((step) =>
        step.uses?.startsWith('actions/upload-artifact@'),
      )
      expect(uploads.map((step) => step.with?.name)).toEqual([
        'playwright-report-${{ matrix.shard }}',
        'site-playwright-report-${{ matrix.shard }}',
      ])
      for (const upload of uploads) {
        expect(upload.if).toBe('failure()')
      }
    })

    test('the site Playwright config splits shards inside files', () => {
      const siteConfig = readFileSync(
        new URL('../apps/site/playwright.config.ts', import.meta.url),
        'utf8',
      )
      expect(siteConfig).toMatch(/^\s*fullyParallel:\s*true,/m)
    })

    test('CI passed fails when any shard fails or is cancelled', () => {
      const checkStep = workflow.jobs?.['ci-passed']?.steps?.[0]
      const failed = String(checkStep?.env?.FAILED)
      expect(workflow.jobs?.['ci-passed']?.if).toBe('always()')
      expect(failed).toContain("contains(needs.*.result, 'failure')")
      expect(failed).toMatch(/contains\(needs\.\*\.result,\s*'cancelled'\)/)
    })
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

describe.each([
  ['ci.yml', 'e2e'],
  ['site-quality.yml', 'site-quality'],
])('%s:%s caches Playwright browsers', (fileName, jobName) => {
  const steps = readWorkflow(fileName).jobs?.[jobName]?.steps ?? []
  const version = steps.find((step) => step.id === 'playwright-version')
  const cache = steps.find(
    (step) =>
      isCacheStep(step) && cachedPaths(step).includes('~/.cache/ms-playwright'),
  )
  const installs = steps.filter((step) =>
    /^bunx playwright install\b/.test(step.run ?? ''),
  )

  test('keys the browser cache on the installed Playwright version', () => {
    expect(version?.run).toContain('bunx playwright --version')
    expect(cache?.id).toBe('playwright-cache')
    expect(cache?.with?.key).toBe(
      '${{ runner.os }}-playwright-${{ steps.playwright-version.outputs.version }}',
    )
    expect(cache?.with?.['restore-keys']).toBeUndefined()
    expect(steps.indexOf(version ?? {})).toBeLessThan(
      steps.indexOf(cache ?? {}),
    )
  })

  test('downloads browsers on a miss and only system deps on a hit', () => {
    expect(installs.map((step) => ({ if: step.if, run: step.run }))).toEqual([
      {
        if: "steps.playwright-cache.outputs.cache-hit != 'true'",
        run: 'bunx playwright install --with-deps chromium',
      },
      {
        if: "steps.playwright-cache.outputs.cache-hit == 'true'",
        run: 'bunx playwright install-deps chromium',
      },
    ])
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

describe('browserstack.yml nightly failure reporting', () => {
  const workflow = readWorkflow('browserstack.yml')
  const report = workflow.jobs?.['report-failure']
  const resolve = workflow.jobs?.['resolve-failure']

  test('only the two reporting jobs may write issues', () => {
    const writers = Object.entries(workflow.jobs ?? {})
      .filter(
        ([, job]) =>
          (job.permissions as { issues?: string } | undefined)?.issues ===
          'write',
      )
      .map(([name]) => name)
    expect(writers).toEqual(['report-failure', 'resolve-failure'])
  })

  test('reporting jobs wait on layout and run for scheduled runs only', () => {
    for (const job of [report, resolve]) {
      expect(needsList(job?.needs)).toEqual(['layout'])
      expect(String(job?.if)).toContain("github.event_name == 'schedule'")
    }
  })

  test('failure is reported on failure and closed only on layout success', () => {
    expect(String(report?.if)).toContain("needs.layout.result == 'failure'")
    expect(String(resolve?.if)).toContain("needs.layout.result == 'success'")
  })

  test('the ci.yml caller grants the issues permission the reporting jobs request', () => {
    const caller = readWorkflow('ci.yml').jobs?.browserstack
    expect(
      (caller?.permissions as { issues?: string } | undefined)?.issues,
    ).toBe('write')
  })

  test('the failure report opts out of the implicit success() gate', () => {
    expect(String(report?.if)).toMatch(/\b(always|failure)\(\)/)
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
