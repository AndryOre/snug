import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'

import { localePath, LOCALES } from '../src/i18n/locales'
import { firstFaqTrigger } from './faq-helpers'

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

const PAGES = [...LOCALES.map((locale) => localePath(locale)), '/privacy/']

const AXE_PAGES = [...PAGES, '/guide/']

async function expectNoViolations(page: Page): Promise<void> {
  const { violations } = await new AxeBuilder({ page })
    .withTags(AXE_TAGS)
    .analyze()
  expect(violations).toEqual([])
}

const SCHEMES = ['light', 'dark'] as const

for (const colorScheme of SCHEMES) {
  for (const path of AXE_PAGES) {
    test(`${path} has no accessibility violations in ${colorScheme}`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme })
      await page.goto(path)
      await expectNoViolations(page)
    })
  }
}

test('/privacy/ has no accessibility violations at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 })
  await page.goto('/privacy/')
  await expectNoViolations(page)
})

test('/guide/ has no accessibility violations at 320px and 768px', async ({
  page,
}) => {
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: 800 })
    await page.goto('/guide/')
    await expectNoViolations(page)
  }
})

test('/privacy/ inline links are underlined with visible contrast', async ({
  page,
}) => {
  await page.goto('/privacy/')
  const link = page.locator('[data-section="policy"] a').first()
  const style = await link.evaluate((element) => {
    const computed = globalThis.getComputedStyle(element)
    return {
      line: computed.textDecorationLine,
      color: computed.textDecorationColor,
      text: computed.color,
      thickness: Number(computed.textDecorationThickness.replace('px', '')),
    }
  })
  expect(style.line).toBe('underline')
  expect(style.color).toBe(style.text)
  expect(style.thickness).toBeGreaterThanOrEqual(1)
})

for (const colorScheme of SCHEMES) {
  test(`the 404 page has no accessibility violations in ${colorScheme}`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme })
    const response = await page.goto('/nope')
    expect(response?.status()).toBe(404)
    await expectNoViolations(page)
  })
}

for (const path of PAGES) {
  test(`${path} has one h1 and no skipped heading levels`, async ({ page }) => {
    await page.goto(path)
    const levels = await page
      .locator('h1, h2, h3, h4, h5, h6')
      .evaluateAll((headings) =>
        headings.map((heading) => Number(heading.tagName.slice(1))),
      )
    expect(levels.filter((level) => level === 1)).toHaveLength(1)
    expect(levels[0]).toBe(1)
    for (const [index, level] of levels.entries()) {
      if (index > 0) expect(level - levels[index - 1]!).toBeLessThanOrEqual(1)
    }
  })
}

test.describe('opened states', () => {
  test('FAQ open has no accessibility violations', async ({ page }) => {
    await page.goto('/')
    const first = await firstFaqTrigger(page)
    await first.click()
    await expect(first).toHaveAttribute('aria-expanded', 'true')
    await expectNoViolations(page)
  })

  test('FAQ open has no accessibility violations at 320px', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    await page.goto('/')
    const first = await firstFaqTrigger(page)
    await first.click()
    await expect(first).toHaveAttribute('aria-expanded', 'true')
    await expectNoViolations(page)
  })

  test('language switcher open has no accessibility violations', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(
      page.locator('astro-island[client="idle"]'),
    ).not.toHaveAttribute('ssr', '')
    await page.locator('[data-language-switcher]').getByRole('button').click()
    await expect(page.locator('[data-language-menu]')).toBeVisible()
    await expectNoViolations(page)
  })

  test('activated video has no accessibility violations', async ({ page }) => {
    await page.route('https://www.youtube-nocookie.com/**', (route) =>
      route.fulfill({
        contentType: 'text/html',
        body: '<!doctype html><title>mock player</title>',
      }),
    )
    await page.goto('/')
    const poster = page.locator('[data-video-poster]')
    await poster.scrollIntoViewIfNeeded()
    await expect(
      page.locator('astro-island:has([data-video-poster])'),
    ).not.toHaveAttribute('ssr', '')
    await poster.click()
    await expect(page.locator('iframe[data-video-player]')).toBeVisible()
    await expectNoViolations(page)
  })
})
