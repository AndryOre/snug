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
