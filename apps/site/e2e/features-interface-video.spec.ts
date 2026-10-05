import { expect, test } from '@playwright/test'

import { localePath, LOCALES } from '../src/i18n/locales'

const PATHS = LOCALES.map((locale) => localePath(locale))

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
      const caption = await figures.nth(index).locator('figcaption').innerText()
      expect(alt).not.toBe(caption)
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
  await expect(
    page.locator('astro-island:has([data-video-poster])'),
  ).not.toHaveAttribute('ssr', '')
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

test('poster serves a smaller file on phones', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 })
  await page.goto('/')
  const poster = page.locator('[data-video-poster] img')
  await poster.scrollIntoViewIfNeeded()
  await expect(poster).toHaveJSProperty('complete', true)
  const { current, smallest } = await poster.evaluate(
    (image: HTMLImageElement) => ({
      current: image.currentSrc,
      smallest: new URL(
        image.srcset.split(',', 1)[0]!.trim().split(' ', 1)[0]!,
        image.baseURI,
      ).href,
    }),
  )
  expect(current).toBe(smallest)
})

test('modified click on the poster does not swap in the player', async ({
  page,
}) => {
  await page.goto('/')
  const poster = page.locator('[data-video-poster]')
  await poster.scrollIntoViewIfNeeded()
  await expect(
    page.locator('astro-island:has([data-video-poster])'),
  ).not.toHaveAttribute('ssr', '')
  await page.route(/youtube/, (route) =>
    route.fulfill({ contentType: 'text/html', body: '<p>watch</p>' }),
  )
  const popup = page.context().waitForEvent('page')
  await poster.click({ modifiers: ['ControlOrMeta'] })
  const opened = await popup
  await opened.waitForURL(/youtube\.com/)
  await expect(page.locator('iframe')).toHaveCount(0)

  await poster.click()
  await expect(page.locator('iframe[data-video-player]')).toBeVisible()
})
