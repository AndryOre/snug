import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'

import { MIN_TOUCH_TARGET } from './layout-helpers'

const WIDTHS = [320, 375, 768, 1280]

async function visit(page: Page, path = '/') {
  await page.goto(path)
  await expect(page.locator('header astro-island')).not.toHaveAttribute(
    'ssr',
    '',
  )
}

async function openMenu(page: Page) {
  const trigger = page.getByRole('button', { name: 'Theme' })
  await expect(trigger).toBeVisible()
  await trigger.click()
  await expect(page.getByRole('menu')).toBeVisible()
  return trigger
}

test('keyboard opens, moves, selects and returns focus on Escape', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await visit(page)
  const trigger = page.getByRole('button', { name: 'Theme' })
  await expect(trigger).toBeVisible()
  await trigger.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('menu')).toBeVisible()
  await expect(
    page.getByRole('menuitemradio', { name: 'System' }),
  ).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  await expect(page.getByRole('menuitemradio', { name: 'Dark' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('html')).toHaveClass(/\bdark\b/)
  await expect(page.getByRole('menu')).toBeHidden()

  await page.keyboard.press('Space')
  await expect(page.getByRole('menu')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('menu')).toBeHidden()
  await expect(trigger).toBeFocused()
})

test('the choice persists across a reload', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await visit(page)
  await openMenu(page)
  await page.getByRole('menuitemradio', { name: 'Light' }).click()
  await expect(page.locator('html')).not.toHaveClass(/\bdark\b/)
  expect(
    await page.evaluate(() => globalThis.localStorage.getItem('snug:theme')),
  ).toBe('light')

  await page.reload()
  await expect(page.locator('html')).not.toHaveClass(/\bdark\b/)
  await openMenu(page)
  await expect(page.getByRole('menuitemradio', { name: 'Light' })).toBeChecked()
})

test('System follows operating system changes', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await visit(page)
  await openMenu(page)
  await page.getByRole('menuitemradio', { name: 'System' }).click()
  await expect(page.locator('html')).not.toHaveClass(/\bdark\b/)

  await page.emulateMedia({ colorScheme: 'dark' })
  await expect(page.locator('html')).toHaveClass(/\bdark\b/)
  await page.emulateMedia({ colorScheme: 'light' })
  await expect(page.locator('html')).not.toHaveClass(/\bdark\b/)
})

test('an explicit choice ignores operating system changes', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await visit(page)
  await openMenu(page)
  await page.getByRole('menuitemradio', { name: 'Light' }).click()
  await page.emulateMedia({ colorScheme: 'dark' })
  await expect(page.locator('html')).not.toHaveClass(/\bdark\b/)
})

for (const width of WIDTHS) {
  test(`menu items are 44px tall and the panel fits at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 })
    await visit(page)
    await openMenu(page)
    const items = page.getByRole('menuitemradio')
    await expect(items).toHaveCount(3)
    for (let index = 0; index < 3; index++) {
      await expect
        .poll(async () => (await items.nth(index).boundingBox())!.height)
        .toBeGreaterThanOrEqual(MIN_TOUCH_TARGET)
    }
    const panel = await page.getByRole('menu').boundingBox()
    expect(panel!.x).toBeGreaterThanOrEqual(0)
    expect(panel!.x + panel!.width).toBeLessThanOrEqual(width)
    expect(panel!.width).toBeGreaterThanOrEqual(176)
    expect(panel!.width).toBeLessThanOrEqual(200)
  })
}

test('the trigger is a 44px square', async ({ page }) => {
  await visit(page)
  const box = await page.getByRole('button', { name: 'Theme' }).boundingBox()
  expect(box!.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET)
  expect(box!.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET)
})

for (const path of ['/de/', '/ru/']) {
  test(`header stays on one row at 320px on ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 })
    await visit(page, path)
    const header = page.locator('header')
    await expect(header.locator('[data-theme-menu]')).toBeVisible()
    const brand = await header.locator('a[aria-label]').boundingBox()
    const theme = await header.locator('[data-theme-menu]').boundingBox()
    const language = await header
      .locator('[data-language-switcher]')
      .boundingBox()
    for (const box of [theme!, language!]) {
      expect(box.y).toBeLessThan(brand!.y + brand!.height)
      expect(brand!.y).toBeLessThan(box.y + box.height)
      expect(box.x + box.width).toBeLessThanOrEqual(320)
    }
    expect(brand!.x + brand!.width).toBeLessThanOrEqual(theme!.x)
    expect(theme!.x + theme!.width).toBeLessThanOrEqual(language!.x + 1)
    expect((await header.boundingBox())!.height).toBeLessThanOrEqual(64)
  })
}

for (const colorScheme of ['light', 'dark'] as const) {
  test(`axe passes with the menu open in ${colorScheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme })
    await visit(page)
    await openMenu(page)
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    expect(violations).toEqual([])
  })
}

test('the theme menu is hidden without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('http://localhost:4399/')
  await expect(page.locator('[data-theme-menu]')).toBeHidden()
  await context.close()
})

test('a theme switch runs no colour transition on the frame it flips', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await visit(page)
  await page.evaluate(() => {
    const samples: string[] = []
    const targets = [
      globalThis.document.querySelector('a[data-install]'),
      globalThis.document.querySelector('[data-slot="accordion-trigger"]'),
    ]
    // eslint-disable-next-line unicorn/isolated-functions -- runs in the browser, where MutationObserver exists
    new MutationObserver(() => {
      if (!globalThis.document.documentElement.matches('.theme-switching')) {
        return
      }
      for (const target of targets) {
        if (target) {
          samples.push(globalThis.getComputedStyle(target).transitionProperty)
        }
      }
    }).observe(globalThis.document.documentElement, {
      attributeFilter: ['class'],
    })
    Object.assign(globalThis, { transitionSamples: samples })
  })
  await openMenu(page)
  await page.getByRole('menuitemradio', { name: 'Dark' }).click()
  await expect(page.locator('html')).toHaveClass(/\bdark\b/)
  const samples = await page.evaluate(
    () =>
      (globalThis as unknown as { transitionSamples: string[] })
        .transitionSamples,
  )
  expect(samples.length).toBeGreaterThan(1)
  for (const sample of samples) expect(sample).toBe('none')
  await expect(page.locator('html')).not.toHaveClass(/theme-switching/)
})
