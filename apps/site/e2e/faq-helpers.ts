import { expect, type Locator, type Page } from '@playwright/test'

export async function hydratedFaq(page: Page): Promise<Locator> {
  const faq = page.locator('[data-section="faq"]')
  await faq.scrollIntoViewIfNeeded()
  await expect(faq.locator('astro-island')).not.toHaveAttribute('ssr', '')
  return faq
}

export async function firstFaqTrigger(page: Page): Promise<Locator> {
  const faq = await hydratedFaq(page)
  return faq.getByRole('button').first()
}
