import { expect, test } from '@playwright/test'

const PAGE = '/how-to/back-up-chrome-bookmarks/'

test('no header script chunk is requested before interaction', async ({
  page,
}) => {
  const scripts: string[] = []
  page.on('request', (request) => {
    if (request.resourceType() === 'script') scripts.push(request.url())
  })
  await page.goto(PAGE, { waitUntil: 'networkidle' })
  expect(scripts.filter((url) => url.includes('/_astro/'))).toEqual([])
})

test('the first click opens the theme menu', async ({ page }) => {
  await page.goto(PAGE)
  await page.getByRole('button', { name: 'Theme' }).click()
  await expect(page.getByRole('menu')).toBeVisible()
})

test('the first click opens the language menu', async ({ page }) => {
  await page.goto(PAGE)
  await page.locator('[data-language-switcher]').getByRole('button').click()
  await expect(page.locator('[data-language-menu]')).toBeVisible()
})

test('keyboard focus then Enter opens the theme menu', async ({ page }) => {
  await page.goto(PAGE)
  await page.getByRole('button', { name: 'Theme' }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('menu')).toBeVisible()
})

for (const stored of ['light', 'dark'] as const) {
  test(`a stored ${stored} theme rewrites both theme-color metas`, async ({
    page,
  }) => {
    await page.emulateMedia({
      colorScheme: stored === 'dark' ? 'light' : 'dark',
    })
    await page.addInitScript(
      (value) => localStorage.setItem('snug:theme', value),
      stored,
    )
    await page.goto('/')
    const expected = stored === 'dark' ? '#17120a' : '#f1ece4'
    const colors = await page
      .locator('meta[name="theme-color"]')
      .evaluateAll((metas) => metas.map((meta) => meta.getAttribute('content')))
    expect(colors).toEqual([expected, expected])
  })
}

test('choosing System restores the media-specific theme-color metas', async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem('snug:theme', 'dark'))
  await page.goto('/')
  await page.getByRole('button', { name: 'Theme' }).click()
  await page.getByRole('menuitemradio', { name: 'System' }).click()
  const colors = await page
    .locator('meta[name="theme-color"]')
    .evaluateAll((metas) => metas.map((meta) => meta.getAttribute('content')))
  expect(colors).toEqual(['#f1ece4', '#17120a'])
})

test('the Guide has a single banner landmark', async ({ page }) => {
  await page.goto('/guide/')
  await expect(page.getByRole('banner')).toHaveCount(1)
})
