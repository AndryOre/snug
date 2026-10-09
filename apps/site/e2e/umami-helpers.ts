import type { Page } from '@playwright/test'

import { UMAMI_COLLECT_ORIGIN, UMAMI_SCRIPT_ORIGIN } from '../src/seo/umami'

export const UMAMI_ORIGINS = [UMAMI_SCRIPT_ORIGIN, UMAMI_COLLECT_ORIGIN]

export function isUmamiOrigin(origin: string): boolean {
  return UMAMI_ORIGINS.includes(origin)
}

/**
 * Answers every Umami request locally with an empty script so tests never
 * reach the real service. Fulfilling instead of aborting keeps the console
 * free of `net::ERR_FAILED` noise that CSP gates would flag.
 * @param page - The Playwright page whose Umami requests are answered locally.
 */
export async function blockUmami(page: Page): Promise<void> {
  for (const origin of UMAMI_ORIGINS)
    await page.route(`${origin}/**`, (route) =>
      route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }),
    )
}
