import { expect, test } from '@playwright/test'

interface ViolationWindow {
  cspViolations: string[]
}

test('the promo video iframe loads under the production CSP', async ({
  page,
}) => {
  await page.route('https://www.youtube-nocookie.com/**', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><title>mock player</title>',
    }),
  )
  await page.addInitScript(() => {
    const target = globalThis as unknown as ViolationWindow
    target.cspViolations = []
    document.addEventListener('securitypolicyviolation', (event) => {
      target.cspViolations.push(
        `${event.violatedDirective} ${event.blockedURI}`,
      )
    })
  })

  await page.goto('/')
  await page.locator('[data-video-poster]').click()

  const frame = page.locator('iframe[data-video-player]')
  await expect(frame).toBeVisible()
  await expect(frame).toHaveAttribute(
    'src',
    /^https:\/\/www\.youtube-nocookie\.com\/embed\//,
  )
  await expect(
    page.frameLocator('iframe[data-video-player]').locator('title'),
  ).toHaveText('mock player')

  const violations = await page.evaluate(
    () => (globalThis as unknown as ViolationWindow).cspViolations,
  )
  expect(violations).toEqual([])
})

test('/de redirects with a 301 to /de/', async ({ request }) => {
  const response = await request.get('/de', { maxRedirects: 0 })
  expect(response.status()).toBe(301)
  expect(response.headers()['location']).toBe('/de/')
})
