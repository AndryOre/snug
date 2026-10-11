import { expect, test } from '@playwright/test'

import { localePath, LOCALES } from '../src/i18n/locales'
import { COMPARISON_LOCALES, comparisonPath } from './comparison-paths'
import {
  HOW_TO_INDEX_LOCALES,
  HOW_TO_PAGE_LIST,
  howToIndexPath,
} from './how-to-paths'

for (const locale of LOCALES) {
  test(`${locale} landing page links the Guide and What's new from the header and footer`, async ({
    page,
  }) => {
    await page.goto(localePath(locale))
    const guide = localePath(locale, '/guide/')
    const whatsNew = localePath(locale, '/changelog/')
    await expect(page.locator('[data-header-link="guide"]')).toHaveAttribute(
      'href',
      guide,
    )
    await expect(
      page.locator('[data-header-link="whats-new"]'),
    ).toHaveAttribute('href', whatsNew)
    await expect(page.locator('a[data-footer-link="guide"]')).toHaveAttribute(
      'href',
      guide,
    )
    await expect(
      page.locator('a[data-footer-link="changelog"]'),
    ).toHaveAttribute('href', whatsNew)
    await expect(page.locator('a[href*="CHANGELOG.md"]')).toHaveCount(0)
  })

  test(`${locale} landing page footer links the Alternatives page`, async ({
    page,
  }) => {
    await page.goto(localePath(locale))
    await expect(
      page.locator('a[data-footer-link="alternatives"]'),
    ).toHaveAttribute('href', comparisonPath(locale))
  })
}

for (const locale of LOCALES) {
  test(`${locale} landing page footer links the How-to index`, async ({
    page,
  }) => {
    await page.goto(localePath(locale))
    await expect(page.locator('a[data-footer-link="how-to"]')).toHaveAttribute(
      'href',
      howToIndexPath(locale),
    )
  })
}

test.describe('How-to index', () => {
  test('footer link shows on every page type with the shared Umami attributes', async ({
    page,
  }) => {
    for (const path of [
      '/',
      '/privacy/',
      '/guide/',
      '/alternatives/',
      '/how-to/',
    ]) {
      await page.goto(path)
      const link = page.locator('a[data-footer-link="how-to"]')
      await expect(link).toHaveAttribute('href', '/how-to/')
      await expect(link).toHaveAttribute('data-umami-event', 'outbound-click')
      await expect(link).toHaveAttribute(
        'data-umami-event-target',
        'footer-how-to',
      )
    }
  })

  for (const locale of HOW_TO_INDEX_LOCALES) {
    test(`${locale} index lists each page and links the install CTA`, async ({
      page,
    }) => {
      await page.goto(howToIndexPath(locale))
      await expect(page.locator('h1')).toHaveCount(1)
      await expect(
        page.locator('[data-section="how-to-group"] h3 a'),
      ).toHaveCount(
        HOW_TO_PAGE_LIST.map((entry) => entry.slug).filter(
          (slug, index, all) => all.indexOf(slug) === index,
        ).length,
      )
      await expect(page.locator('a[data-install="final"]')).toHaveAttribute(
        'href',
        /^\/install/,
      )
    })
  }
})

for (const locale of COMPARISON_LOCALES) {
  test(`${locale} Alternatives page links each comparison page and the install CTA`, async ({
    page,
  }) => {
    await page.goto(comparisonPath(locale))
    const prefix = comparisonPath(locale)
    const cards = page.locator('[data-section="comparison-cards"] a')
    await expect(cards).toHaveCount(3)
    const hrefs = await cards.evaluateAll((links) =>
      links.map((link) => link.getAttribute('href') ?? ''),
    )
    for (const href of hrefs) {
      expect(href.startsWith(prefix)).toBe(true)
      expect(href.length).toBeGreaterThan(prefix.length)
    }
    await expect(page.locator('a[data-install="final"]')).toHaveAttribute(
      'href',
      /^\/install/,
    )
  })
}

test("the footer What's new link leads to the release notes", async ({
  page,
}) => {
  await page.goto('/')
  await page.locator('a[data-footer-link="changelog"]').click()
  await expect(page).toHaveURL(/\/changelog\/$/)
})
