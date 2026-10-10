import { expect, test } from '@playwright/test'

import { DEFAULT_LOCALE, localePath, LOCALES } from '../src/i18n/locales'

const ENGLISH_PATH = '/guide/exporting/'
const TRANSLATED_LOCALES = LOCALES.filter((locale) => locale !== DEFAULT_LOCALE)

test('English pages never show a translation notice', async ({ page }) => {
  await page.goto(ENGLISH_PATH)
  await expect(page.locator('[data-translation-notice]')).toHaveCount(0)
  await expect(page.locator('main')).toHaveAttribute('lang', 'en')
})

for (const locale of TRANSLATED_LOCALES) {
  test(`${localePath(locale, ENGLISH_PATH)} shows English text with a notice that links to English`, async ({
    page,
  }) => {
    await page.goto(localePath(locale, ENGLISH_PATH))
    const notice = page.locator('[data-translation-notice]')
    await expect(notice).toHaveCount(1)
    await expect(notice).toHaveAttribute('role', 'note')
    await expect(notice.getByRole('link')).toHaveAttribute('href', ENGLISH_PATH)
    await expect(page.locator('main')).toHaveAttribute('lang', 'en')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Exporting bookmarks',
    )
  })
}

test('the notice keeps the language of the page chrome', async ({ page }) => {
  await page.goto(localePath('es', ENGLISH_PATH))
  await expect(page.locator('html')).toHaveAttribute('lang', 'es')
  await expect(page.locator('[data-translation-notice]')).toHaveAttribute(
    'lang',
    'es',
  )
})
