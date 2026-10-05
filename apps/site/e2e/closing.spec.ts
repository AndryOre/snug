import { expect, test } from '@playwright/test'

const PATHS = [
  '/',
  '/es/',
  '/de/',
  '/fr/',
  '/it/',
  '/ja/',
  '/ko/',
  '/pt-br/',
  '/ru/',
  '/zh-cn/',
]

const REVIEW_AUTHORS = [
  'Birdman, Jun 2025',
  'Sean Frey, Sep 2024',
  'Karol Darvaš, Feb 2026',
  'Jacob Hanson, Jun 2026',
]

for (const path of PATHS) {
  test(`${path} renders proof, FAQ, final install and footer`, async ({
    page,
  }) => {
    await page.goto(path)

    const proof = page.locator('[data-section="proof"]')
    await expect(proof.locator('blockquote')).toHaveCount(4)
    for (const caption of REVIEW_AUTHORS) {
      await expect(
        proof.locator('figcaption', { hasText: caption }),
      ).toHaveCount(1)
    }
    await expect(proof.locator('[data-proof="numbers"]')).toContainText(
      '2026-10-05',
    )
    await expect(proof.locator('[data-proof="rename-note"]')).toContainText(
      'Bookmark Import/Export',
    )

    await expect(page.locator('[data-section="faq"] details')).toHaveCount(11)
    await expect(page.locator('[data-section="final"]')).toBeVisible()
    await expect(page.locator('a[data-install="final"]')).toHaveAttribute(
      'href',
      '/install?c=final',
    )
    await expect(page.locator('a[data-footer-link="listing"]')).toHaveAttribute(
      'href',
      '/install?c=footer',
    )
    await expect(page.locator('a[data-footer-link]')).toHaveCount(4)
  })
}

test('English figures match the content document', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-proof="numbers"]')).toHaveText(
    '5,000 users. 4.8 stars from 20 ratings on the Chrome Web Store (2026-10-05).',
  )
})

test('FAQ opens and closes by keyboard', async ({ page }) => {
  await page.goto('/')
  const first = page.locator('[data-section="faq"] details').first()
  const summary = first.locator('summary')
  await summary.focus()
  await expect(first).not.toHaveAttribute('open', '')
  await page.keyboard.press('Enter')
  await expect(first).toHaveAttribute('open', '')
  await expect(first.locator('p')).toBeVisible()
  await page.keyboard.press('Space')
  await expect(first).not.toHaveAttribute('open', '')
})

test('language switcher moves between locales without redirecting', async ({
  page,
}) => {
  await page.goto('/')
  const switcher = page.locator('[data-language-switcher]')
  await switcher.locator('summary').focus()
  await page.keyboard.press('Enter')
  const links = switcher.locator('nav a')
  await expect(links).toHaveCount(10)
  await expect(links.first()).toHaveAttribute('aria-current', 'page')

  await switcher.getByRole('link', { name: 'Deutsch' }).click()
  await expect(page).toHaveURL(/\/de\/$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'de')

  await page.locator('[data-language-switcher]').locator('summary').click()
  await page.getByRole('link', { name: 'English' }).click()
  await expect(page).toHaveURL(/localhost:4399\/$/)
})

test('visiting a locale never redirects to another', async ({ page }) => {
  const response = await page.goto('/ja/')
  expect(response?.request().redirectedFrom()).toBeNull()
  await expect(page).toHaveURL(/\/ja\/$/)
})

test('proof section keeps third-party requests off the page', async ({
  page,
}) => {
  const origins = new Set<string>()
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (url.protocol.startsWith('http')) origins.add(url.origin)
  })
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  expect([...origins]).toEqual(['http://localhost:4399'])
})
