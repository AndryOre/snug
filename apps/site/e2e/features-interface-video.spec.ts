import { expect, test } from '@playwright/test'

const PATHS = [
  '/',
  '/es/',
  '/de/',
  '/fr/',
  '/it/',
  '/ja/',
  '/ko/',
  '/pt-br/',
  '/ru/',
  '/zh-cn/',
]

const ORIGIN = 'http://localhost:4399'

for (const path of PATHS) {
  test(`${path} renders features, interface and video sections`, async ({
    page,
  }) => {
    const origins = new Set<string>()
    page.on('request', (request) => {
      const url = new URL(request.url())
      if (url.protocol.startsWith('http')) origins.add(url.origin)
    })

    await page.goto(path)
    await page.waitForLoadState('networkidle')

    await expect(page.locator('[data-section="features"] ol > li')).toHaveCount(
      6,
    )

    const figures = page.locator('[data-section="interface"] figure')
    await expect(figures).toHaveCount(4)
    const images = page.locator('[data-section="interface"] img')
    for (let index = 0; index < 4; index++) {
      const image = images.nth(index)
      await expect(image).toHaveAttribute('loading', 'lazy')
      await expect(image).toHaveAttribute('width', '1280')
      await expect(image).toHaveAttribute('height', '800')
      const alt = await image.getAttribute('alt')
      expect(alt?.length).toBeGreaterThan(10)
    }

    await expect(page.locator('[data-video-poster]')).toHaveCount(1)
    await expect(page.locator('iframe')).toHaveCount(0)
    expect([...origins]).toEqual([ORIGIN])
  })
}

test('video loads YouTube only after keyboard activation', async ({ page }) => {
  const thirdParty: string[] = []
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (url.protocol.startsWith('http') && url.origin !== ORIGIN) {
      thirdParty.push(url.origin)
    }
  })
  await page.route(/youtube/, (route) =>
    route.fulfill({ contentType: 'text/html', body: '<p>player</p>' }),
  )

  await page.goto('/')
  await page.waitForLoadState('networkidle')
  expect(thirdParty).toEqual([])

  const poster = page.locator('[data-video-poster]')
  await poster.scrollIntoViewIfNeeded()
  await poster.focus()
  await expect(poster).toBeFocused()
  await page.keyboard.press('Enter')

  const player = page.locator('iframe[data-video-player]')
  await expect(player).toBeVisible()
  await expect(player).toHaveAttribute(
    'src',
    /^https:\/\/www\.youtube-nocookie\.com\/embed\/2F3DndQFCLY/,
  )
  await expect.poll(() => thirdParty.length).toBeGreaterThan(0)
  expect(new Set(thirdParty)).toEqual(
    new Set(['https://www.youtube-nocookie.com']),
  )
})

test('without JavaScript the poster links to the watch page', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('/')
  await expect(page.locator('[data-video-poster]')).toHaveAttribute(
    'href',
    'https://www.youtube.com/watch?v=2F3DndQFCLY',
  )
  await context.close()
})
