import { i18n } from '#i18n'

import { importParsedTree } from '@/lib/importers/import-json'
import { loadLiveRootTitles } from '@/lib/importers/resolve-roots'
import type { ResolvedImportRootTitles } from '@/lib/importers/resolve-roots'
import { isAllowedBookmarkUrl } from '@/lib/importers/url-validation'
import { secondsToMilliseconds } from '@/lib/timestamps'
import type {
  ImportMode,
  ImportOptions,
  ImportResult,
  ParsedBookmark,
} from '@/lib/types'

/**
 * Imports bookmarks from a Netscape-format bookmarks HTML export: parses it
 * and writes the tree through the shared JSON tree writer, so `mode` behaves
 * as in `importParsedTree` (`'folder'`, `'restore-merge'`, `'restore-replace'`).
 * A parse failure is re-wrapped as a load error.
 * @param html The Netscape-format bookmarks HTML to import.
 * @param mode Where the parsed tree is written.
 * @param options Import options such as Skip duplicates.
 * @returns The import result, including how many bookmarks were skipped
 *   because their address is missing or not supported, or duplicated.
 */
export async function importFromHTML(
  html: string,
  mode: ImportMode = 'folder',
  options: ImportOptions = {},
): Promise<ImportResult> {
  let parsed: ParsedBookmark[]
  try {
    parsed = parseHTML(html, await loadLiveRootTitles())
  } catch (error) {
    throw new Error(
      i18n.t('importFromHTMLLoadError', [(error as Error).message]),
    )
  }
  return importParsedTree(parsed, mode, options)
}

/**
 * Parses a Netscape-format bookmarks HTML document into a `ParsedBookmark`
 * tree, using the standard `<DL>`/`<DT>`/`<H3>`/`<A>` structure.
 *
 * Uses `DOMParser`, which is not available in a service worker (e.g. an
 * MV3 background script) — this function must be called from a context
 * that has a `DOMParser` implementation, such as a page or offscreen
 * document.
 *
 * The `<H3 personal_toolbar_folder="true">` attribute is how Netscape-format
 * exports mark the bookmarks bar folder; that folder is mapped to
 * `isBookmarksBar: true` and always placed first in the returned array via
 * `unshift`, regardless of its position in the source document. A top-level
 * `<H3 unfiled_bookmarks_folder="true">` (how Firefox marks its own "Other
 * bookmarks" equivalent) is recognized the same way for Other, and any other
 * top-level `<H3>` is recognized as the Other/Mobile root by a
 * case-insensitive title match — see {@link isKnownOtherTitle} and
 * {@link isKnownMobileTitle} — merging its children into that root instead of
 * nesting a folder for it. Every unmatched top-level bookmark or folder is
 * nested under a synthetic "Other bookmarks" node, unchanged from before.
 * @param html The Netscape-format bookmarks HTML document to parse.
 * @param liveRootTitles The current browser's own root titles (see
 *   `resolveImportRootTitles`), included in the known-title match alongside
 *   the i18n/English-default titles. Omitted when no live browser context is
 *   available (e.g. building an import preview).
 * @returns The parsed bookmark tree.
 */
export function parseHTML(
  html: string,
  liveRootTitles?: ResolvedImportRootTitles,
): ParsedBookmark[] {
  return parseHTMLWithLocation(html, liveRootTitles).tree
}

/**
 * Like {@link parseHTML}, but also reports whether the document carried real
 * location data: a toolbar, unfiled, known-Other or known-Mobile marker. A
 * flat export (only top-level bookmarks and unrecognized folders) gets a
 * synthetic Other root but reports `hasLocationData: false`.
 * @param html The Netscape-format bookmarks HTML document to parse.
 * @param liveRootTitles The current browser's own root titles, if available.
 * @returns The parsed tree and whether a root marker was recognized.
 */
