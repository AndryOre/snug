import { expect, type Locator, type Page, test } from '@playwright/test'

const SCHEMES = ['light', 'dark'] as const
const MINIMUM_CONTRAST = 3

const TARGETS = [
  {
    name: 'logo link',
    locate: (page: Page) => page.locator('header a[aria-label]').first(),
  },
  {
    name: 'text link',
    locate: (page: Page) => page.locator('main a.underline-offset-4').first(),
  },
] as const

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
  return target.evaluate((element) => {
    const shadows = getComputedStyle(element).boxShadow.split(/,\s*(?![^(]*\))/)
    const ring = shadows.find((shadow) =>
      /\)\s+0px\s+0px\s+0px\s+5px/.test(shadow),
    )
    return {
      ring: ring?.slice(0, ring.indexOf(')') + 1),
      background: getComputedStyle(document.body).backgroundColor,
    }
  })
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
  for (const { name, locate } of TARGETS) {
    test(`the ${name} focus ring reaches 3:1 in ${colorScheme}`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme })
      await page.goto('/')
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
}
