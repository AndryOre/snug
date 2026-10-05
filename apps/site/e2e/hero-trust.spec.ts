import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { localePath, LOCALES } from '../src/i18n/locales'

const SCHEMES = ['light', 'dark'] as const

const PATHS = LOCALES.map((locale) => localePath(locale))

for (const path of PATHS) {
  test(`${path} renders hero, trust proof and tagged install actions`, async ({
    page,
  }) => {
    const origins = new Set<string>()
    page.on('request', (request) => {
      const url = new URL(request.url())
      if (url.protocol.startsWith('http')) origins.add(url.origin)
    })

    await page.goto(path)
    await page.waitForLoadState('networkidle')

    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('[data-section="hero"]')).toBeVisible()
    await expect(page.locator('[data-section="trust"]')).toBeVisible()
    await expect(page.locator('[data-section="trust"] ol > li')).toHaveCount(3)
    await expect(page.locator('[data-section="trust"] ul a')).toHaveCount(5)

    await expect(page.locator('a[data-install="hero"]')).toHaveAttribute(
      'href',
      '/install?c=hero',
    )
    await expect(page.locator('a[data-install="trust"]')).toHaveAttribute(
      'href',
      '/install?c=trust',
    )
    const storeLinks = await page
      .locator('a[href*="chromewebstore.google.com"]:not([data-reviews-link])')
      .count()
    expect(storeLinks).toBe(0)

    expect([...origins]).toEqual(['http://localhost:4399'])
  })
}

test('install button shows a visible keyboard focus ring', async ({ page }) => {
  await page.goto('/')
  const install = page.locator('a[data-install="hero"]')
  await install.focus()
  await page.keyboard.press('Shift+Tab')
  await page.keyboard.press('Tab')
  await expect(install).toBeFocused()
  const boxShadow = await install.evaluate(
    (element) => getComputedStyle(element).boxShadow,
  )
  expect(boxShadow).not.toBe('none')
})

for (const colorScheme of SCHEMES) {
  test(`the root color-scheme follows a ${colorScheme} system`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme })
    await page.goto('/')
    await expect(page.locator('html')).toHaveCSS('color-scheme', colorScheme)
  })
}

test('works without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('/')
  await expect(page.locator('a[data-install="hero"]')).toBeVisible()
  await expect(page.locator('[data-section="trust"]')).toBeVisible()
  await context.close()
})

test.describe('hero journey diagram', () => {
  for (const path of PATHS) {
    test(`${path} shows the journey and the network line`, async ({ page }) => {
      await page.goto(path)
      const figure = page.locator('[data-section="hero"] figure')
      await expect(figure).toBeVisible()
      await expect(figure.locator('[data-slot="card"]')).toHaveCount(3)
      await expect(figure.locator('[data-slot="badge"]')).toHaveCount(6)
      await expect(figure.locator('[data-journey="network"]')).toBeVisible()
      await expect(figure.locator('[translate="no"]').first()).toBeVisible()
    })
  }

  test('cards share one row at 1280 and stack at 375', async ({ page }) => {
    const cardBoxes = async () =>
      page
        .locator('[data-section="hero"] figure [data-slot="card"]')
        .evaluateAll((cards) =>
          cards.map((card) => {
            const { x, y, width, height } = card.getBoundingClientRect()
            return { x, y, width, height }
          }),
        )

    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/')
    const row = await cardBoxes()
    expect(row).toHaveLength(3)
    expect(Math.abs(row[0]!.y - row[1]!.y)).toBeLessThan(2)
    expect(Math.abs(row[1]!.y - row[2]!.y)).toBeLessThan(2)
    expect(row[1]!.x).toBeGreaterThan(row[0]!.x + row[0]!.width)

    await page.setViewportSize({ width: 375, height: 800 })
    const stack = await cardBoxes()
    expect(stack[1]!.y).toBeGreaterThan(stack[0]!.y + stack[0]!.height)
    expect(stack[2]!.y).toBeGreaterThan(stack[1]!.y + stack[1]!.height)
  })

  for (const path of ['/de/', '/ru/']) {
    test(`${path} journey does not overflow at 320`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 700 })
      await page.goto(path)
      const overflowing = await page
        .locator('[data-section="hero"] figure')
        .evaluate((figure, limit) => {
          return [figure, ...figure.querySelectorAll('*')]
            .filter((element) => {
              const { left, right } = element.getBoundingClientRect()
              return left < -1 || right > limit + 1
            })
            .map((element) => element.tagName)
        }, 320)
      expect(overflowing).toEqual([])
      const scrollWidth = await page.evaluate(
        () => globalThis.document.documentElement.scrollWidth,
      )
      expect(scrollWidth).toBeLessThanOrEqual(320)
    })
  }

  test('the figure has an accessible description of the flow', async ({
    page,
  }) => {
    await page.goto('/')
    const figure = page.locator('[data-section="hero"] figure')
    await expect(figure).toHaveAttribute('aria-labelledby', /.+/)
    const descriptionId = await figure.getAttribute('aria-describedby')
    expect(descriptionId).toBeTruthy()
    await expect(page.locator(`#${descriptionId}`)).toContainText(
      'bookmarks.html',
    )
    await expect(
      figure.locator('svg[aria-hidden="true"]').first(),
    ).toBeAttached()
  })

  for (const colorScheme of SCHEMES) {
    test(`the journey passes axe in ${colorScheme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme })
      await page.goto('/')
      const { violations } = await new AxeBuilder({ page })
        .include('[data-section="hero"] figure')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
      expect(violations).toEqual([])
    })
  }
})
