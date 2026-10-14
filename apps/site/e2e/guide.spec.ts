import { expect, test } from '@playwright/test'

import { HOW_TO_PAGES } from '../src/content/how-to-pages'
import { localePath, LOCALES } from '../src/i18n/locales'
import { howToLocales } from './how-to-paths'
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

test('the mobile drawer closes by keyboard through its close button and by backdrop', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 800 })
  await page.goto('/guide/')
  const toggle = page.getByRole('button', { name: 'Guide' })
  const drawer = page.locator('#starlight__sidebar')
  await toggle.focus()
  await page.keyboard.press('Enter')
  await expect(drawer).toBeVisible()
  const close = drawer.getByRole('button', { name: 'Close menu' })
  await expect(close).toBeVisible()
  await close.focus()
  await page.keyboard.press('Enter')
  await expect(drawer).toBeHidden()
  await expect(toggle).toBeFocused()
  await toggle.click()
  await expect(drawer).toBeVisible()
  await page.mouse.click(385, 400)
  await expect(drawer).toBeHidden()
})

test('the Guide close button is localized', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 })
  await page.goto('/es/guide/')
  await page.locator('[data-docs-menu-toggle]').click()
  await expect(
    page.locator('#starlight__sidebar').getByRole('button', {
      name: 'Cerrar menú',
    }),
  ).toBeVisible()
})

test('the Guide language links keep the reader on the same page', async ({
  page,
}) => {
  await page.goto('/guide/exporting/')
  await expect(
    page.locator('[data-footer-languages] a[hreflang="es"]'),
  ).toHaveAttribute('href', '/es/guide/exporting/')
  await page.goto('/changelog/')
  await expect(
    page.locator('[data-footer-languages] a[hreflang="es"]'),
  ).toHaveAttribute('href', '/es/changelog/')
})

test('the Guide heading order starts at the page title', async ({ page }) => {
  await page.goto('/guide/')
  const levels = await page
    .locator('h1, h2, h3, h4, h5, h6')
    .evaluateAll((headings) =>
      headings.map((heading) => Number(heading.tagName.slice(1))),
    )
  expect(levels[0]).toBe(1)
})

test('the Guide keeps data-theme in step with the stored theme', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.addInitScript(() => localStorage.setItem('snug:theme', 'dark'))
  await page.goto('/guide/')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
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

const GUIDE_ROUTES = [
  'guide',
  'guide/exporting',
  'guide/importing',
  'guide/duplicates',
  'guide/settings',
  'guide/auto-export',
  'guide/faq',
  'changelog',
]

for (const locale of LOCALES) {
  for (const route of GUIDE_ROUTES) {
    const slugs = Object.entries(HOW_TO_PAGES)
      .filter(([, page]) => page.relatedGuide.includes(route))
      .map(([slug]) => slug)
    const expectation =
      slugs.length > 0
        ? 'links its related How-to pages'
        : 'has no Related how-to block'
    test(`${locale} /${route}/ ${expectation}`, async ({ page, request }) => {
      await page.goto(localePath(locale, `/${route}/`))
      const block = page.locator('[data-section="related-how-to"]')
      if (slugs.length === 0) {
        await expect(block).toHaveCount(0)
        return
      }
      const links = block.locator('a')
      await expect(links).toHaveCount(slugs.length)
      for (const [index, slug] of slugs.entries()) {
        const target = howToLocales(slug).includes(locale)
          ? localePath(locale, `/how-to/${slug}/`)
          : `/how-to/${slug}/`
        await expect(links.nth(index)).toHaveAttribute('href', target)
        const box = await links.nth(index).boundingBox()
        expect(box?.height).toBeGreaterThanOrEqual(44)
        const response = await request.get(target)
        expect(response.status()).toBe(200)
      }
    })
  }
}
