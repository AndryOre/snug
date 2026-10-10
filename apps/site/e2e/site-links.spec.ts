import { expect, test } from '@playwright/test'

import { localePath, LOCALES } from '../src/i18n/locales'

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
}

test("the footer What's new link leads to the release notes", async ({
  page,
}) => {
  await page.goto('/')
  await page.locator('a[data-footer-link="changelog"]').click()
  await expect(page).toHaveURL(/\/changelog\/$/)
})
