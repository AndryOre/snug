import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  DEFAULT_LOCALE,
  languageTag,
  localePath,
  LOCALES,
} from '../src/i18n/locales'

const siteRoot = fileURLToPath(new URL('..', import.meta.url))
const builtSite = path.join(siteRoot, 'dist')

type Locale = (typeof LOCALES)[number]

function getNotFoundCopy(locale: Locale): {
  title: string
  body: string
  backLink: string
} {
  const content = JSON.parse(
    readFileSync(path.join(siteRoot, 'src/content', `${locale}.json`), 'utf8'),
  ) as { notFound: { title: string; body: string; backLink: string } }
  return content.notFound
}

function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function notFoundUrl(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? '/404.html' : `${localePath(locale)}404/`
}

test.describe('built 404 pages', () => {
  for (const locale of LOCALES) {
    test(`${locale} 404 carries its own language and copy`, () => {
      const html = readFileSync(
        path.join(
          builtSite,
          notFoundUrl(locale).slice(1),
          locale === DEFAULT_LOCALE ? '' : 'index.html',
        ),
        'utf8',
      )
      const notFound = getNotFoundCopy(locale)

      expect(html).toContain(`<html lang="${languageTag(locale)}"`)
      expect(html).toContain(escapeHtml(notFound.title))
      expect(html).toContain(escapeHtml(notFound.body))
      expect(html).toContain(`href="${localePath(locale)}"`)
      expect(html).toContain(escapeHtml(notFound.backLink))
      expect(html).toContain('name="robots" content="noindex"')
      expect(html).not.toContain('aria-current')
    })
  }
})

test.describe('rendered 404 pages', () => {
  for (const locale of LOCALES) {
    test(`${locale} 404 fits the viewport and passes axe`, async ({ page }) => {
      const notFound = getNotFoundCopy(locale)
      for (const viewport of [
        { width: 320, height: 568 },
        { width: 1280, height: 720 },
      ]) {
        await page.setViewportSize(viewport)
        await page.goto(notFoundUrl(locale))

        await expect(page.getByRole('heading', { level: 1 })).toHaveText(
          notFound.title,
        )
        await expect(
          page.getByRole('link', { name: notFound.backLink }),
        ).toHaveAttribute('href', localePath(locale))
        const { scrollHeight, scrollWidth } = await page.evaluate(() => ({
          scrollHeight: globalThis.document.documentElement.scrollHeight,
          scrollWidth: globalThis.document.documentElement.scrollWidth,
        }))
        expect(scrollHeight).toBeLessThanOrEqual(viewport.height)
        expect(scrollWidth).toBeLessThanOrEqual(viewport.width)
      }

      await page.setViewportSize({ width: 320, height: 568 })
      await page.goto(notFoundUrl(locale))
      const { violations } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
      expect(violations).toEqual([])
      await expect(page.locator('a[aria-current]')).toHaveCount(0)
    })
  }
})
