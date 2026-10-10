import { readFileSync } from 'node:fs'

import { languageTag, type Locale, LOCALES } from '../i18n/locales'

/**
 * Sidebar labels of the Guide, one per page plus the group and What's new.
 */
export interface SidebarLabels {
  guide: string
  overview: string
  exporting: string
  importing: string
  duplicates: string
  settings: string
  autoExport: string
  whatsNew: string
}

/**
 * Sidebar entry in the shape Starlight's `sidebar` option takes.
 */
export type SidebarEntry =
  | { label: string; translations: Record<string, string>; slug: string }
  | {
      label: string
      translations: Record<string, string>
      items: SidebarEntry[]
    }

const SIDEBAR_PAGES = [
  ['overview', 'guide'],
  ['exporting', 'guide/exporting'],
  ['importing', 'guide/importing'],
  ['duplicates', 'guide/duplicates'],
  ['settings', 'guide/settings'],
  ['autoExport', 'guide/auto-export'],
] as const satisfies readonly (readonly [keyof SidebarLabels, string])[]

/**
 * Reads the sidebar labels of every locale from `src/content/<locale>.json`.
 * @returns The labels keyed by locale.
 */
export function readSidebarLabels(): Record<Locale, SidebarLabels> {
  return Object.fromEntries(
    LOCALES.map((locale) => {
      const file = new URL(`../content/${locale}.json`, import.meta.url)
      const content = JSON.parse(readFileSync(file, 'utf8')) as {
        docs: SidebarLabels
      }
      return [locale, content.docs]
    }),
  ) as Record<Locale, SidebarLabels>
}

function translationsOf(
  labels: Record<Locale, SidebarLabels>,
  key: keyof SidebarLabels,
): Record<string, string> {
  return Object.fromEntries(
    LOCALES.filter((locale) => locale !== 'en').map((locale) => [
      languageTag(locale),
      labels[locale][key],
    ]),
  )
}

/**
 * Builds Starlight's sidebar: a Guide group (Overview plus the five area
 * pages) followed by What's new. English labels are the defaults and every
 * other locale supplies its own through `translations`.
 * @param labels - Labels per locale. Defaults to the content files.
 * @returns The sidebar items in display order.
 */
export function buildSidebar(
  labels: Record<Locale, SidebarLabels> = readSidebarLabels(),
): SidebarEntry[] {
  return [
    {
      label: labels.en.guide,
      translations: translationsOf(labels, 'guide'),
      items: SIDEBAR_PAGES.map(([key, slug]) => ({
        label: labels.en[key],
        translations: translationsOf(labels, key),
        slug,
      })),
    },
    {
      label: labels.en.whatsNew,
      translations: translationsOf(labels, 'whatsNew'),
      slug: 'changelog',
    },
  ]
}
