import { expect, test } from '@playwright/test'

import { hydratedFaq } from './faq-helpers'

test('video poster overlay carries video-play, never the link itself', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.locator('[data-video-play-overlay]')).toHaveAttribute(
    'data-umami-event',
    'video-play',
  )
  await expect(page.locator('[data-video-poster]')).not.toHaveAttribute(
    'data-umami-event',
    /.*/,
  )
})

test('every FAQ trigger carries faq-open with a stable key', async ({
  page,
}) => {
  await page.goto('/')
  const faq = await hydratedFaq(page)
  const triggers = faq.getByRole('button')
  const count = await triggers.count()
  expect(count).toBeGreaterThan(0)
  const keys: (string | null)[] = []
  for (let index = 0; index < count; index += 1) {
    const trigger = triggers.nth(index)
    await expect(trigger).toHaveAttribute('data-umami-event', 'faq-open')
    keys.push(await trigger.getAttribute('data-umami-event-question'))
  }
  for (const key of keys) expect(key).toMatch(/^[a-z][A-Za-z0-9-]*$/)
  expect(new Set(keys).size).toBe(count)
})

test('language options carry language-change with the locale code', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.locator('header astro-island').first()).not.toHaveAttribute(
    'ssr',
    '',
  )
  await page.locator('[data-language-switcher] button').click()
  const options = page.locator('[data-language-menu] a')
  const count = await options.count()
  expect(count).toBeGreaterThan(1)
  for (let index = 0; index < count; index += 1) {
    const option = options.nth(index)
    await expect(option).toHaveAttribute('data-umami-event', 'language-change')
    expect(await option.getAttribute('data-umami-event-locale')).toMatch(
      /^[a-z]{2}([_-][A-Za-z]+)?$/,
    )
  }
})

test('theme options carry theme-change with the theme', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('header astro-island').first()).not.toHaveAttribute(
    'ssr',
    '',
  )
  await page.locator('[data-theme-menu] button').click()
  const items = page.getByRole('menuitemradio')
  await expect(items).toHaveCount(3)
  const themes = ['system', 'light', 'dark']
  for (const [index, theme] of themes.entries()) {
    const item = items.nth(index)
    await expect(item).toHaveAttribute('data-umami-event', 'theme-change')
    await expect(item).toHaveAttribute('data-umami-event-theme', theme)
  }
})
