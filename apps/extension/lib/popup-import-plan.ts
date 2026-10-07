import { i18n } from '#i18n'

import { countBookmarks, countImportableBookmarks } from './count-bookmarks'
import { summarizeImportDuplicates } from './import-duplicates'
import { getImportPreview } from './import-preview'
import { parseImportFile } from './importers/parse-import'
import {
  loadLiveRootTitles,
  resolveImportRootTitles,
} from './importers/resolve-roots'
import { collectExistingUrls, dropDuplicateBookmarks } from './skip-duplicates'
import type { ImportMode } from './types'

/**
 * Largest import (in bookmarks that will be created) the popup runs itself.
 * Chrome closes the popup on focus loss and kills its JS context with no
 * rollback, so anything larger is routed to the App page.
 */
export const POPUP_IMPORT_BOOKMARK_LIMIT = 200

/**
 * What the popup should do with a picked file.
 */
export type PopupImportPlan =
  | { kind: 'import'; mode: ImportMode }
  | { kind: 'app' }
  | { kind: 'all-duplicates'; skippedDuplicates: number }

/**
 * Input of {@link planPopupImport}.
 */
export interface PopupImportRequest {
  text: string
  mimeType: string
  fileName: string
  mode: ImportMode
  skipDuplicates: boolean
}

/**
 * Decides how the popup handles a picked file: import it here, hand it to the
 * App Import page (Restore - replace, or more than
 * {@link POPUP_IMPORT_BOOKMARK_LIMIT} bookmarks left to create), or report that
 * Skip duplicates leaves nothing to import. A file without location data is
 * always planned in `folder` mode.
 * @param request The file content and the import settings.
 * @returns The plan for this file.
 * @throws {Error} When the format is unsupported or the file has no bookmarks.
 */
export async function planPopupImport(
  request: PopupImportRequest,
): Promise<PopupImportPlan> {
  const { text, mimeType, fileName } = request
  const { format, totalCount, hasLocationData } = getImportPreview(
    text,
    mimeType,
    fileName,
    await loadLiveRootTitles(),
  )
  if (format === 'unknown') throw new Error(i18n.t('unsupportedFileFormat'))
  if (totalCount === 0) throw new Error(i18n.t('import_noBookmarks'))

  const mode = hasLocationData ? request.mode : 'folder'
  if (mode === 'restore-replace') return { kind: 'app' }

  let remainingCount = totalCount
  if (request.skipDuplicates) {
    const summary = await summarizeImportDuplicates(text, mimeType, fileName)
    if (summary.importableCount === 0 && summary.skippedDuplicates > 0) {
      return {
        kind: 'all-duplicates',
        skippedDuplicates: summary.skippedDuplicates,
      }
    }
    const isSummaryEmpty =
      summary.importableCount === 0 && summary.skippedDuplicates === 0
    remainingCount = isSummaryEmpty ? totalCount : summary.importableCount
  }

  return remainingCount > POPUP_IMPORT_BOOKMARK_LIMIT
    ? { kind: 'app' }
    : { kind: 'import', mode }
}

/**
 * Decides how the popup handles several picked files imported as one batch.
 * A single file plans exactly like {@link planPopupImport}. With two or more
 * files the bookmarks left to create are summed across the batch (Skip
 * duplicates carrying across files in pick order) against
 * {@link POPUP_IMPORT_BOOKMARK_LIMIT}; Restore-replace goes to the App page.
 * @param requests The picked files, in pick order, sharing one mode.
 * @returns The plan for the whole batch.
 * @throws {Error} When a format is unsupported or a file has no bookmarks.
 */
export async function planPopupImportBatch(
  requests: PopupImportRequest[],
): Promise<PopupImportPlan> {
  const [first] = requests
  if (!first) throw new Error(i18n.t('import_noBookmarks'))
  if (requests.length === 1) return planPopupImport(first)
  if (first.mode === 'restore-replace') return { kind: 'app' }

  const liveTree = await browser.bookmarks.getTree()
  const liveRootTitles = resolveImportRootTitles(liveTree[0]?.children ?? [])
  const seenUrls = collectExistingUrls(liveTree)
  let remainingCount = 0
  let skippedDuplicates = 0
  for (const request of requests) {
    const { tree } = parseImportFile(
      request.text,
      request.mimeType,
      request.fileName,
      liveRootTitles,
    )
    if (countBookmarks(tree) === 0) {
      throw new Error(i18n.t('import_noBookmarks'))
    }
    if (!request.skipDuplicates) {
      remainingCount += countImportableBookmarks(tree)
      continue
    }
    const dropped = dropDuplicateBookmarks(tree, seenUrls)
    skippedDuplicates += dropped.skippedDuplicates
    remainingCount += countImportableBookmarks(dropped.nodes)
    for (const url of collectExistingUrls(dropped.nodes)) seenUrls.add(url)
  }

  if (remainingCount === 0 && skippedDuplicates > 0) {
    return { kind: 'all-duplicates', skippedDuplicates }
  }
  return remainingCount > POPUP_IMPORT_BOOKMARK_LIMIT
    ? { kind: 'app' }
    : { kind: 'import', mode: first.mode }
}