export function parseHTMLWithLocation(
  html: string,
  liveRootTitles?: ResolvedImportRootTitles,
): { tree: ParsedBookmark[]; hasLocationData: boolean } {
  let hasLocationData = false
  const document = new DOMParser().parseFromString(html, 'text/html')
  const result: ParsedBookmark[] = []
  const otherBookmarks: ParsedBookmark[] = []
  const mobileBookmarks: ParsedBookmark[] = []

  const outerDl =
    document.querySelector('body > dl') ?? document.querySelector('dl')
  if (!outerDl) return { tree: result, hasLocationData }

  const nestedToolbarFolders: ParsedBookmark[] = []
  const topLevelDts = outerDl.querySelectorAll(':scope > dt')

  topLevelDts.forEach((dt) => {
    const firstChild = dt.firstElementChild
    if (!firstChild) return

    if (firstChild.tagName === 'A') {
      otherBookmarks.push(parseBookmarkElement(firstChild as HTMLAnchorElement))
    } else if (firstChild.tagName === 'H3') {
      const h3 = firstChild as HTMLElement
      const isBookmarksBar =
        h3.hasAttribute('personal_toolbar_folder') &&
        h3.getAttribute('personal_toolbar_folder') === 'true'
      const isUnfiled =
        h3.hasAttribute('unfiled_bookmarks_folder') &&
        h3.getAttribute('unfiled_bookmarks_folder') === 'true'

      const folder = parseFolderElement(h3, dt, nestedToolbarFolders)

      if (isBookmarksBar) {
        hasLocationData = true
        folder.isBookmarksBar = true
        result.unshift(folder)
      } else if (isUnfiled || isKnownOtherTitle(folder.title, liveRootTitles)) {
        hasLocationData = true
        otherBookmarks.push(...(folder.children ?? []))
      } else if (isKnownMobileTitle(folder.title, liveRootTitles)) {
        hasLocationData = true
        mobileBookmarks.push(...(folder.children ?? []))
      } else {
        otherBookmarks.push(folder)
      }
    }
  })

  for (const folder of nestedToolbarFolders) {
    hasLocationData = true
    folder.isBookmarksBar = true
    result.unshift(folder)
  }

  if (otherBookmarks.length > 0) {
    result.push({
      isOtherBookmarks: true,
      title: i18n.t('otherBookmarks'),
      dateAdded: Date.now(),
      children: otherBookmarks,
    })
  }

  if (mobileBookmarks.length > 0) {
    result.push({
      isMobileBookmarks: true,
      title: i18n.t('mobileBookmarks'),
      dateAdded: Date.now(),
      children: mobileBookmarks,
    })
  }

  return { tree: result, hasLocationData }
}

/**
 * Whether `title` case-insensitively matches a known "Other bookmarks" root
 * title: the current browser's own Other root title (from `liveRootTitles`,
 * when available), the localized `otherBookmarks` i18n string, or the
 * English default "Other bookmarks".
 * @param title The top-level `<H3>` folder title to check.
 * @param liveRootTitles The current browser's own root titles, if available.
 * @returns Whether `title` identifies the Other bookmarks root.
 */
function isKnownOtherTitle(
  title: string,
  liveRootTitles?: ResolvedImportRootTitles,
): boolean {
  return buildKnownTitleSet(
    liveRootTitles?.otherBookmarksTitle,
    i18n.t('otherBookmarks'),
    'Other bookmarks',
  ).has(title.toLowerCase())
}

/**
 * Whether `title` case-insensitively matches a known Mobile bookmarks root
 * title: the current browser's own Mobile root title (from `liveRootTitles`,
 * when available), the localized `mobileBookmarks` i18n string, or the
 * English default "Mobile bookmarks".
 * @param title The top-level `<H3>` folder title to check.
 * @param liveRootTitles The current browser's own root titles, if available.
 * @returns Whether `title` identifies the Mobile bookmarks root.
 */
function isKnownMobileTitle(
  title: string,
  liveRootTitles?: ResolvedImportRootTitles,
): boolean {
  return buildKnownTitleSet(
    liveRootTitles?.mobileTitle,
    i18n.t('mobileBookmarks'),
    'Mobile bookmarks',
  ).has(title.toLowerCase())
}

/**
 * Classifies a top-level folder title as one of the three browser roots by a
 * case-insensitive match against the current browser's own root titles, the
 * localized i18n titles and the English defaults.
 * @param title The top-level folder title to classify.
 * @param liveRootTitles The current browser's own root titles, if available.
 * @returns `'bar'`, `'other'` or `'mobile'`, or `undefined` when `title` is
 *   not a root title.
 */
export function classifyRootTitle(
  title: string,
  liveRootTitles?: ResolvedImportRootTitles,
): 'bar' | 'other' | 'mobile' | undefined {
  const isBar = buildKnownTitleSet(
    liveRootTitles?.bookmarksBarTitle,
    i18n.t('bookmarksBar'),
    'Bookmarks bar',
  ).has(title.toLowerCase())
  if (isBar) return 'bar'
  if (isKnownOtherTitle(title, liveRootTitles)) return 'other'
  return isKnownMobileTitle(title, liveRootTitles) ? 'mobile' : undefined
}

