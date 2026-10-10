import type { Loader, LoaderContext } from 'astro/loaders'
import path from 'node:path'

import { loadCatalog } from './catalog'
import { REPOSITORY_ROOT } from './paths'
import { PUBLISHED_SOURCES } from './published'

const DOCS_DIRECTORY = path.join(REPOSITORY_ROOT, 'docs')
const WATCHED_FILES = new Set(
  PUBLISHED_SOURCES.map((source) =>
    path.join(REPOSITORY_ROOT, source.sourcePath),
  ),
)

async function fillStore(context: LoaderContext): Promise<void> {
  const entries = loadCatalog()
  context.store.clear()
  for (const entry of entries) {
    const data = await context.parseData({
      id: entry.id,
      data: { title: entry.title, editUrl: entry.editUrl },
    })
    context.store.set({
      id: entry.id,
      data,
      body: entry.body,
      digest: context.generateDigest(entry.body),
      rendered: await context.renderMarkdown(entry.body),
    })
  }
}

function isWatchedFile(file: string): boolean {
  return WATCHED_FILES.has(file) || file.startsWith(DOCS_DIRECTORY)
}

/**
 * Content loader for the Starlight `docs` collection: one entry per published
 * source, read from the repository at build time and never copied into the
 * site. In dev it watches the docs folder and `CHANGELOG.md` and refills the
 * store on every change.
 * @returns A loader that fills the store on every build and file change.
 */
export function catalogLoader(): Loader {
  return {
    name: 'catalog-loader',
    async load(context) {
      await fillStore(context)
      const { watcher } = context
      if (!watcher) return
      watcher.add([DOCS_DIRECTORY, ...WATCHED_FILES])
      const refresh = async (file: string) => {
        if (!isWatchedFile(file)) return
        try {
          await fillStore(context)
        } catch (error) {
          context.logger.error(
            error instanceof Error ? error.message : String(error),
          )
        }
      }
      const onFileEvent = (file: string) => {
        void refresh(file)
      }
      watcher.on('change', onFileEvent)
      watcher.on('add', onFileEvent)
      watcher.on('unlink', onFileEvent)
    },
  }
}
