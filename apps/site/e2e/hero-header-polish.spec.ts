import { expect, test } from '@playwright/test'

const DESKTOP_WIDTH = 1440
const PHONE_WIDTH = 375
const NARROWEST_WIDTH = 320

for (const width of [DESKTOP_WIDTH, PHONE_WIDTH]) {
  test(`the hero glow starts at the top of the page at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    const heroTop = await page
      .locator('[data-section="hero"]')
      .evaluate((hero) => hero.getBoundingClientRect().top)
    expect(heroTop).toBe(0)
  })
}

test('only the middle journey card carries the amber ring', async ({
  page,
}) => {
  await page.goto('/')
  const shadows = await page
    .locator('[data-section="hero"] figure [data-slot="card"]')
    .evaluateAll((cards) =>
      cards.map((card) => globalThis.getComputedStyle(card).boxShadow),
    )
  expect(shadows).toHaveLength(3)
  expect(shadows[1]).not.toBe(shadows[0])
  expect(shadows[0]).toBe(shadows[2])
})

test('hero and feature chips share one style', async ({ page }) => {
  await page.goto('/')
  const readChipStyle = (selector: string) =>
    page
      .locator(`${selector} [data-slot="badge"]`)
      .first()
      .evaluate((chip) => {
        const style = globalThis.getComputedStyle(chip)
        return [
          style.borderTopWidth,
          style.borderTopColor,
          style.backgroundColor,
          style.borderRadius,
          style.fontFamily,
          style.fontSize,
          style.color,
        ]
      })
  expect(await readChipStyle('[data-section="hero"]')).toEqual(
    await readChipStyle('[data-section="features"]'),
  )
})

test('Japanese headings break by phrase', async ({ page }) => {
  await page.setViewportSize({ width: PHONE_WIDTH, height: 800 })
  await page.goto('/ja/')
  const wordBreaks = await page
    .locator('h1, h2')
    .evaluateAll((headings) =>
      headings.map((heading) => globalThis.getComputedStyle(heading).wordBreak),
    )
  expect(wordBreaks.length).toBeGreaterThan(1)
  expect(new Set(wordBreaks)).toEqual(new Set(['auto-phrase']))
})

test('the German h1 keeps Lesezeichen on one line at 320', async ({ page }) => {
  await page.setViewportSize({ width: NARROWEST_WIDTH, height: 700 })
  await page.goto('/de/')
  const heading = page.locator('h1')
  await expect(heading).toHaveCSS('hyphens', 'manual')
  const lineCount = await heading.evaluate((element) => {
    const word = 'Lesezeichen'
    const text = element.querySelector('span')!.firstChild!
    const start = text.textContent!.indexOf(word)
    const range = globalThis.document.createRange()
    range.setStart(text, start)
    range.setEnd(text, start + word.length)
    return new Set([...range.getClientRects()].map((rect) => rect.top)).size
  })
  expect(lineCount).toBe(1)
})
