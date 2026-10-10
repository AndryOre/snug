import { expect, test } from '@playwright/test'

import { localePath, LOCALES } from '../src/i18n/locales'
import { COMPARISON_LOCALES, comparisonPath } from './comparison-paths'

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
