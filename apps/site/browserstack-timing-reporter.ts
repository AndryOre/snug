import type {
  Reporter,
  TestCase,
  TestResult,
  TestStep,
} from '@playwright/test/reporter'
import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs'

interface TestTiming {
  title: string
  totalMs: number
  apiMs: number
  fixtureMs: number
  otherMs: number
}

const TIMINGS_PATH = 'test-results/browserstack-timings.json'

function percentile(sortedValues: number[], fraction: number): number {
  if (sortedValues.length === 0) return 0
  const index = Math.min(
    sortedValues.length - 1,
    Math.floor(sortedValues.length * fraction),
  )
  return sortedValues[index] ?? 0
}

function seconds(milliseconds: number): string {
  return `${(milliseconds / 1000).toFixed(1)}s`
}

/**
 * Logs how long each test takes and where the time goes, so slow platforms
 * (the real iPhone) can be attributed to tunnel round trips (`pw:api` calls)
 * or to remote session and page setup (fixtures). Writes a JSON file and, on
 * GitHub Actions, a summary table to the job summary.
 */
export default class BrowserStackTimingReporter implements Reporter {
  private readonly timings: TestTiming[] = []

  onTestEnd(test: TestCase, result: TestResult): void {
    const steps = new Map<TestStep['category'], number>()
    const collect = (step: TestStep): void => {
      steps.set(step.category, (steps.get(step.category) ?? 0) + step.duration)
    }
    const visit = (stepList: TestStep[]): void => {
      for (const step of stepList) {
        if (step.category === 'pw:api' || step.category === 'fixture') {
          collect(step)
        } else {
          visit(step.steps)
        }
      }
    }
    visit(result.steps)

    const apiMs = steps.get('pw:api') ?? 0
    const fixtureMs = steps.get('fixture') ?? 0
    const timing: TestTiming = {
      title: test.titlePath().slice(1).join(' > '),
      totalMs: result.duration,
      apiMs,
      fixtureMs,
      otherMs: Math.max(0, result.duration - apiMs - fixtureMs),
    }
    this.timings.push(timing)
    console.log(
      `[timing] ${seconds(timing.totalMs)} (api ${seconds(apiMs)}, fixtures ${seconds(fixtureMs)}) ${timing.title}`,
    )
  }

  onEnd(): void {
    if (this.timings.length === 0) return
    const totals = this.timings
      .map((timing) => timing.totalMs)
      .toSorted((a, b) => a - b)
    const sum = (select: (timing: TestTiming) => number): number => {
      let total = 0
      for (const timing of this.timings) total += select(timing)
      return total
    }
    const count = this.timings.length
    const meanTotal = sum((timing) => timing.totalMs) / count
    const meanApi = sum((timing) => timing.apiMs) / count
    const meanFixture = sum((timing) => timing.fixtureMs) / count
    const meanOther = sum((timing) => timing.otherMs) / count

    const summary = [
      `[timing] ${count} test attempts: mean ${seconds(meanTotal)}, p50 ${seconds(percentile(totals, 0.5))}, p95 ${seconds(percentile(totals, 0.95))}, max ${seconds(percentile(totals, 1))}`,
      `[timing] mean split: pw:api ${seconds(meanApi)}, fixtures ${seconds(meanFixture)}, other ${seconds(meanOther)}`,
    ].join('\n')
    console.log(summary)

    mkdirSync('test-results', { recursive: true })
    writeFileSync(TIMINGS_PATH, JSON.stringify(this.timings, null, 2))

    const summaryFile = process.env.GITHUB_STEP_SUMMARY
    if (!summaryFile) return
    const platform = process.env.BROWSERSTACK_PLATFORM_LABEL ?? 'platform'
    appendFileSync(
      summaryFile,
      `### Timing: ${platform}\n\n| Metric | Value |\n| --- | --- |\n| Test attempts | ${count} |\n| Mean | ${seconds(meanTotal)} |\n| p50 | ${seconds(percentile(totals, 0.5))} |\n| p95 | ${seconds(percentile(totals, 0.95))} |\n| Mean pw:api | ${seconds(meanApi)} |\n| Mean fixtures | ${seconds(meanFixture)} |\n| Mean other | ${seconds(meanOther)} |\n\n`,
    )
  }
}
