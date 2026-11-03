import { GOODBYE_REASON_IDS, goodbyePath } from '../src/i18n/goodbye'
import { languageTag, LOCALES } from '../src/i18n/locales'
import { expect, test } from './fixtures'

const QUERY = '?lang=es&v=2.2.0&ae=1'

for (const locale of LOCALES) {
  const path = goodbyePath(locale)

  test.describe(path, () => {
    test('renders lang, noindex and no canonical or sitemap entry', async ({
      page,
      request,
    }) => {
      await page.goto(path)
      await expect(page.locator('html')).toHaveAttribute(
        'lang',
        languageTag(locale),
      )
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        'content',
        'noindex',
      )
      const sitemapResponse = await request.get('/sitemap.xml')
      const sitemap = await sitemapResponse.text()
      expect(sitemap).not.toContain(path)
    })

    test('each reason carries uninstall-reason and shows its reply', async ({
      page,
    }) => {
      await page.goto(path)
      const buttons = page.locator(
        'button[data-umami-event="uninstall-reason"]',
      )
      await expect(buttons).toHaveCount(GOODBYE_REASON_IDS.length)
      await expect(buttons).toHaveCount(7)
      const region = page.locator('[data-goodbye-reply-region]')
      await expect(region).toHaveAttribute('aria-live', 'polite')
      for (const reason of GOODBYE_REASON_IDS) {
        const button = page.locator(
          `button[data-umami-event-reason="${reason}"]`,
        )
        await expect(button).toBeVisible()
        await button.click()
        await expect(button).toHaveAttribute('aria-pressed', 'true')
        await expect(region.locator(`[data-reply="${reason}"]`)).toBeVisible()
      }
    })

    test('reinstall goes through the tagged install redirect', async ({
      page,
    }) => {
      await page.goto(path)
      await expect(
        page.locator('a[href="/install?c=goodbye"]').first(),
      ).toBeVisible()
      await page
        .locator('button[data-umami-event-reason="permissions"]')
        .click()
      await expect(
        page.locator('[data-reply="permissions"] a[href="/install?c=goodbye"]'),
      ).toBeVisible()
    })
  })
}

test('ae=1 shows the backups notice and the disclosure shows the values', async ({
  page,
}) => {
  await page.goto(`/es/goodbye/${QUERY}`)
  await expect(page.locator('[data-goodbye-notice]')).toBeVisible()
  await expect(page.locator('[data-goodbye-disclosure]')).toHaveText(
    'Esta página recibió solo: versión 2.2.0, idioma es, copias programadas sí. Ningún identificador. Umami cuenta esta visita y el motivo que elijas, sin cookies.',
  )
})

test('ae=0 hides the notice and says scheduled backups no', async ({
  page,
}) => {
  await page.goto('/goodbye/?ae=0')
  await expect(page.locator('[data-goodbye-disclosure]')).toContainText(
    'scheduled backups no',
  )
  await expect(page.locator('[data-goodbye-notice]')).toHaveCount(0)
})

test('missing parameters show not provided and no notice', async ({ page }) => {
  await page.goto('/goodbye/')
  await expect(page.locator('[data-goodbye-disclosure]')).toContainText(
    'version not provided, language not provided, scheduled backups not provided',
  )
  await expect(page.locator('[data-goodbye-notice]')).toHaveCount(0)
})

test('bad values never render as markup', async ({ page }) => {
  await page.goto(
    '/goodbye/?v=%3Cimg%20src%3Dx%3E&lang=%3Cb%3Ex%3C%2Fb%3E&ae=%3Ci%3E',
  )
  const disclosure = page.locator('[data-goodbye-disclosure]')
  await expect(disclosure).toContainText('version not provided')
  await expect(disclosure.locator('img, b, i')).toHaveCount(0)
})

test('lang on the English page moves to that locale and keeps the query', async ({
  page,
}) => {
  await page.goto(`/goodbye/${QUERY}`)
  await page.waitForURL(`**/es/goodbye/${QUERY}`)
  await expect(page.locator('html')).toHaveAttribute('lang', 'es')
})

for (const [raw, expected, tag] of [
  ['pt-BR', 'pt_BR', 'pt-BR'],
  ['PT_BR', 'pt_BR', 'pt-BR'],
  ['zh-cn', 'zh_CN', 'zh-CN'],
  ['ES', 'es', 'es'],
] as const) {
  test(`lang=${raw} renders the ${expected} page`, async ({ page }) => {
    await page.goto(`/goodbye/?lang=${raw}`)
    await expect(page.locator('html')).toHaveAttribute('lang', tag)
    await expect(page.locator('[data-goodbye-disclosure]')).toContainText(
      expected,
    )
  })
}

test('an unknown lang stays on the English page', async ({ page }) => {
  await page.goto('/goodbye/?lang=klingon')
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.locator('[data-goodbye-disclosure]')).toContainText(
    'language not provided',
  )
})

test('the Goodbye page stays out of the llms files', async ({ request }) => {
  for (const file of ['/llms.txt', '/llms-full.txt']) {
    const response = await request.get(file)
    const body = await response.text()
    expect(body).not.toContain('/goodbye/')
  }
})
