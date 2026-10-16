import { expect, test } from '@playwright/test'

import { localePath, LOCALES } from '../src/i18n/locales'

const FOOTER_OUTBOUND_TARGETS = [
  'footer-source',
  'footer-scorecard',
  'footer-bestPractices',
  'footer-ci',
  'footer-listing',
]
const FOOTER_NAV_TARGETS = [
  'footer-alternatives',
  'footer-how-to',
  'footer-privacy',
  'footer-guide',
  'footer-changelog',
]

for (const locale of LOCALES) {
  test.describe(`${locale} Umami event attributes`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(localePath(locale))
    })

    test('every install button carries install with its placement', async ({
      page,
    }) => {
      const entries = await page
        .locator('a[data-install]')
        .evaluateAll((anchors) =>
          anchors.map((anchor) => ({
            placement: anchor.dataset.install,
            event: anchor.dataset.umamiEvent,
            property: anchor.dataset.umamiEventPlacement,
          })),
        )
      const placements = entries.map((entry) => entry.placement)
      expect(placements).toEqual(
        expect.arrayContaining(['dock', 'final', 'hero']),
      )
      for (const entry of entries) {
        expect(entry.event).toBe('install')
        expect(entry.property).toBe(entry.placement)
      }
    })

    test('the reviews link carries reviews-click', async ({ page }) => {
      await expect(page.locator('a[data-reviews-link]')).toHaveAttribute(
        'data-umami-event',
        'reviews-click',
      )
    })

    test('footer links carry outbound-click with stable targets', async ({
      page,
    }) => {
      const targets = await page
        .locator('a[data-umami-event="outbound-click"]')
        .evaluateAll((anchors) =>
          anchors.map((anchor) => anchor.dataset.umamiEventTarget),
        )
      expect(
        targets.toSorted((a, b) => String(a).localeCompare(String(b))),
      ).toEqual(FOOTER_OUTBOUND_TARGETS.toSorted((a, b) => a.localeCompare(b)))
    })

    test('internal footer links carry nav-click with stable targets', async ({
      page,
    }) => {
      const targets = await page
        .locator('footer a[data-umami-event="nav-click"]')
        .evaluateAll((anchors) =>
          anchors.map((anchor) => anchor.dataset.umamiEventTarget),
        )
      expect(targets).toEqual(FOOTER_NAV_TARGETS)
    })

    test('no event property depends on locale or translated text', async ({
      page,
    }) => {
      const properties = await page
        .locator('[data-umami-event]')
        .evaluateAll((elements) =>
          elements.flatMap((element) =>
            element
              .getAttributeNames()
              .filter((name) => name.startsWith('data-umami-event-'))
              .map((name) => element.getAttribute(name) ?? ''),
          ),
        )
      expect(properties.length).toBeGreaterThan(0)
      for (const value of properties) {
        expect(value).toMatch(/^[A-Za-z-]+$/)
      }
    })
  })
}
