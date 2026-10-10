import { expect, test } from '@playwright/test'

import { localePath, LOCALES } from '../src/i18n/locales'
import { translatedTitle } from './translated-guide'

for (const locale of LOCALES) {
  const guidePath = localePath(locale, '/guide/')
  test(`${guidePath} renders with the site header and footer`, async ({
    page,
  }) => {
    const response = await page.goto(guidePath)
    expect(response?.status()).toBe(200)
    await expect(page.locator('[data-section="header"]')).toHaveCount(1)
    await expect(page.locator('[data-section="footer"]')).toHaveCount(1)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      translatedTitle(locale, 'docs/usage.md') ?? 'Usage',
    )
  })
}

test('the Guide offers the edit link on English pages only', async ({
  page,
}) => {
  await page.goto('/guide/')
  await expect(
    page.getByRole('link', { name: 'Edit this page on GitHub' }),
  ).toBeVisible()
  await page.goto('/es/guide/')
  await expect(
    page.getByRole('link', { name: 'Edit this page on GitHub' }),
  ).toHaveCount(0)
})

test('the Guide keeps its own language in the header switcher', async ({
  page,
}) => {
  await page.goto('/es/guide/')
  await expect(page.locator('html')).toHaveAttribute('lang', 'es')
  await expect(
    page.locator('[data-footer-languages] a[hreflang="de"]'),
  ).toHaveAttribute('href', '/de/guide/')
})

test('the Guide follows the stored theme', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.addInitScript(() => localStorage.setItem('snug:theme', 'dark'))
  await page.goto('/guide/')
  await expect(page.locator('html')).toHaveClass(/\bdark\b/)
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark')
})

test('the Guide loads without console errors or third-party requests', async ({
  page,
}) => {
  const siteHost = new URL(String(test.info().project.use.baseURL)).host
  const problems: string[] = []
  const foreign: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') problems.push(message.text())
  })
  page.on('pageerror', (error) => {
    problems.push(error.message)
  })
  page.on('request', (request) => {
    const { protocol, host } = new URL(request.url())
    if (host !== siteHost && protocol.startsWith('http')) {
      foreign.push(request.url())
    }
  })
  await page.goto('/guide/')
  await page.waitForLoadState('networkidle')
  expect(problems).toEqual([])
  expect(foreign).toEqual([])
})

test('the mobile drawer traps focus, closes with Escape and returns focus', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 800 })
  await page.goto('/guide/')
  const toggle = page.getByRole('button', { name: 'Guide' })
  await toggle.click()
  const drawer = page.locator('#starlight__sidebar')
  await expect(drawer).toBeVisible()
  await expect(drawer.getByRole('link').first()).toBeFocused()
  await expect(page.locator('.main-frame')).toHaveAttribute('inert', '')
  await page.keyboard.press('Escape')
  await expect(drawer).toBeHidden()
  await expect(toggle).toBeFocused()
  await expect(page.locator('.main-frame')).not.toHaveAttribute('inert', '')
})

test('the search button opens the dialog with Ctrl K and closes with Escape', async ({
  page,
}) => {
  await page.goto('/guide/')
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeHidden()
  await expect(page.locator('dialog input')).toBeAttached()
  await page.keyboard.press('Control+k')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('textbox')).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})
