import { i18n } from '#i18n'

import { countBookmarks, countImportableBookmarks } from './count-bookmarks'
import { ImportWriter, withImportRollback } from './import-control'
import { withImportLock } from './import-lock'
import { writeCsvTree } from './importers/import-csv'
import { toImportError, writeParsedTree } from './importers/import-json'
import { parseImportFile } from './importers/parse-import'
import {
  loadLiveRootTitles,
  resolveImportRoots,
} from './importers/resolve-roots'
import { runImport } from './run-import'
import { collectExistingUrls, dropDuplicateBookmarks } from './skip-duplicates'
import type {
  ImportMode,
  ImportOptions,
  ImportResult,
  ParsedBookmark,
} from './types'

/**
 * One file of an Import batch.
 */
export interface ImportBatchFile {
  text: string
  mimeType: string
  fileName: string
  /**
   * The file's tree after selection (the import plan's output shape). When
   * set it is written instead of the tree parsed from `text`.
   */
  prunedTree?: ParsedBookmark[]
}

/**
 * Thrown when an Import batch of two or more files asks for Restore-replace,
 * which would let the second file erase the first.
 */
export class ImportBatchReplaceError extends Error {
  constructor() {
    super(i18n.t('importBatchReplaceNeedsOneFile'))
    this.name = 'ImportBatchReplaceError'
  }
}

interface PreparedFile {
  tree: ParsedBookmark[]
  isCsv: boolean
  mode: ImportMode
  folderTitle: string | undefined
}

/**
 * Strips the last extension from a file name, e.g. `work.html` to `work`.
 * @param fileName The name as picked, extension included.
 * @returns The name without its extension, or the name itself when stripping
 *   would leave nothing.
 */
export function stripFileExtension(fileName: string): string {
  const stripped = fileName.replace(/\.[^./\\]*$/, '').trim()
  return stripped === '' ? fileName : stripped
}

/**
 * Imports several files as one batch: the import lock is taken once, one
 * writer is shared (one progress total, one rollback scope), and Skip
 * duplicates carries across files in pick order, so a URL shared by two files
 * is created once. In Folder mode with two or more files every file gets its
 * own folder named after it, extension stripped; a single file keeps
 * "Imported bookmarks", and CSV always reuses that folder. A single-file
 * Restore-replace is delegated to `runImport`, which owns the Safety snapshot,
 * the abort check before deleting and the restore after a failure.
 * @param files The files, in pick order.
 * @param mode How the bookmarks are written; Restore-replace needs one file.
 * @param options Import options; `signal` cancels the whole batch and
 *   `onProgress` reports one total across all files.
 * @returns The summed import result.
 * @throws {ImportBatchReplaceError} For Restore-replace with anything but
 *   exactly one file.
 * @throws {ImportLockHeldError} When another extension page is importing.
 * @throws {ImportCanceledError} After a cancel, once everything the batch
 *   created, in every file, is removed.
 */
export function runImportBatch(
  files: ImportBatchFile[],
  mode: ImportMode,
  options: ImportOptions = {},
): Promise<ImportResult> {
  if (mode !== 'restore-replace') {
    return withImportLock(() => importBatchUnlocked(files, mode, options))
  }
  const [onlyFile] = files
  return onlyFile && files.length === 1
    ? runImport(
        onlyFile.text,
        onlyFile.mimeType,
        mode,
        onlyFile.fileName,
        options,
      )
    : Promise.reject(new ImportBatchReplaceError())
}

async function importBatchUnlocked(
  files: ImportBatchFile[],
  mode: ImportMode,
  options: ImportOptions,
): Promise<ImportResult> {
  const liveRootTitles = await loadLiveRootTitles()
  const liveTree = await browser.bookmarks.getTree()
  const shouldSkipDuplicates = options.skipDuplicates ?? false
  const seenUrls = collectExistingUrls(liveTree)
  const result: ImportResult = { skippedInvalidUrl: 0, skippedDuplicates: 0 }
  const prepared: PreparedFile[] = []

  for (const file of files) {
    const parsed = parseImportFile(
      file.text,
      file.mimeType,
      file.fileName,
      liveRootTitles,
    )
    const isCsv = parsed.format === 'csv'
    const isFolderOnly =
      isCsv || (parsed.format === 'xbel' && !parsed.hasLocationData)
    const fileMode = isFolderOnly ? 'folder' : mode
    let tree = file.prunedTree ?? parsed.tree
    if (shouldSkipDuplicates && fileMode !== 'restore-replace') {
      const dropped = dropDuplicateBookmarks(tree, seenUrls)
      tree = dropped.nodes
      result.skippedDuplicates += dropped.skippedDuplicates
      for (const url of collectExistingUrls(tree)) seenUrls.add(url)
    }
    result.skippedInvalidUrl += parsed.skippedInvalidUrl
    if (files.length > 1 && countBookmarks(tree) === 0) continue
    prepared.push({
      tree,
      isCsv,
      mode: fileMode,
      folderTitle:
        !isCsv && fileMode === 'folder' && files.length > 1
          ? stripFileExtension(file.fileName)
          : undefined,
    })
  }

  const isTrusted = options.trusted ?? false
  let total = 0
  for (const file of prepared) {
    total +=
      isTrusted || file.isCsv
        ? countBookmarks(file.tree)
        : countImportableBookmarks(file.tree)
  }
  const writer = new ImportWriter(options, total, result.skippedDuplicates)
  const root = liveTree[0]
  const { bookmarksBarId, otherBookmarksId, mobileId } = resolveImportRoots(
    root?.children ?? [],
  )

  try {
    await withImportRollback(writer, async () => {
      for (const file of prepared) {
        if (file.isCsv) {
          await writeCsvTree(file.tree, writer)
          continue
        }
        if (!bookmarksBarId || !otherBookmarksId) {
          throw new Error('PROCESS_ERROR')
        }
        await writeParsedTree({
          parsed: file.tree,
          mode: file.mode,
          liveRoot: root,
          bookmarksBarId,
          otherBookmarksId,
          mobileId,
          result,
          writer,
          isTrusted,
          folderTitle: file.folderTitle,
        })
      }
    })
  } catch (error) {
    throw toImportError(error)
  }
  writer.finish()
  return result
}
