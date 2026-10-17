import { expect, type Page, test } from '@playwright/test'

import { localePath, LOCALES } from '../src/i18n/locales'

const PATHS = LOCALES.map((locale) => localePath(locale))

/**
 * Scroll the page top to bottom in viewport-sized steps so every
 * scroll-driven timeline passes through its range.
 * @param page - A page that finished its first navigation.
 */
async function scrollThroughPage(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const step = globalThis.innerHeight * 0.6
    const end = () =>
      globalThis.document.documentElement.scrollHeight - globalThis.innerHeight
    for (let top = 0; top < end(); top += step) {
      globalThis.scrollTo(0, top)
      await new Promise((resolve) => globalThis.requestAnimationFrame(resolve))
    }
    globalThis.scrollTo(0, end())
    await new Promise((resolve) => globalThis.requestAnimationFrame(resolve))
    await new Promise((resolve) => globalThis.requestAnimationFrame(resolve))
  })
}

test.describe('motion allowed', () => {
  test.use({ reducedMotion: 'no-preference' })

  for (const path of PATHS) {
    test(`${path} settles every reveal by the end of the page`, async ({
      page,
    }) => {
      await page.goto(path)
      await scrollThroughPage(page)
      const unsettled = await page.evaluate(() =>
        [...globalThis.document.querySelectorAll('main *')]
          .filter((element) => {
            const style = globalThis.getComputedStyle(element)
            const isReveal = style.animationName
              .split(',')
              .some((name) => name.trim() === 'motion-reveal')
            if (!isReveal) return false
            const box = element.getBoundingClientRect()
            const isPassedOrInView = box.top < globalThis.innerHeight * 0.4
            return isPassedOrInView && Number(style.opacity) < 1
          })
          .map(
            (element) =>
              `${element.tagName.toLowerCase()}.${(element.getAttribute('class') ?? '').slice(0, 60)}`,
          ),
      )
      expect(unsettled).toEqual([])
    })
  }
})

const REVEAL_SECTIONS = ['how', 'bento', 'interface', 'proof', 'faq', 'final']
const STATIC_SECTIONS = ['hero', 'stats']

test.describe('reveal coverage', () => {
  test.use({ reducedMotion: 'no-preference' })

  test('every in-scope section reveals and the hero stays static', async ({
    page,
  }) => {
    await page.goto('/')
    const hasScrollTimelines = await page.evaluate(
      () => 'animationTimeline' in globalThis.document.body.style,
    )
    test.skip(!hasScrollTimelines, 'scroll-driven animations unsupported')
    const revealCounts = await page.evaluate(() => {
      const counts: Record<string, number> = {}
      for (const element of globalThis.document.querySelectorAll(
        '[data-section] *, [data-section]',
      )) {
        const section =
          element.closest<HTMLElement>('[data-section]')?.dataset.section
        const isReveal = globalThis
          .getComputedStyle(element)
          .animationName.split(',')
          .some((animation) => animation.trim() === 'motion-reveal')
        if (section && isReveal) counts[section] = (counts[section] ?? 0) + 1
      }
      return counts
    })
    const counts = {
      revealed: REVEAL_SECTIONS.map(
        (name) => [name, revealCounts[name] ?? 0] as const,
      ),
      untouched: STATIC_SECTIONS.map(
        (name) => [name, revealCounts[name] ?? 0] as const,
      ),
    }
    for (const [name, count] of counts.revealed) {
      expect(count, `${name} has reveal elements`).toBeGreaterThan(0)
    }
    for (const [name, count] of counts.untouched) {
      expect(count, `${name} has no reveal elements`).toBe(0)
    }
  })
})

/**
 * Sample the first stat's counted value every frame for a fixed window.
 * @param page - A page that finished its first navigation.
 * @param durationMs - How long to sample.
 * @returns The sampled values and the final target.
 */
