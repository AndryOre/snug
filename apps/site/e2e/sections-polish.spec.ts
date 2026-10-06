import { expect, test } from '@playwright/test'
import type { Locator } from '@playwright/test'

import { firstFaqTrigger } from './faq-helpers'

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
  { width: 1280, columns: 3, rows: 2 },
  { width: 1440, columns: 3, rows: 2 },
  { width: 375, columns: 1, rows: 6 },
]) {
  test(`features render ${columns} columns by ${rows} rows at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    const cards = page.locator('[data-section="features"] ol > li')
    await expect(cards).toHaveCount(6)
    expect(await distinctOffsets(cards)).toEqual({ columns, rows })
  })
}

test('trust items carry no step numerals', async ({ page }) => {
  await page.goto('/')
  const items = page.locator('[data-section="trust"] ol > li')
  await expect(items).toHaveCount(3)
  const texts = await items.allInnerTexts()
  for (const text of texts) {
    expect(text).not.toMatch(/\b0[1-3]\b/)
  }
  await expect(
    page.locator('[data-section="trust"] ol span[aria-hidden="true"]'),
  ).toHaveCount(0)
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
