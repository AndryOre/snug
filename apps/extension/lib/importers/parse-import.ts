import { i18n } from '#i18n'

import { detectFormat } from '@/lib/detect-format'
import { parseChromeBookmarks } from '@/lib/importers/import-chrome'
import { parseCSVTree } from '@/lib/importers/import-csv'
import { parseHTMLWithLocation } from '@/lib/importers/import-html'
import {
  normalizeJsonRoot,
  preprocessBookmarks,
} from '@/lib/importers/import-json'
import { parseSafari } from '@/lib/importers/import-safari'
import { parseXBEL } from '@/lib/importers/import-xbel'
import type { ResolvedImportRootTitles } from '@/lib/importers/resolve-roots'
import { parseJsonOnce } from '@/lib/parse-json-once'
import type { BookmarkFormat, ParsedBookmark } from '@/lib/types'

/**
 * A parsed import file: the normalized root tree and whether it carries
 * location data (a bookmarks bar, Other or Mobile root), which decides if the
 * Restore modes are offered.
 */
export interface ParsedImport {
  tree: ParsedBookmark[]
  hasLocationData: boolean
}

function withRootDetection(tree: ParsedBookmark[]): ParsedImport {
  return {
    tree,
    hasLocationData: tree.some(
      (node) =>
        node.isBookmarksBar || node.isOtherBookmarks || node.isMobileBookmarks,
    ),
  }
}

const jsonImportCache: { text?: string; parsed?: ParsedImport } = {}

/**
 * Normalizes a plain JSON export, remembering the last result so the preview,
 * the duplicate summary and the import of one picked file share it. The
 * preprocessing mutates the raw parsed tree, so it must run only once per
 * parse; the returned tree is read-only for callers.
 * @param text The raw JSON content.
 * @returns The normalized root tree.
 * @throws {SyntaxError} When `text` is not valid JSON.
 */
function parseJsonImport(text: string): ParsedImport {
  if (jsonImportCache.text === text && jsonImportCache.parsed) {
    return jsonImportCache.parsed
  }
  const roots = normalizeJsonRoot(parseJsonOnce(text))
  const parsed = withRootDetection(preprocessBookmarks(roots))
  jsonImportCache.text = text
  jsonImportCache.parsed = parsed
  return parsed
}

/**
 * Parses the location-aware formats (HTML, JSON, Chrome `Bookmarks`, XBEL and
 * Safari) into a normalized root tree without writing anything. The single
 * place the preview, the duplicate summary and the importers agree on the
 * tree for a given format.
 * @param text The raw file content.
 * @param format The detected format.
 * @param liveRootTitles The current browser's own root titles, if available.
 * @returns The parsed tree, or `undefined` for formats without location data
 *   (CSV, unknown).
 * @throws {Error} When the content is malformed for its format.
 */
export function parseLocationAwareImport(
  text: string,
  format: BookmarkFormat,
  liveRootTitles?: ResolvedImportRootTitles,
): ParsedImport | undefined {
  switch (format) {
    case 'html': {
      return parseHTMLWithLocation(text, liveRootTitles)
    }
    case 'json': {
      return parseJsonImport(text)
    }
    case 'chrome': {
      return withRootDetection(parseChromeBookmarks(text))
    }
    case 'safari': {
      return withRootDetection(parseSafari(text, liveRootTitles))
    }
    case 'xbel': {
      return parseXBEL(text, liveRootTitles)
    }
    default: {
      return undefined
    }
  }
}

/**
 * A parsed import file of any supported format. Discriminated on `format`: CSV
 * never carries location data and is the only format that can skip rows while
 * parsing.
 */
export type ParsedImportFile =
  | {
      format: 'csv'
      tree: ParsedBookmark[]
      hasLocationData: false
      skippedInvalidUrl: number
    }
  | {
      format: Exclude<BookmarkFormat, 'csv' | 'unknown'>
      tree: ParsedBookmark[]
      hasLocationData: boolean
      skippedInvalidUrl: 0
    }

/**
 * Parses the raw content of an import file of any of the seven formats into a
 * tree, without writing anything. The one entry the import, the preview and
 * the duplicate summary all go through.
 * @param text The raw file content.
 * @param mimeType The file's MIME type, used to help detect its format.
 * @param fileName The file's name, a fallback hint when the MIME type fails.
 * @param liveRootTitles The current browser's own root titles, if available.
 * @returns The tree, detected format, location-data flag and the count of rows
 *   skipped as unusable while parsing.
 * @throws {Error} When the format is unsupported or the content is malformed.
 */
export function parseImportFile(
  text: string,
  mimeType: string,
  fileName?: string,
  liveRootTitles?: ResolvedImportRootTitles,
): ParsedImportFile {
  const format = detectFormat(text, mimeType, fileName)
  switch (format) {
    case 'csv': {
      const { tree, skippedInvalidUrl } = parseCSVTree(text)
      return { format, tree, hasLocationData: false, skippedInvalidUrl }
    }
    case 'unknown': {
      throw new Error(i18n.t('unsupportedFileFormat'))
    }
    default: {
      const parsed = parseLocationAwareImport(text, format, liveRootTitles)
      return {
        format,
        tree: parsed?.tree ?? [],
        hasLocationData: parsed?.hasLocationData ?? false,
        skippedInvalidUrl: 0,
      }
    }
  }
}
