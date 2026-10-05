import { expect, test } from '@playwright/test'

import { localePath, LOCALES } from '../src/i18n/locales'
import { hydratedFaq } from './faq-helpers'

test.use({ reducedMotion: 'reduce' })

const PATHS = LOCALES.map((locale) => localePath(locale))

for (const path of PATHS) {
  test(`${path} hydrates without console errors or failed requests under reduced motion`, async ({
    page,
  }) => {
    const problems: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error')
        problems.push(`console: ${message.text()}`)
    })
    page.on('pageerror', (error) => {
      problems.push(`pageerror: ${error.message}`)
    })
    page.on('requestfailed', (request) => {
      problems.push(`requestfailed: ${request.url()}`)
    })
    page.on('response', (response) => {
      if (response.status() >= 400)
        problems.push(`${response.status()}: ${response.url()}`)
    })

    await page.goto(path)
    expect(
      await page.evaluate(
        () => globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches,
      ),
    ).toBe(true)
    await page.evaluate(() =>
      globalThis.scrollTo(0, globalThis.document.body.scrollHeight),
    )
    await page.waitForLoadState('networkidle')

    expect(problems).toEqual([])
  })
}

test('FAQ accordion has no transitions under reduced motion', async ({
  page,
}) => {
  await page.goto('/')
  const faq = await hydratedFaq(page)
  const trigger = faq.getByRole('button').first()
  await trigger.click()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  const durations = await faq.evaluate((section) =>
    [
      ...section.querySelectorAll(
        '[data-slot="accordion-trigger"], [data-slot="accordion-trigger-icon"], [data-slot="accordion-content"]',
      ),
    ].map((element) => {
      const style = globalThis.getComputedStyle(element)
      return [style.transitionDuration, style.animationDuration]
    }),
  )
  expect(durations.length).toBeGreaterThan(0)
  for (const pair of durations) {
    for (const duration of pair) {
      expect(
        duration
          .split(',')
          .every((part) => Number(part.trim().replace('s', '')) === 0),
      ).toBe(true)
    }
  }
})
