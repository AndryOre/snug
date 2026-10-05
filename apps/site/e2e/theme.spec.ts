import { expect, test } from '@playwright/test'

const SCHEMES = ['light', 'dark'] as const

for (const colorScheme of SCHEMES) {
  test(`a ${colorScheme} system sets the dark class accordingly`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme })
    await page.goto('/')
    const html = page.locator('html')
    await expect(html).toHaveClass(/\bjs\b/)
    if (colorScheme === 'dark') await expect(html).toHaveClass(/\bdark\b/)
    else await expect(html).not.toHaveClass(/\bdark\b/)
  })
}

test('a stored light theme beats a dark system', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.addInitScript(() => localStorage.setItem('snug:theme', 'light'))
  await page.goto('/')
  await expect(page.locator('html')).not.toHaveClass(/\bdark\b/)
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'light')
})

test('a stored dark theme beats a light system', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.addInitScript(() => localStorage.setItem('snug:theme', 'dark'))
  await page.goto('/')
  await expect(page.locator('html')).toHaveClass(/\bdark\b/)
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark')
})

test('an invalid stored theme falls back to the system', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.addInitScript(() => localStorage.setItem('snug:theme', 'blue'))
  await page.goto('/')
  await expect(page.locator('html')).toHaveClass(/\bdark\b/)
})

test('the theme class is set before first paint', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => {
      Object.assign(globalThis, {
        darkAtDomContentLoaded:
          document.documentElement.classList.contains('dark'),
      })
    })
  })
  await page.goto('/')
  const darkAtDomContentLoaded = await page.evaluate(
    () =>
      (globalThis as { darkAtDomContentLoaded?: boolean })
        .darkAtDomContentLoaded,
  )
  expect(darkAtDomContentLoaded).toBe(true)
})

test('without JavaScript the metas let the system decide', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    colorScheme: 'dark',
  })
  const page = await context.newPage()
  await page.goto('/')
  await expect(page.locator('html')).not.toHaveClass(/\bjs\b/)
  await expect(page.locator('html')).not.toHaveClass(/\bdark\b/)
  await expect(page.locator('meta[name="color-scheme"]')).toHaveAttribute(
    'content',
    'light dark',
  )
  await expect(page.locator('meta[name="theme-color"]')).toHaveCount(2)
  await context.close()
})
