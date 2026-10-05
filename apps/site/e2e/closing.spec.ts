import { expect, test } from '@playwright/test'

import { localePath, LOCALES } from '../src/i18n/locales'

const PATHS = LOCALES.map((locale) => localePath(locale))

const REVIEW_AUTHORS = [
  'Birdman, Jun 2025',
  'Sean Frey, Sep 2024',
  'Karol Darvaš, Feb 2026',
  'Jacob Hanson, Jun 2026',
]

for (const path of PATHS) {
  test(`${path} renders proof, FAQ, final install and footer`, async ({
    page,
  }) => {
    await page.goto(path)

    const proof = page.locator('[data-section="proof"]')
    await expect(proof.locator('blockquote')).toHaveCount(4)
    for (const caption of REVIEW_AUTHORS) {
      await expect(
        proof.locator('figcaption', { hasText: caption }),
      ).toHaveCount(1)
    }
    await expect(proof.locator('[data-proof="numbers"]')).toContainText(
      '2026-10-05',
    )
    await expect(proof.locator('[data-proof="rename-note"]')).toContainText(
      'Bookmark Import/Export',
    )

    await expect(page.locator('[data-section="faq"] details')).toHaveCount(11)
    await expect(page.locator('[data-section="final"]')).toBeVisible()
    await expect(page.locator('a[data-install="final"]')).toHaveAttribute(
      'href',
      '/install?c=final',
    )
    await expect(page.locator('a[data-footer-link="listing"]')).toHaveAttribute(
      'href',
      '/install?c=footer',
    )
    await expect(page.locator('a[data-footer-link]')).toHaveCount(4)
  })
}

test('English figures match the content document', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-proof="numbers"]')).toHaveText(
    '5,000 users. 4.8 stars from 20 ratings on the Chrome Web Store (2026-10-05).',
  )
})

test('FAQ opens and closes by keyboard', async ({ page }) => {
  await page.goto('/')
  const first = page.locator('[data-section="faq"] details').first()
  const summary = first.locator('summary')
  await summary.focus()
  await expect(first).not.toHaveAttribute('open', '')
  await page.keyboard.press('Enter')
  await expect(first).toHaveAttribute('open', '')
  await expect(first.locator('p')).toBeVisible()
  await page.keyboard.press('Space')
  await expect(first).not.toHaveAttribute('open', '')
})

test('FAQ questions are headings and only one answer is open', async ({
  page,
}) => {
  await page.goto('/')
  const items = page.locator('[data-section="faq"] details')
  await expect(page.locator('[data-section="faq"] summary h3')).toHaveCount(11)
  await items.nth(0).locator('summary').click()
  await expect(items.nth(0)).toHaveAttribute('open', '')
  await items.nth(1).locator('summary').click()
  await expect(items.nth(1)).toHaveAttribute('open', '')
  await expect(items.nth(0)).not.toHaveAttribute('open', '')
})

test('language switcher moves between locales without redirecting', async ({
  page,
}) => {
  await page.goto('/')
  const switcher = page.locator('[data-language-switcher]')
  const trigger = switcher.getByRole('button')
  await trigger.focus()
  await page.keyboard.press('Enter')
  const links = switcher.locator('nav a')
  await expect(links).toHaveCount(10)
  await expect(links.first()).toHaveAttribute('aria-current', 'page')

  await switcher.getByRole('link', { name: 'Deutsch' }).click()
  await expect(page).toHaveURL(/\/de\/$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'de')

  await page.locator('[data-language-switcher]').getByRole('button').click()
  await page.getByRole('link', { name: 'English' }).click()
  await expect(page).toHaveURL(/localhost:4399\/$/)
})

test('language switcher closes on Escape and returns focus to the trigger', async ({
  page,
}) => {
  await page.goto('/')
  const switcher = page.locator('[data-language-switcher]')
  const trigger = switcher.getByRole('button')
  const panel = switcher.locator('nav')
  await trigger.click()
  await expect(panel).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(panel).toBeHidden()
  await expect(trigger).toBeFocused()
})

test('language switcher closes on outside click', async ({ page }) => {
  await page.goto('/')
  const switcher = page.locator('[data-language-switcher]')
  const panel = switcher.locator('nav')
  await switcher.getByRole('button').click()
  await expect(panel).toBeVisible()
  await page.mouse.click(10, 400)
  await expect(panel).toBeHidden()
})

for (const width of [320, 375, 768, 1240]) {
  test(`language switcher opens within the viewport at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 })
    await page.goto('/pt-br/')
    const switcher = page.locator('[data-language-switcher]')
    await switcher.getByRole('button').click()
    const box = await switcher.locator('nav').boundingBox()
    expect(box).not.toBeNull()
    expect(box!.x).toBeGreaterThanOrEqual(0)
    expect(box!.x + box!.width).toBeLessThanOrEqual(width)
    const scrollWidth = await page
      .locator('html')
      .evaluate((root) => root.scrollWidth)
    expect(scrollWidth).toBeLessThanOrEqual(width)
  })
}

test('header keeps brand and switcher on one row at 320px', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 })
  await page.goto('/pt-br/')
  const header = page.locator('header')
  const brand = await header.getByRole('link', { name: 'Snug' }).boundingBox()
  const trigger = await header
    .locator('[data-language-switcher]')
    .getByRole('button')
    .boundingBox()
  expect(brand!.y).toBeLessThan(trigger!.y + trigger!.height)
  expect(trigger!.y).toBeLessThan(brand!.y + brand!.height)
  expect((await header.boundingBox())!.height).toBeLessThanOrEqual(64)
})

test('skip link is first in tab order and reaches main', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  const skip = page.locator('a[href="#main"]')
  await expect(skip).toBeFocused()
  await expect(skip).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#main$/)
  await expect(page.locator('main#main')).toHaveCount(1)
})

for (const path of ['/de/', '/privacy/', '/404/']) {
  test(`header is present on ${path}`, async ({ page }) => {
    await page.goto(path)
    await expect(page.locator('header [data-language-switcher]')).toBeVisible()
    await expect(page.locator('main#main')).toHaveCount(1)
  })
}

test('visiting a locale never redirects to another', async ({ page }) => {
  const response = await page.goto('/ja/')
  expect(response?.request().redirectedFrom()).toBeNull()
  await expect(page).toHaveURL(/\/ja\/$/)
})

test('proof section keeps third-party requests off the page', async ({
  page,
}) => {
  const origins = new Set<string>()
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (url.protocol.startsWith('http')) origins.add(url.origin)
  })
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  expect([...origins]).toEqual(['http://localhost:4399'])
})
