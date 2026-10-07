import { countImportableBookmarks } from './count-bookmarks'
import { parseImportFile } from './importers/parse-import'
import { resolveImportRootTitles } from './importers/resolve-roots'
import { collectExistingUrls, dropDuplicateBookmarks } from './skip-duplicates'

/**
 * What Skip duplicates would do to an import file.
 */
export interface ImportDuplicateSummary {
  skippedDuplicates: number
  importableCount: number
}

/**
 * Previews Skip duplicates for an import file against the live bookmarks tree
 * using the same filter the importers apply, so `importableCount` equals the
 * number of bookmarks that will actually be created. Never throws: an
 * unreadable file yields zeros.
 * @param text The raw file content.
 * @param mimeType The file's MIME type.
 * @param fileName The file's name, a fallback format hint.
 * @returns How many bookmarks would be skipped and how many would be created.
 */
export async function summarizeImportDuplicates(
  text: string,
  mimeType: string,
  fileName?: string,
): Promise<ImportDuplicateSummary> {
  try {
    const liveTree = await browser.bookmarks.getTree()
    const { tree } = parseImportFile(
      text,
      mimeType,
      fileName,
      resolveImportRootTitles(liveTree[0]?.children ?? []),
    )
    const { nodes, skippedDuplicates } = dropDuplicateBookmarks(
      tree,
      collectExistingUrls(liveTree),
    )
    return {
      skippedDuplicates,
      importableCount: countImportableBookmarks(nodes),
    }
  } catch {
    return { skippedDuplicates: 0, importableCount: 0 }
  }
}
