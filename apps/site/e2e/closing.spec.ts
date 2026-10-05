import { expect, type Page, test } from '@playwright/test'

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

const MENU = '[data-language-menu]'

async function waitForLanguageIsland(page: Page): Promise<void> {
  await expect(page.locator('astro-island[client="idle"]')).not.toHaveAttribute(
    'ssr',
    '',
  )
}

async function openLanguageMenu(page: Page): Promise<void> {
  await waitForLanguageIsland(page)
  await page.locator('[data-language-switcher]').getByRole('button').click()
  await expect(page.locator(MENU)).toBeVisible()
  await page.evaluate(() =>
    Promise.all(globalThis.document.getAnimations().map((a) => a.finished)),
  )
}

test('language switcher moves between locales without redirecting', async ({
  page,
}) => {
  await page.goto('/')
  const switcher = page.locator('[data-language-switcher]')
  await waitForLanguageIsland(page)
  await switcher.getByRole('button').focus()
  await page.keyboard.press('Enter')
  const links = page.locator(`${MENU} a`)
  await expect(links).toHaveCount(LOCALES.length)
  await expect(links.first()).toHaveAttribute('aria-current', 'page')
  await expect(page.locator(`${MENU} a[aria-current]`)).toHaveCount(1)

  await page.locator(MENU).getByRole('link', { name: 'Deutsch' }).click()
  await expect(page).toHaveURL(/\/de\/$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'de')

  await openLanguageMenu(page)
  await page.locator(MENU).getByRole('link', { name: 'English' }).click()
  await expect(page).toHaveURL(/localhost:4399\/$/)
})

test('language switcher menu moves focus through items with Tab', async ({
  page,
}) => {
  await page.goto('/')
  await waitForLanguageIsland(page)
  await page.locator('[data-language-switcher]').getByRole('button').focus()
  await page.keyboard.press('Enter')
  const links = page.locator(`${MENU} a`)
  await expect(links.first()).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(links.nth(1)).toBeFocused()
})

test('language switcher closes on Escape and returns focus to the trigger', async ({
  page,
}) => {
  await page.goto('/')
  const trigger = page.locator('[data-language-switcher]').getByRole('button')
  const panel = page.locator(MENU)
  await openLanguageMenu(page)
  await page.keyboard.press('Escape')
  await expect(panel).toBeHidden()
  await expect(trigger).toBeFocused()
})

test('language switcher closes on outside click', async ({ page }) => {
  await page.goto('/')
  const panel = page.locator(MENU)
  await openLanguageMenu(page)
  await page.mouse.click(10, 400)
  await expect(panel).toBeHidden()
})

test('language menu items are at least 44px tall', async ({ page }) => {
  await page.goto('/')
  await openLanguageMenu(page)
  const links = page.locator(`${MENU} a`)
  await expect(links).toHaveCount(LOCALES.length)
  const items = await links.all()
  for (const link of items) {
    expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44)
  }
})

for (const width of [320, 375, 768, 1240, 1280, 1300, 1400]) {
  test(`language switcher opens within the viewport at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 })
    await page.goto('/pt-br/')
    const trigger = page.locator('[data-language-switcher]').getByRole('button')
    await openLanguageMenu(page)
    const box = await page.locator(MENU).boundingBox()
    expect(box).not.toBeNull()
    expect(box!.x).toBeGreaterThanOrEqual(0)
    expect(box!.x + box!.width).toBeLessThanOrEqual(width)
    const triggerBox = (await trigger.boundingBox())!
    expect(
      Math.abs(box!.x + box!.width - (triggerBox.x + triggerBox.width)),
    ).toBeLessThanOrEqual(1)
    expect(box!.y).toBeGreaterThanOrEqual(triggerBox.y + triggerBox.height)
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
  test(`footer is present on ${path}`, async ({ page }) => {
    await page.goto(path)
    await expect(page.locator('footer [data-footer-languages] a')).toHaveCount(
      LOCALES.length,
    )
  })

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

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('footer links reach every locale', async ({ page }) => {
    await page.goto('/')
    const links = page.locator('footer [data-footer-languages] a')
    await expect(links).toHaveCount(LOCALES.length)
    await page
      .locator('footer [data-footer-languages]')
      .getByRole('link', { name: 'Deutsch' })
      .click()
    await expect(page).toHaveURL(/\/de\/$/)
  })
})

for (const path of ['/privacy/', '/404/']) {
  test(`${path} marks no language link as current`, async ({ page }) => {
    await page.goto(path)
    await expect(page.locator('a[aria-current]')).toHaveCount(0)
  })
}

test('localized pages mark only the active footer locale as current', async ({
  page,
}) => {
  await page.goto('/de/')
  const current = page.locator('footer [data-footer-languages] a[aria-current]')
  await expect(current).toHaveCount(1)
  await expect(current).toHaveText('Deutsch')
})
