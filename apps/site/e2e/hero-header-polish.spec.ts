import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { localePath, LOCALES } from '../src/i18n/locales'

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

test('only the target browser card carries the amber ring', async ({
  page,
}) => {
  await page.goto('/')
  const shadows = await page
    .locator('[data-section="how"] figure [data-slot="card"]')
    .evaluateAll((cards) =>
      cards.map((card) => globalThis.getComputedStyle(card).boxShadow),
    )
  expect(shadows).toHaveLength(2)
  expect(shadows[1]).not.toBe(shadows[0])
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

for (const locale of LOCALES) {
  test(`the ${locale} h1 is the single localized headline`, async ({
    page,
  }) => {
    await page.goto(localePath(locale))
    const content = JSON.parse(
      readFileSync(
        path.join(import.meta.dirname, '../src/content', `${locale}.json`),
        'utf8',
      ),
    ) as {
      landing: {
        hero: { eyebrow: string; headline: string; headlineAccent: string }
      }
    }
    const separator = locale === 'ja' || locale === 'zh_CN' ? '' : ' '
    const { headline, headlineAccent } = content.landing.hero
    await expect(page.locator('h1')).toHaveCount(1)
    const fullHeadline = `${headline}${separator}${headlineAccent}`
    await expect(page.locator('h1')).toHaveText(fullHeadline)
    expect(await page.locator('h1').evaluate((h) => h.textContent)).toBe(
      fullHeadline,
    )
    await expect(page.locator('h1 > span')).toHaveText(headlineAccent)
    await expect(page.locator('h1 > span')).toHaveClass(/text-primary-text/)
    await expect(
      page.locator('[data-section="hero"] p.font-mono').first(),
    ).toHaveText(content.landing.hero.eyebrow)
  })
}

test('the German h1 does not overflow at 320', async ({ page }) => {
  await page.setViewportSize({ width: NARROWEST_WIDTH, height: 700 })
  await page.goto('/de/')
  const overflow = await page
    .locator('h1')
    .evaluate((element) => element.scrollWidth - element.clientWidth)
  expect(overflow).toBeLessThanOrEqual(0)
})
