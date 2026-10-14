import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'

const FORMATS = ['html', 'json', 'csv', 'markdown', 'opml', 'xbel'] as const

async function hydratedPlayground(page: Page) {
  const section = page.locator('[data-section="playground"]')
  await section.scrollIntoViewIfNeeded()
  await expect(section.locator('astro-island')).not.toHaveAttribute('ssr', '')
  await page.waitForFunction(() => {
    const tab = globalThis.document.querySelector(
      '[data-section="playground"] [role="tab"]',
    )
    return (
      tab !== null &&
      Object.keys(tab).some((key) => key.startsWith('__reactProps$'))
    )
  })
  return section
}

test('renders six tabs with every pane in the DOM and only HTML visible', async ({
  page,
}) => {
  await page.goto('/')
  const section = page.locator('[data-section="playground"]')
  await expect(section.getByRole('tab')).toHaveCount(6)
  for (const format of FORMATS) {
    await expect(
      section.locator(`[data-playground-pane="${format}"]`),
    ).toHaveCount(1)
  }
  await expect(section.locator('[data-playground-pane="html"]')).toBeVisible()
  await expect(section.locator('[data-playground-pane="json"]')).toBeHidden()
})

test('pointer and keyboard switch the visible pane', async ({ page }) => {
  await page.goto('/')
  const section = await hydratedPlayground(page)
  const tabs = section.getByRole('tab')

  await tabs.nth(1).click()
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true')
  await expect(section.locator('[data-playground-pane="json"]')).toBeVisible()
  await expect(section.locator('[data-playground-pane="html"]')).toBeHidden()

  await page.keyboard.press('ArrowRight')
  await expect(tabs.nth(2)).toHaveAttribute('aria-selected', 'true')
  await expect(section.locator('[data-playground-pane="csv"]')).toBeVisible()

  await page.keyboard.press('End')
  await expect(tabs.nth(5)).toHaveAttribute('aria-selected', 'true')
  await expect(section.locator('[data-playground-pane="xbel"]')).toBeVisible()

  await page.keyboard.press('Home')
  await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true')
  await expect(section.locator('[data-playground-pane="html"]')).toBeVisible()
})

test('switching keeps the box height fixed', async ({ page }) => {
  await page.goto('/')
  const section = await hydratedPlayground(page)
  const box = section.locator('[data-playground-panes]')
  const before = await box.boundingBox()
  await section.getByRole('tab').nth(1).click()
  await expect(section.locator('[data-playground-pane="json"]')).toBeVisible()
  const after = await box.boundingBox()
  expect(after?.height).toBe(before?.height)
})

test('tabs carry a locale-independent umami event', async ({ page }) => {
  await page.goto('/')
  const tabs = page.locator('[data-section="playground"]').getByRole('tab')
  for (const [index, format] of FORMATS.entries()) {
    const tab = tabs.nth(index)
    await expect(tab).toHaveAttribute('data-umami-event', 'playground-format')
    await expect(tab).toHaveAttribute('data-umami-event-format', format)
  }
})

test('the playground has no axe violations', async ({ page }) => {
  await page.goto('/')
  await hydratedPlayground(page)
  const results = await new AxeBuilder({ page })
    .include('[data-section="playground"]')
    .analyze()
  expect(results.violations).toEqual([])
})
