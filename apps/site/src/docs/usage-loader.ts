import type { Loader, LoaderContext } from 'astro/loaders'
import { readFileSync } from 'node:fs'
import path from 'node:path'

/**
 * The repository's usage overview, resolved from the `apps/site` working
 * directory because bundled prerender chunks have no stable `import.meta`
 * location.
 */
const USAGE_OVERVIEW_PATH = path.resolve(process.cwd(), '../../docs/usage.md')

/**
 * Slug of the Guide's overview page, served at `/guide/`.
 */
const GUIDE_SLUG = 'guide'

const EDIT_URL = 'https://github.com/AndryOre/snug/edit/main/docs/usage.md'
const LEADING_HEADING = /^# .*\n+/

async function loadOverview(context: LoaderContext): Promise<void> {
  const markdown = readFileSync(USAGE_OVERVIEW_PATH, 'utf8')
  const body = markdown.replace(LEADING_HEADING, '')
  const data = await context.parseData({
    id: GUIDE_SLUG,
    data: { title: 'Guide', editUrl: EDIT_URL },
  })
  context.store.set({
    id: GUIDE_SLUG,
    data,
    body,
    digest: context.generateDigest(body),
    rendered: await context.renderMarkdown(body),
  })
}

/**
 * Temporary minimal loader for the Starlight `docs` collection: one entry,
 * `guide`, over `docs/usage.md`, so the Guide can ship before the catalog
 * loader replaces it. Read at build time, never copied into the site.
 * @returns A loader that fills the store on every build and file change.
 */
export function usageOverviewLoader(): Loader {
  return {
    name: 'usage-overview-loader',
    async load(context) {
      await loadOverview(context)
      context.watcher?.add(USAGE_OVERVIEW_PATH)
      context.watcher?.on('change', (file) => {
        if (file === USAGE_OVERVIEW_PATH) void loadOverview(context)
      })
    },
  }
}
