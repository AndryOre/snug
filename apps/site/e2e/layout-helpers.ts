import {
  type Browser,
  type BrowserContext,
  type BrowserContextOptions,
  expect,
  type Locator,
  type Page,
  test,
} from '@playwright/test'

/**
 * The header language trigger. It is matched by its slot instead of its role
 * because WebKit leaves the open popover's focus guards (`span[role=button]`)
 * in the accessibility tree, so `getByRole('button')` matches several elements
 * while the menu is open.
 * @param page - A page with the site header.
 * @returns A locator for the single trigger button.
 */
export function languageTrigger(page: Page): Locator {
  return page.locator(
    '[data-language-switcher] button[data-slot="popover-trigger"]',
  )
}

/**
 * The key chord that moves keyboard focus to the next link. Safari on macOS
 * skips links on a plain Tab by default and reaches them with Option+Tab; every
 * other browser, including WebKit on Linux, reaches them with Tab.
 * @param page - A loaded page, used to read the browser identity.
 * @returns `Alt+Tab` for macOS WebKit, `Tab` otherwise.
 */
export async function linkTabKey(page: Page): Promise<'Alt+Tab' | 'Tab'> {
  const isMacSafari = await page.evaluate(() => {
    const { platform, userAgent } = globalThis.navigator
    return (
      platform.startsWith('Mac') &&
      /Safari/.test(userAgent) &&
      !/Chrome|Chromium|CriOS|Edg|Firefox|FxiOS/.test(userAgent)
    )
  })
  return isMacSafari ? 'Alt+Tab' : 'Tab'
}

/**
 * Hydrate the header island the way a visitor does, by moving focus into it,
 * then wait until it is interactive, including the frames React needs to
 * attach its handlers once the island reports hydrated. The header hydrates on
 * interaction, so waiting alone would never finish.
 * @param page - A page with the site header.
 */
export async function hydrateHeaderIsland(page: Page): Promise<void> {
  await languageTrigger(page).focus()
  await expect(
    page.locator('astro-island:has([data-language-switcher])'),
  ).not.toHaveAttribute('ssr', '')
  await page.waitForFunction(() => {
    const button = globalThis.document.querySelector(
      '[data-language-switcher] button',
    )
    return (
      button !== null &&
      Object.keys(button).some((key) => key.startsWith('__reactProps$'))
    )
  })
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        globalThis.requestAnimationFrame(() => {
          globalThis.requestAnimationFrame(() => {
            resolve()
          })
        })
      }),
  )
}

const ELEMENT_SWEEP_SELECTOR = [
  'h1',
  'h2',
  'h3',
  'h4',
  'button',
  '[data-slot="button"]',
  '[data-slot="card"]',
  '[data-slot="badge"]',
].join(',')

/**
 * Minimum touch target edge in CSS px, less 0.5px of tolerance for the
 * sub-pixel rounding fractional device pixel ratios introduce (a 44px box
 * measures 43.99999 at DPR 2.625).
 */
export const MIN_TOUCH_TARGET = 43.5

/**
 * Asserts the page never scrolls horizontally (`scrollWidth <= innerWidth`).
 * @param page - The page under test.
 */
export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const { scrollWidth, innerWidth } = await page.evaluate(() => ({
    scrollWidth: globalThis.document.documentElement.scrollWidth,
    innerWidth: globalThis.innerWidth,
  }))
  expect(scrollWidth).toBeLessThanOrEqual(innerWidth)
}

/**
 * Sweeps headings, buttons, cards and badges and asserts none clips its own
 * content (`scrollWidth > clientWidth`). Zero-width and 1px (screen-reader
 * only) boxes are ignored.
 * @param page - The page under test.
 */
export async function expectNoElementOverflow(page: Page): Promise<void> {
  const offenders = await page.evaluate((selector) => {
    const found: string[] = []
    for (const element of globalThis.document.querySelectorAll(selector)) {
      if (
        element.clientWidth <= 1 ||
        element.scrollWidth <= element.clientWidth
      )
        continue
      const text = (element.textContent ?? '').trim().slice(0, 40)
      found.push(
        `<${element.tagName.toLowerCase()}> "${text}" ${element.scrollWidth}>${element.clientWidth}`,
      )
    }
    return found
  }, ELEMENT_SWEEP_SELECTOR)
  expect(offenders).toEqual([])
}

/**
 * Resizes the viewport and skips the running test when the device keeps its
 * own. Real mobile devices on BrowserStack ignore `page.setViewportSize`, so a
 * layout assertion that depends on the requested width would measure the
 * device width instead.
 * @param page - The page under test.
 * @param size - The viewport to request.
 * @param size.width - Requested width in CSS pixels.
 * @param size.height - Requested height in CSS pixels.
 */
export async function setViewportOrSkip(
  page: Page,
  size: { width: number; height: number },
): Promise<void> {
  await page.setViewportSize(size)
  const appliedWidth = await page.evaluate(() => globalThis.innerWidth)
  test.skip(
    appliedWidth !== size.width,
    `the device ignored the ${size.width}×${size.height} viewport`,
  )
}

/**
 * Whether the primary input can hover, which touch devices cannot.
 * @param page - A loaded page.
 * @returns True when the device has a hovering, fine pointer.
 */
export async function hasFinePointer(page: Page): Promise<boolean> {
  return page.evaluate(
    () => globalThis.matchMedia('(hover: hover) and (pointer: fine)').matches,
  )
}

/**
 * Applies media emulation and skips the running test when the device cannot.
 * Real iPhones on BrowserStack reject `page.emulateMedia`; the test still runs
 * when the device already reports every requested value.
 * @param page - The page under test.
 * @param media - The `page.emulateMedia` options to apply.
 */
export async function emulateMediaOrSkip(
  page: Page,
  media: Parameters<Page['emulateMedia']>[0],
): Promise<void> {
  try {
    await page.emulateMedia(media)
  } catch (error) {
    if (!String(error).includes('Unsupported Playwright command on iOS'))
      throw error
    const reported = await page.evaluate(() => ({
      colorScheme: globalThis.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light',
      reducedMotion: globalThis.matchMedia('(prefers-reduced-motion: reduce)')
        .matches
        ? 'reduce'
        : 'no-preference',
    }))
    const isSupported =
      (media?.colorScheme === undefined ||
        media.colorScheme === reported.colorScheme) &&
      (media?.reducedMotion === undefined ||
        media.reducedMotion === reported.reducedMotion)
    test.skip(!isSupported, 'the device cannot emulate the requested media')
  }
}

/**
 * Opens an extra browser context and skips the running test when the device
 * allows only one. Real iPhones on BrowserStack reject a second context.
 * @param browser - The `browser` fixture.
 * @param options - Context options, as for `browser.newContext`.
 * @returns A context created with the given options.
 */
export async function newContextOrSkip(
  browser: Browser,
  options: BrowserContextOptions,
): Promise<BrowserContext> {
  try {
    return await browser.newContext(options)
  } catch (error) {
    if (!String(error).includes('Only one browser context is allowed'))
      throw error
    test.skip(true, 'the device allows a single browser context')
    throw error
  }
}
