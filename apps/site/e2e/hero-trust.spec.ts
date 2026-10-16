import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { localePath, LOCALES } from '../src/i18n/locales'
import { blockUmami, isUmamiOrigin } from './umami-helpers'

const SCHEMES = ['light', 'dark'] as const

const PATHS = LOCALES.map((locale) => localePath(locale))

for (const path of PATHS) {
  test(`${path} renders hero, trust proof and tagged install actions`, async ({
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

    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('[data-section="hero"]')).toBeVisible()
    await expect(page.locator('[data-section="trust"]')).toBeVisible()
    await expect(page.locator('[data-section="stats"] dl > div')).toHaveCount(4)
    await expect(
      page.locator(
        '[data-section="marquee"] [data-marquee-row]:not([aria-hidden])',
      ),
    ).toHaveCount(1)
    await expect(page.locator('[data-section="trust"] ul a')).toHaveCount(5)

    await expect(page.locator('a[data-install="hero"]')).toHaveAttribute(
      'href',
      '/install?c=hero',
    )
    await expect(page.locator('a[data-install="hero"]')).toHaveAttribute(
      'target',
      '_blank',
    )
    await expect(page.locator('a[data-install="hero"]')).toHaveAttribute(
      'rel',
      'noopener',
    )
    await expect(page.locator('[data-section="how"] figure')).toBeVisible()
    await expect(page.locator('[data-section="hero"] figure')).toHaveCount(0)
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
      const figure = page.locator('[data-section="how"] figure')
      await expect(figure).toBeVisible()
      await expect(figure.locator('[data-slot="card"]')).toHaveCount(2)
      await expect(figure.locator('[data-slot="badge"]')).toHaveText([
        'HTML',
        'JSON',
        'CSV',
        'Markdown',
        'OPML',
        'XBEL',
      ])
      await expect(figure.locator('[data-journey="network"]')).toBeVisible()
      await expect(figure.locator('[translate="no"]').first()).toBeVisible()
    })
  }

  test('the stage is a row at 1280 and stacks at 375', async ({ page }) => {
    const boxes = async () =>
      page
        .locator(
          '[data-section="how"] figure [data-slot="card"], [data-section="how"] figure .hero-track',
        )
        .evaluateAll((items) =>
          items.map((item) => {
            const { x, y, width, height } = item.getBoundingClientRect()
            return { x, y, width, height }
          }),
        )

    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/')
    const row = await boxes()
    expect(row).toHaveLength(3)
    expect(row[1]!.x).toBeGreaterThan(row[0]!.x + row[0]!.width - 1)
    expect(row[2]!.x).toBeGreaterThan(row[1]!.x + row[1]!.width - 1)

    await page.setViewportSize({ width: 375, height: 800 })
    const stack = await boxes()
    expect(stack[1]!.y).toBeGreaterThan(stack[0]!.y + stack[0]!.height - 1)
    expect(stack[2]!.y).toBeGreaterThan(stack[1]!.y + stack[1]!.height - 1)
  })

  test('the stage loops under no-preference', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto('/')
    const read = (selector: string) =>
      page
        .locator(selector)
        .first()
        .evaluate((element) => {
          const style = globalThis.getComputedStyle(element)
          return [style.animationName, style.animationDuration]
        })
    expect(await read('.hero-file')).toEqual(['hero-file-travel', '8s'])
    expect(await read('.hero-tree-source')).toEqual([
      'hero-tree-compress',
      '8s',
    ])
    expect(await read('.hero-tree-target')).toEqual(['hero-tree-unfold', '8s'])
    expect(await read('.hero-logos > *')).toEqual(['hero-pair-rotate', '24s'])
    await expect(page.locator('h1')).toHaveCSS('animation-name', 'none')
  })

  test('the stage is static and fully visible under reduce', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    for (const selector of [
      '.hero-file',
      '.hero-tree-source',
      '.hero-tree-target',
    ]) {
      const target = page.locator(selector).first()
      await expect(target).toHaveCSS('animation-name', 'none')
      await expect(target).toHaveCSS('opacity', '1')
      await expect(target).toBeVisible()
    }
  })

  for (const path of ['/de/', '/ru/']) {
    test(`${path} journey does not overflow at 320`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 700 })
      await page.goto(path)
      const overflowing = await page
        .locator('[data-section="how"] figure')
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
    const figure = page.locator('[data-section="how"] figure')
    await expect(figure).toHaveAttribute('aria-labelledby', /.+/)
    const descriptionId = await figure.getAttribute('aria-describedby')
    expect(descriptionId).toBeTruthy()
    await expect(page.locator(`#${descriptionId}`)).toContainText('one file')
    await expect(
      figure.locator('svg[aria-hidden="true"]').first(),
    ).toBeAttached()
  })

  for (const colorScheme of SCHEMES) {
    test(`the journey passes axe in ${colorScheme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' })
      await page.goto('/')
      const { violations } = await new AxeBuilder({ page })
        .include('[data-section="how"] figure')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
      expect(violations).toEqual([])
    })
  }
})

test.describe('stats strip and browser marquee', () => {
  test('render in order after the hero', async ({ page }) => {
    await page.goto('/')
    const order = await page
      .locator('main > section')
      .evaluateAll((sections) =>
        sections.map((section) => section.dataset.section),
      )
    expect(order.slice(0, 4)).toEqual(['hero', 'stats', 'marquee', 'trust'])
  })

  test('animation duration follows the row width at 40 px/s', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto('/')
    const { rowWidth, duration } = await page
      .locator('[data-marquee-track]')
      .evaluate((track) => ({
        rowWidth: track.scrollWidth / 2,
        duration: Number(
          getComputedStyle(track).animationDuration.replace('s', ''),
        ),
      }))
    expect(Math.abs(duration - rowWidth / 40)).toBeLessThan(0.1)
  })

  test('pauses on hover with a fine pointer', async ({ page, hasTouch }) => {
    test.skip(hasTouch, 'hover needs a fine pointer')
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto('/')
    await page.locator('[data-marquee-viewport]').hover()
    await expect(page.locator('[data-marquee-track]')).toHaveCSS(
      'animation-play-state',
      'paused',
    )
  })

  test('pauses when the viewport takes focus', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto('/')
    const viewport = page.locator('[data-marquee-viewport]')
    await expect(viewport).toHaveAttribute('role', 'group')
    await expect(viewport).toHaveAttribute('aria-label', /.+/)
    await expect(page.locator('[data-marquee-track]')).toHaveCSS(
      'animation-play-state',
      'running',
    )
    await viewport.focus()
    await expect(page.locator('[data-marquee-track]')).toHaveCSS(
      'animation-play-state',
      'paused',
    )
  })

  test('is static under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await expect(page.locator('[data-marquee-track]')).toHaveCSS(
      'animation-name',
      'none',
    )
    await expect(
      page.locator('[data-marquee-row][aria-hidden="true"]'),
    ).toBeHidden()
  })

  test('does not overflow at 320', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 })
    await page.goto('/')
    const scrollWidth = await page.evaluate(
      () => globalThis.document.documentElement.scrollWidth,
    )
    expect(scrollWidth).toBeLessThanOrEqual(320)
  })
})