async function sampleStatValues(
  page: Page,
  durationMs: number,
): Promise<{ values: number[]; target: number }> {
  return page.evaluate(async (windowMs) => {
    const stat = globalThis.document.querySelector<HTMLElement>(
      '[data-section="stats"] dd[data-stat]',
    )
    if (stat === null) throw new Error('stats strip is missing')
    const read = () => {
      const style = globalThis.getComputedStyle(stat)
      return {
        value: Number(style.getPropertyValue('--stat-value')),
        target: Number(style.getPropertyValue('--stat-target')),
      }
    }
    const values: number[] = []
    const startedAt = globalThis.performance.now()
    while (globalThis.performance.now() - startedAt < windowMs) {
      values.push(read().value)
      await new Promise((resolve) => globalThis.requestAnimationFrame(resolve))
    }
    values.push(read().value)
    return { values, target: read().target }
  }, durationMs)
}

test.describe('stats count-up', () => {
  test.use({ reducedMotion: 'no-preference' })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    const hasTriggerSupport = await page.evaluate(
      () => 'timelineTriggerName' in globalThis.document.body.style,
    )
    test.skip(!hasTriggerSupport, 'timeline-trigger needs Chrome 145+')
  })

  test('counts at once when the strip is visible on load', async ({
    page,
    hasTouch,
  }) => {
    test.skip(hasTouch, 'real touch devices ignore the 1280×1000 viewport')
    await page.setViewportSize({ width: 1280, height: 1000 })
    await page.goto('/')
    const { values, target } = await sampleStatValues(page, 2400)
    expect(target).toBeGreaterThan(0)
    expect(values.some((value) => value > 0 && value < target)).toBe(true)
    expect(values.at(-1)).toBe(target)
  })

  test('counts only after the strip scrolls into view in a short viewport', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 600 })
    await page.goto('/')
    const before = await sampleStatValues(page, 300)
    expect(new Set(before.values)).toEqual(new Set([0]))
    await page
      .locator('[data-section="stats"]')
      .evaluate((element) => element.scrollIntoView({ block: 'center' }))
    const { values, target } = await sampleStatValues(page, 2400)
    expect(values.some((value) => value > 0 && value < target)).toBe(true)
    expect(values.at(-1)).toBe(target)
  })
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  for (const path of PATHS) {
    test(`${path} is static and fully visible`, async ({ page }) => {
      await page.goto(path)
      await scrollThroughPage(page)
      const report = await page.evaluate(() => {
        const running = globalThis.document
          .getAnimations()
          .filter((animation) => animation.playState === 'running')
          .map((animation) => animation.constructor.name)
        const hidden = [...globalThis.document.querySelectorAll('main *')]
          .filter((element) => {
            const style = globalThis.getComputedStyle(element)
            return (
              style.display !== 'none' &&
              style.visibility !== 'hidden' &&
              Number(style.opacity) === 0 &&
              !element.closest('[hidden], [aria-hidden="true"], [inert]')
            )
          })
          .map((element) => element.tagName.toLowerCase())
        return { running, hidden }
      })
      expect(report.running).toEqual([])
      expect(report.hidden).toEqual([])
    })
  }
})

test.describe('layout stability', () => {
  test.use({ reducedMotion: 'no-preference' })

  test('home page records zero layout shift while scrolling', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const shifts: number[] = []
      Object.assign(globalThis, { __layoutShifts: shifts })
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & {
            hadRecentInput: boolean
            value: number
          }
          if (!shift.hadRecentInput) shifts.push(shift.value)
        }
      }).observe({ type: 'layout-shift', buffered: true })
    })
    await page.goto('/')
    await scrollThroughPage(page)
    await page.waitForLoadState('networkidle')
    const shifts = await page.evaluate(
      () =>
        (globalThis as unknown as { __layoutShifts: number[] }).__layoutShifts,
    )
    expect(shifts.filter((value) => value > 0)).toEqual([])
  })
})
