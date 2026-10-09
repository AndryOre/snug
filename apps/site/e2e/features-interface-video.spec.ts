import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Locator } from '@playwright/test'

import { localePath, LOCALES } from '../src/i18n/locales'
import { blockUmami, isUmamiOrigin } from './umami-helpers'

const PATHS = LOCALES.map((locale) => localePath(locale))

const ORIGIN = 'http://localhost:4399'
const SCHEMES = ['light', 'dark'] as const
const SHOT_IMAGES = '[data-section="interface"] img'

const measureSizes = (image: Locator) =>
  image.evaluate((element: HTMLImageElement) => {
    const entries = element.sizes.split(/,(?![^(]*\))/).map((entry) => {
      const match = /^\s*(\([^)]*\))?\s*(.+?)\s*$/.exec(entry)!
      return { media: match[1], length: match[2]! }
    })
    const chosen = entries.find(
      (entry) => entry.media === undefined || matchMedia(entry.media).matches,
    )!
    const probe = document.createElement('div')
    probe.style.position = 'absolute'
    probe.style.width = chosen.length
    document.body.append(probe)
    const declared = probe.getBoundingClientRect().width
    probe.remove()
    return { declared, rendered: element.getBoundingClientRect().width }
  })

for (const path of PATHS) {
  test(`${path} renders features, interface and video sections`, async ({
    page,
  }) => {
    await blockUmami(page)
    const origins = new Set<string>()
    page.on('request', (request) => {
      const url = new URL(request.url())
      if (url.protocol.startsWith('http') && !isUmamiOrigin(url.origin))
        origins.add(url.origin)
    })

    await page.goto(path)
    await page.waitForLoadState('networkidle')

    await expect(page.locator('[data-section="features"] ol > li')).toHaveCount(
      6,
    )

    const figures = page.locator('[data-section="interface"] figure')
    await expect(figures).toHaveCount(4)
    const images = page.locator(SHOT_IMAGES)
    await expect(images).toHaveCount(8)
    for (let index = 0; index < 8; index++) {
      const image = images.nth(index)
      await expect(image).toHaveAttribute('loading', 'lazy')
      await expect(image).toHaveAttribute('width', '1400')
      await expect(image).toHaveAttribute('height', '1050')
      const alt = await image.getAttribute('alt')
      expect(alt?.length).toBeGreaterThan(10)
      const caption = await figures
        .nth(Math.floor(index / 2))
        .locator('figcaption')
        .innerText()
      expect(alt).not.toBe(caption)
    }

    await expect(page.locator('[data-video-poster]')).toHaveCount(1)
    await expect(page.locator('iframe')).toHaveCount(0)
    expect([...origins]).toEqual([ORIGIN])
  })
}

test('video loads YouTube only after keyboard activation', async ({ page }) => {
  await blockUmami(page)
  const thirdParty: string[] = []
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (
      url.protocol.startsWith('http') &&
      url.origin !== ORIGIN &&
      !isUmamiOrigin(url.origin)
    ) {
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
    /^https:\/\/www\.youtube-nocookie\.com\/embed\/9aXa4aAWr_s/,
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
    'https://www.youtube.com/watch?v=9aXa4aAWr_s',
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

for (const width of [768, 900, 1024]) {
  test(`poster sizes match the rendered width at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 })
    await page.goto('/')
    const poster = page.locator('[data-video-poster] img')
    await poster.scrollIntoViewIfNeeded()
    const { declared, rendered } = await poster.evaluate(
      (image: HTMLImageElement) => {
        const entries = image.sizes.split(/,(?![^(]*\))/).map((entry) => {
          const match = /^\s*(\([^)]*\))?\s*(.+?)\s*$/.exec(entry)!
          return { media: match[1], length: match[2]! }
        })
        const chosen = entries.find(
          (entry) =>
            entry.media === undefined || matchMedia(entry.media).matches,
        )!
        const probe = document.createElement('div')
        probe.style.position = 'absolute'
        probe.style.width = chosen.length
        document.body.append(probe)
        const declaredWidth = probe.getBoundingClientRect().width
        probe.remove()
        return {
          declared: declaredWidth,
          rendered: image.getBoundingClientRect().width,
        }
      },
    )
    expect(Math.abs(declared - rendered)).toBeLessThanOrEqual(1)
  })
}

for (const colorScheme of SCHEMES) {
  test(`only the ${colorScheme} screenshots load under ${colorScheme}`, async ({
    page,
  }) => {
    const requested: string[] = []
    page.on('request', (request) => {
      requested.push(request.url())
    })
    await page.emulateMedia({ colorScheme })
    await page.goto('/')

    const hiddenTheme = colorScheme === 'light' ? 'dark' : 'light'
    const visible = page.locator(
      `${SHOT_IMAGES}[data-shot-theme="${colorScheme}"]`,
    )
    const hidden = page.locator(
      `${SHOT_IMAGES}[data-shot-theme="${hiddenTheme}"]`,
    )
    await expect(visible).toHaveCount(4)
    await expect(hidden).toHaveCount(4)

    for (let index = 0; index < 4; index++) {
      await visible.nth(index).scrollIntoViewIfNeeded()
      await expect
        .poll(() =>
          visible
            .nth(index)
            .evaluate((element: HTMLImageElement) => element.currentSrc),
        )
        .not.toBe('')
    }
    await page.waitForLoadState('networkidle')

    await expect(hidden.first()).toBeHidden()
    for (let index = 0; index < 4; index++) {
      expect(
        await hidden
          .nth(index)
          .evaluate((element: HTMLImageElement) => element.currentSrc),
      ).toBe('')
    }

    const hiddenUrls = await hidden.evaluateAll((elements) =>
      elements.flatMap((element) =>
        (element as HTMLImageElement).srcset
          .split(',')
          .map(
            (candidate) =>
              new URL(candidate.trim().split(' ', 1)[0]!, document.baseURI)
                .href,
          ),
      ),
    )
    expect(hiddenUrls.length).toBeGreaterThan(0)
    expect(requested.filter((url) => hiddenUrls.includes(url))).toEqual([])
  })

  test(`the interface section has no accessibility violations in ${colorScheme}`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme })
    await page.goto('/')
    const { violations } = await new AxeBuilder({ page })
      .include('[data-section="interface"]')
      .analyze()
    expect(violations).toEqual([])
  })
}

for (const width of [375, 768, 1024]) {
  test(`screenshot sizes match the rendered width at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 })
    await page.goto('/')
    const image = page
      .locator(`${SHOT_IMAGES}[data-shot-theme="light"]`)
      .first()
    await image.scrollIntoViewIfNeeded()
    const { declared, rendered } = await measureSizes(image)
    expect(Math.abs(declared - rendered)).toBeLessThanOrEqual(1)
  })
}
