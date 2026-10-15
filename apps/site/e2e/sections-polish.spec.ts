import { expect, test } from '@playwright/test'
import type { Locator } from '@playwright/test'

import { firstFaqTrigger, hydratedFaq } from './faq-helpers'

async function distinctOffsets(cards: Locator) {
  const boxes = await cards.evaluateAll((elements) =>
    elements.map((element) => {
      const { left, top } = element.getBoundingClientRect()
      return { left: Math.round(left), top: Math.round(top) }
    }),
  )
  return {
    columns: new Set(boxes.map((box) => box.left)).size,
    rows: new Set(boxes.map((box) => box.top)).size,
  }
}

for (const { width, columns, rows } of [
  { width: 1280, columns: 2, rows: 3 },
  { width: 1440, columns: 2, rows: 3 },
  { width: 375, columns: 1, rows: 4 },
]) {
  test(`bento renders ${columns} columns by ${rows} rows at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    const cards = page.locator('[data-section="bento"] ul > li')
    await expect(cards).toHaveCount(4)
    expect(await distinctOffsets(cards)).toEqual({ columns, rows })
  })
}

test('bento has no horizontal overflow at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 })
  await page.goto('/')
  const overflow = await page.evaluate(
    () =>
      globalThis.document.documentElement.scrollWidth - globalThis.innerWidth,
  )
  expect(overflow).toBeLessThanOrEqual(0)
})

test('bento loops run under no-preference and stay static under reduce', async ({
  page,
}) => {
  const animationNames = () =>
    page.evaluate(() =>
      [
        ...globalThis.document.querySelectorAll(
          '[data-section="bento"] svg [data-bento]',
        ),
      ].map((element) => globalThis.getComputedStyle(element).animationName),
    )
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  const running = await animationNames()
  expect(running).toEqual(expect.arrayContaining(['bento-rise', 'bento-drop']))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const reduced = await animationNames()
  expect(new Set(reduced)).toEqual(new Set(['none']))
})

test('open FAQ answers use the lead size with a 4px top offset', async ({
  page,
}) => {
  await page.goto('/')
  const trigger = await firstFaqTrigger(page)
  await trigger.click()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  const answer = page
    .locator('[data-section="faq"] [data-slot="accordion-content"] > div')
    .first()
  await expect(answer).toBeVisible()
  const style = await answer.evaluate((element) => {
    const computed = getComputedStyle(element)
    return {
      fontSize: computed.fontSize,
      paddingTop: computed.paddingTop,
      lineHeight:
        Number(computed.lineHeight.replace('px', '')) /
        Number(computed.fontSize.replace('px', '')),
    }
  })
  expect(style.fontSize).toBe('17px')
  expect(style.paddingTop).toBe('4px')
  expect(style.lineHeight).toBeCloseTo(1.6, 2)

  await trigger.click()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
})

test('a collapsed FAQ answer opens when find-in-page reveals it', async ({
  page,
}) => {
  await page.goto('/')
  const trigger = await firstFaqTrigger(page)
  const panel = page
    .locator('[data-section="faq"] [data-slot="accordion-content"]')
    .first()
  await expect(panel).toHaveAttribute('hidden', 'until-found')
  await panel.evaluate((element) => {
    element.dispatchEvent(new Event('beforematch', { bubbles: true }))
  })
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
})

test('the FAQ visual follows the open item and More questions opens the Guide FAQ', async ({
  page,
}) => {
  await page.goto('/')
  const faq = await hydratedFaq(page)
  const visual = (key: string) => faq.locator(`[data-faq-visual="${key}"]`)
  await expect(visual('network')).toHaveCSS('opacity', '1')
  await faq.getByRole('button').nth(0).click()
  await expect(visual('network')).toHaveCSS('opacity', '1')
  await faq.getByRole('button').nth(2).click()
  await expect(visual('sync')).toHaveCSS('opacity', '1')
  await expect(visual('network')).toHaveCSS('opacity', '0')
  await expect(
    faq.getByRole('link', { name: 'More questions' }),
  ).toHaveAttribute('href', '/guide/faq/')
})
