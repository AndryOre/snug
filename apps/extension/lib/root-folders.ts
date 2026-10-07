import type { ExtendedBookmarkTreeNode } from '@/lib/types'

/**
 * Chrome's fixed bookmark root folder ids: the virtual root that parents the
 * real roots, the bookmarks bar, "Other bookmarks", and Mobile bookmarks.
 */
export const ROOT_FOLDER_IDS = {
  virtualRoot: '0',
  bookmarksBar: '1',
  otherBookmarks: '2',
  mobileBookmarks: '3',
} as const

type RootCandidate = Pick<ExtendedBookmarkTreeNode, 'id' | 'folderType'>

/**
 * Whether a node is the bookmarks bar. Matches the browser's `folderType`
 * marker (which also covers account-stored bookmark roots with other ids) or
 * the legacy fixed id `'1'`.
 * @param node The node to test.
 * @returns `true` for a bookmarks bar root.
 */
export function isBookmarksBar(node: RootCandidate): boolean {
  return (
    node.folderType === 'bookmarks-bar' ||
    node.id === ROOT_FOLDER_IDS.bookmarksBar
  )
}

/**
 * Whether a node is "Other bookmarks". Matches the browser's `folderType`
 * marker (which also covers account-stored bookmark roots with other ids) or
 * the legacy fixed id `'2'`.
 * @param node The node to test.
 * @returns `true` for an Other bookmarks root.
 */
export function isOtherBookmarks(node: RootCandidate): boolean {
  return (
    node.folderType === 'other' || node.id === ROOT_FOLDER_IDS.otherBookmarks
  )
}
