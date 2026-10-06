import type { AstroIntegration } from 'astro'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const COLLAPSED_PANEL = /<div\b[^>]*\bdata-slot="accordion-content"[^>]*>/g

/**
 * React serializes the `hidden` attribute as a boolean, so the server HTML of a
 * collapsed accordion panel cannot carry `hidden="until-found"` on its own.
 * Find-in-page and text-fragment links need it before hydration.
 * @param html - A built page.
 * @returns The page with every collapsed accordion panel marked findable.
 */
export function markCollapsedPanelsFindable(html: string): string {
  return html.replaceAll(COLLAPSED_PANEL, (tag) =>
    tag.replace(/\bhidden=""/, 'hidden="until-found"'),
  )
}

function listHtmlFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) return listHtmlFiles(entryPath)
    return entry.name.endsWith('.html') ? [entryPath] : []
  })
}

/**
 * Astro integration that rewrites the built pages with
 * {@link markCollapsedPanelsFindable}.
 * @returns The integration to register in `astro.config.ts`.
 */
export function hiddenUntilFound(): AstroIntegration {
  return {
    name: 'hidden-until-found',
    hooks: {
      'astro:build:done': ({ dir }) => {
        const files = listHtmlFiles(fileURLToPath(dir))
        for (const file of files) {
          const html = readFileSync(file, 'utf8')
          const marked = markCollapsedPanelsFindable(html)
          if (marked !== html) writeFileSync(file, marked)
        }
      },
    },
  }
}
