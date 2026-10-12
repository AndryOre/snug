import { expect, type Locator, type Page, test } from '@playwright/test'

import { hydratedFaq } from './faq-helpers'
import { hydrateHeaderIsland } from './layout-helpers'

const SCHEMES = ['light', 'dark'] as const
const MINIMUM_CONTRAST = 3
const HOVER_MINIMUM_CONTRAST = 4.5

interface FocusTarget {
  name: string
  path?: string
  locate: (page: Page) => Locator
  hydrate?: (page: Page) => Promise<void>
  open?: (page: Page) => Promise<void>
}

async function hydrateHeader(page: Page) {
  await hydrateHeaderIsland(page)
}

async function hydrateFaq(page: Page) {
  await hydratedFaq(page)
}

const TARGETS: readonly FocusTarget[] = [
  {
    name: 'logo link',
    locate: (page) => page.locator('header a[aria-label]').first(),
  },
  {
    name: 'text link',
    locate: (page) => page.locator('main a.underline-offset-4').first(),
  },
  {
    name: 'install button',
    locate: (page) => page.locator('[data-install="hero"]'),
  },
  {
    name: 'skip link',
    locate: (page) => page.locator('header a[href="#main"]'),
  },
  {
    name: 'header nav link',
    locate: (page) => page.locator('[data-header-link]').first(),
  },
  {
    name: 'theme trigger',
    hydrate: hydrateHeader,
    locate: (page) => page.locator('[data-theme-menu] button'),
  },
  {
    name: 'theme item',
    hydrate: hydrateHeader,
    locate: (page) => page.getByRole('menuitemradio').first(),
    open: async (page) => {
      await page.locator('[data-theme-menu] button').click()
    },
  },
  {
    name: 'language trigger',
    hydrate: hydrateHeader,
    locate: (page) => page.locator('[data-language-switcher] button'),
  },
  {
    name: 'language item',
    hydrate: hydrateHeader,
    locate: (page) => page.locator('[data-language-menu] a').first(),
    open: async (page) => {
      await page.locator('[data-language-switcher] button').click()
    },
  },
  {
    name: 'FAQ trigger',
    hydrate: hydrateFaq,
    locate: (page) => page.locator('[data-slot="accordion-trigger"]').first(),
  },
  {
    name: 'docs pagination link',
    path: '/guide/exporting/',
    locate: (page) => page.locator('a[rel="next"], a[rel="prev"]').first(),
  },
]

function luminance(rgb: readonly number[]) {
  const [red = 0, green = 0, blue = 0] = rgb.map((channel) => {
    const value = channel / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

function contrastRatio(first: readonly number[], second: readonly number[]) {
  const firstLuminance = luminance(first)
  const secondLuminance = luminance(second)
  return (
    (Math.max(firstLuminance, secondLuminance) + 0.05) /
    (Math.min(firstLuminance, secondLuminance) + 0.05)
  )
}

async function readFocusColors(target: Locator) {
  await target.scrollIntoViewIfNeeded()
  await target.page().keyboard.press('Tab')
  await target.focus()
  const readRing = () =>
    target.evaluate((element) => {
      const shadows =
        getComputedStyle(element).boxShadow.split(/,\s*(?![^(]*\))/)
      const ring = shadows.find((shadow) =>
        /\)\s+0px\s+0px\s+0px\s+5px$/.test(shadow.trim()),
      )
      return ring?.slice(0, ring.indexOf(')') + 1)
    })
  await expect.poll(readRing).toBeDefined()
  return {
    ring: await readRing(),
    background: await target.evaluate(
      () => getComputedStyle(document.body).backgroundColor,
    ),
  }
}

async function toRgbList(page: Page, colors: string[]) {
  return page.evaluate(
    (inputs) =>
      inputs.map((color) => {
        const canvas = globalThis.document.createElement('canvas')
        canvas.width = 1
        canvas.height = 1
        const context = canvas.getContext('2d', { colorSpace: 'srgb' })!
        context.fillStyle = '#000'
        context.fillStyle = color
        context.fillRect(0, 0, 1, 1)
        return [...context.getImageData(0, 0, 1, 1).data].slice(0, 3)
      }),
    colors,
  )
}

for (const colorScheme of SCHEMES) {
  for (const { name, locate, hydrate, open, path = '/' } of TARGETS) {
    test(`the ${name} focus ring reaches 3:1 in ${colorScheme}`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme })
      await page.goto(path)
      await hydrate?.(page)
      await open?.(page)
      const { ring, background } = await readFocusColors(locate(page))
      expect(ring, 'a 3px ring with a 2px offset').toBeDefined()
      const [ringRgb = [], backgroundRgb = []] = await toRgbList(page, [
        ring ?? '',
        background,
      ])
      expect(contrastRatio(ringRgb, backgroundRgb)).toBeGreaterThanOrEqual(
        MINIMUM_CONTRAST,
      )
    })
  }

  test(`the install button hover label reaches 4.5:1 in ${colorScheme}`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme })
    await page.goto('/')
    const button = page.locator('[data-install="hero"]')
    await button.hover()
    await expect
      .poll(async () => {
        const { fill, label } = await button.evaluate((element) => {
          const style = getComputedStyle(element)
          return { fill: style.backgroundColor, label: style.color }
        })
        const [fillRgb = [], labelRgb = []] = await toRgbList(page, [
          fill,
          label,
        ])
        return contrastRatio(fillRgb, labelRgb)
      })
      .toBeGreaterThanOrEqual(HOVER_MINIMUM_CONTRAST)
  })
}