/**
 * Builds a lowercased set of the non-empty candidate titles, for a
 * case-insensitive `Set.has` lookup.
 * @param candidates The candidate titles, some possibly `undefined`.
 * @returns The lowercased, non-empty candidate titles.
 */
function buildKnownTitleSet(
  ...candidates: (string | undefined)[]
): Set<string> {
  return new Set(
    candidates
      .filter((title): title is string => !!title)
      .map((title) => title.toLowerCase()),
  )
}

/**
 * Parses a single `<A>` element into a bookmark. The `add_date` attribute
 * is a Unix timestamp in seconds (the Netscape export format), so it's
 * multiplied by 1000 to match the millisecond timestamps `Date.now()` and
 * the rest of this codebase use. Falls back to the current time when
 * `add_date` is absent. The `href` is validated with `isAllowedBookmarkUrl`;
 * a missing, invalid, or disallowed-scheme `href` all result in an
 * `undefined` `url`.
 * @param a The anchor element to parse.
 * @returns The parsed bookmark.
 */
function parseBookmarkElement(a: HTMLAnchorElement): ParsedBookmark {
  const dateAddedAttribute = a.getAttribute('add_date')
  const href = a.getAttribute('href') ?? undefined

  const url = isAllowedBookmarkUrl(href) ? href : undefined

  return {
    title: a.textContent?.trim() ?? '',
    url,
    dateAdded: dateAddedAttribute
      ? secondsToMilliseconds(parseInt(dateAddedAttribute))
      : Date.now(),
  }
}

/**
 * Finds the `<DL>` holding a folder's children. The HTML parser closes the
 * `<DT>` at a `<DD>` description, so the `<DL>` may sit inside the `<DT>`,
 * right after it, or inside (or right after) a following `<DD>`.
 * @param dt The `<DT>` element wrapping the folder heading.
 * @returns The child `<DL>`, or `null` when the folder has none.
 */
function findChildDl(dt: Element): Element | null {
  const inside = dt.querySelector(':scope > dl')
  if (inside) return inside
  const next = dt.nextElementSibling
  if (next?.tagName === 'DL') return next
  if (next?.tagName === 'DD') {
    const insideDescription = next.querySelector(':scope > dl')
    if (insideDescription) return insideDescription
    const afterDescription = next.nextElementSibling
    if (afterDescription?.tagName === 'DL') return afterDescription
  }
  return null
}

/**
 * Parses an `<H3>` folder heading and its sibling/nested `<DL>` into a
 * folder node, recursing into nested bookmarks and folders. Like
 * `parseBookmarkElement`, `add_date` and `last_modified` are Unix
 * timestamps in seconds and are converted to milliseconds.
 * @param h3 The folder heading element.
 * @param dt The `<DT>` element wrapping `h3` and its sibling/nested `<DL>`.
 * @param hoistedToolbarFolders Collects any `PERSONAL_TOOLBAR_FOLDER` folder
 *   found nested below this one, so it is lifted out instead of nested.
 * @returns The parsed folder node.
 */
function parseFolderElement(
  h3: HTMLElement,
  dt: Element,
  hoistedToolbarFolders?: ParsedBookmark[],
): ParsedBookmark {
  const dateAddedAttribute = h3.getAttribute('add_date')
  const lastModifiedAttribute = h3.getAttribute('last_modified')

  const folder: ParsedBookmark = {
    title: h3.textContent?.trim() ?? '',
    dateAdded: dateAddedAttribute
      ? secondsToMilliseconds(parseInt(dateAddedAttribute))
      : Date.now(),
    dateGroupModified: lastModifiedAttribute
      ? secondsToMilliseconds(parseInt(lastModifiedAttribute))
      : Date.now(),
    children: [],
  }

  const childDl = findChildDl(dt)

  if (childDl) {
    const childDts = childDl.querySelectorAll(':scope > dt')
    childDts.forEach((childDt) => {
      const firstChild = childDt.firstElementChild
      if (!firstChild) return

      if (firstChild.tagName === 'A') {
        folder.children!.push(
          parseBookmarkElement(firstChild as HTMLAnchorElement),
        )
      } else if (firstChild.tagName === 'H3') {
        const childH3 = firstChild as HTMLElement
        const childFolder = parseFolderElement(
          childH3,
          childDt,
          hoistedToolbarFolders,
        )
        if (
          hoistedToolbarFolders &&
          childH3.getAttribute('personal_toolbar_folder') === 'true'
        ) {
          hoistedToolbarFolders.push(childFolder)
        } else {
          folder.children!.push(childFolder)
        }
      }
    })
  }

  return folder
}
