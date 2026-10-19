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

test('language popover has no transform animation under reduced motion', async ({
  page,
}) => {
  await page.goto('/')
  await page.locator('[data-language-switcher]').getByRole('button').click()
  await expect(page.locator('[data-language-menu]')).toBeVisible()
  const popup = page.locator('[data-slot="popover-content"]')
  const transforms = await popup.evaluate((element) =>
    element
      .getAnimations()
      .flatMap((animation) =>
        (animation.effect as KeyframeEffect)
          .getKeyframes()
          .map((keyframe) => String(keyframe.transform ?? 'none')),
      ),
  )
  const identityTransform =
    /^(none|translate3d\(0(px)?,0(px|%)?,0(px)?\)scale3d\(1,1,1\)rotate\(0deg\))$/
  const moving = transforms
    .map((value) => value.replaceAll(/\s+/g, ''))
    .filter((value) => !identityTransform.test(value))
  expect(moving).toEqual([])
})

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

test('stats show their final numbers as plain text', async ({ page }) => {
  await page.goto('/')
  const value = page.locator('[data-section="stats"] dd').first()
  await expect(value).toContainText('5,000')
  const content = await value.evaluate(
    (element) => getComputedStyle(element, '::after').content,
  )
  expect(['none', 'normal']).toContain(content)
})

test('how it works journey is static and fully visible', async ({ page }) => {
  await page.goto('/')
  for (const selector of ['.hero-arrow-in', '.hero-arrow-out', '.hero-file']) {
    const target = page.locator(`[data-section="how"] ${selector}`)
    await expect(target).toHaveCSS('animation-name', 'none')
    await expect(target).toHaveCSS('opacity', '1')
  }
  const logos = page.locator('[data-section="how"] .hero-logos > *')
  await expect(logos.first()).toHaveCSS('opacity', '1')
})

test('cross-document view transitions are not active', async ({ page }) => {
  await page.goto('/')
  const active = await page.evaluate(() => {
    const found: string[] = []
    const visit = (list: CSSRuleList) => {
      for (const rule of list) {
        if (rule.constructor.name === 'CSSViewTransitionRule') {
          found.push(rule.cssText)
        } else if ('conditionText' in rule && 'cssRules' in rule) {
          if (globalThis.matchMedia(String(rule.conditionText)).matches) {
            visit(rule.cssRules as CSSRuleList)
          }
        } else if ('cssRules' in rule) {
          visit((rule as CSSGroupingRule).cssRules)
        }
      }
    }
    for (const sheet of globalThis.document.styleSheets) visit(sheet.cssRules)
    return found
  })
  expect(active).toEqual([])
})

test('a theme switch starts no view transition', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    const started: string[] = []
    const original = globalThis.document.startViewTransition.bind(
      globalThis.document,
    )
    globalThis.document.startViewTransition = (...callArguments) => {
      started.push('started')
      return original(...callArguments)
    }
    Object.assign(globalThis, { startedTransitions: started })
  })
  await page.locator('[data-theme-menu]').getByRole('button').click()
  await page.getByRole('menuitemradio', { name: 'Dark' }).click()
  await expect(page.locator('html')).toHaveClass(/\bdark\b/)
  const started = await page.evaluate(
    () =>
      (globalThis as unknown as { startedTransitions: string[] })
        .startedTransitions,
  )
  expect(started).toEqual([])
})

test('scroll reveals are not animated', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-bento-card]').first()).toHaveCSS(
    'animation-name',
    'none',
  )
})
