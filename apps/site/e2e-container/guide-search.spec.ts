import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'

import { blockUmami } from '../e2e/umami-helpers'

async function collectViolations(page: Page): Promise<string[]> {
  const problems: string[] = []
  page.on('console', (message) => {
    if (
      message.type() === 'error' ||
      /content security|trusted ?type/i.test(message.text())
    ) {
      problems.push(`console: ${message.text()}`)
    }
  })
  page.on('pageerror', (error) => {
    problems.push(`pageerror: ${error.message}`)
  })
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (event) => {
      console.error(
        `securitypolicyviolation ${event.violatedDirective} ${event.blockedURI}`,
      )
    })
  })
  return problems
}

test('the served header keeps Trusted Types required and allows WebAssembly', async ({
  request,
}) => {
  const response = await request.get('/guide/')
  const policy = response.headers()['content-security-policy'] ?? ''
  expect(policy).toContain("require-trusted-types-for 'script'")
  expect(policy).toContain("'wasm-unsafe-eval'")
  expect(policy).not.toContain("'unsafe-eval'")
})

test('search returns highlighted results under the production CSP', async ({
  page,
}) => {
  await blockUmami(page)
  const problems = await collectViolations(page)
  await page.goto('/guide/', { waitUntil: 'networkidle' })

  await page.keyboard.press('Control+k')
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await dialog.getByRole('textbox').fill('bookmarks')

  const first = dialog.locator('.pagefind-ui__result').first()
  await expect(first).toBeVisible()
  await expect(
    dialog.locator('.pagefind-ui__result mark').first(),
  ).toBeVisible()
  expect(problems).toEqual([])
  expect(
    await dialog.locator('.pagefind-ui__result script, img[onerror]').count(),
  ).toBe(0)

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})

test('search shows the localized no-results message', async ({ page }) => {
  await blockUmami(page)
  const problems = await collectViolations(page)
  await page.goto('/guide/', { waitUntil: 'networkidle' })

  await page.getByRole('button', { name: 'Search' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('textbox').fill('xylophonezzq')
  await expect(dialog.locator('.pagefind-ui__message')).toContainText(
    'Try a different or shorter word.',
  )
  expect(problems).toEqual([])
})

test('the Guide has no accessibility violations with the search open', async ({
  page,
}) => {
  await blockUmami(page)
  await page.goto('/guide/', { waitUntil: 'networkidle' })
  const closed = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  expect(closed.violations).toEqual([])

  await page.keyboard.press('Control+k')
  await page.getByRole('dialog').getByRole('textbox').fill('bookmarks')
  await expect(page.locator('.pagefind-ui__result').first()).toBeVisible()
  const open = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  expect(open.violations).toEqual([])
})
