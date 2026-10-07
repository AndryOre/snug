import type { BookmarkNode, CheckedState } from '@/lib/types'

/**
 * Collects the ids of every bookmark (node with a `url`) under `nodes`,
 * disabled ones included.
 * @param nodes The nodes to walk.
 * @returns The bookmark ids in document order.
 */
export function collectBookmarkIds(nodes: BookmarkNode[]): string[] {
  const ids: string[] = []
  for (const node of nodes) {
    if (node.url) {
      ids.push(node.id)
    } else if (node.children) {
      ids.push(...collectBookmarkIds(node.children))
    }
  }
  return ids
}

/**
 * Collects the ids of the bookmarks under `nodes` that can be selected,
 * skipping disabled ones.
 * @param nodes The nodes to walk.
 * @returns The selectable bookmark ids in document order.
 */
export function collectSelectableIds(nodes: BookmarkNode[]): string[] {
  const ids: string[] = []
  for (const node of nodes) {
    if (node.isDisabled) continue
    if (node.url) {
      ids.push(node.id)
    } else if (node.children) {
      ids.push(...collectSelectableIds(node.children))
    }
  }
  return ids
}

export function collectFolderIds(nodes: BookmarkNode[]): string[] {
  const ids: string[] = []
  for (const node of nodes) {
    if (node.url || !node.children) continue
    ids.push(node.id, ...collectFolderIds(node.children))
  }
  return ids
}

/**
 * Derives a folder's checkbox state from its selectable descendant
 * bookmarks: `false` when none are checked, `true` when all are,
 * `'indeterminate'` otherwise. Folders never store their own checked state
 * (see {@link CheckedState}).
 * @param children The folder's direct children.
 * @param checkedState The current per-bookmark checked-id map.
 * @returns The derived checked state for the folder.
 */
export function determineCheckedState(
  children: BookmarkNode[],
  checkedState: Map<string, boolean>,
): CheckedState {
  const bookmarkIds = collectSelectableIds(children)
  if (bookmarkIds.length === 0) return false

  const checkedCount = bookmarkIds.filter((id) => checkedState.get(id)).length
  return (
    checkedCount !== 0 &&
    (checkedCount === bookmarkIds.length || 'indeterminate')
  )
}

export function filterNodes(
  nodes: BookmarkNode[],
  term: string,
): BookmarkNode[] {
  const lower = term.toLowerCase()
  const result: BookmarkNode[] = []
  for (const node of nodes) {
    if (node.url) {
      if (isSearchMatch(node, lower)) result.push(node)
    } else {
      if (isSearchMatch(node, lower)) {
        result.push(node)
        continue
      }
      const matchedChildren = filterNodes(node.children ?? [], lower)
      if (matchedChildren.length > 0) {
        result.push({ ...node, children: matchedChildren })
      }
    }
  }
  return result
}

function isSearchMatch(node: BookmarkNode, lowerTerm: string): boolean {
  return (
    node.title.toLowerCase().includes(lowerTerm) ||
    (node.url?.toLowerCase().includes(lowerTerm) ?? false)
  )
}

export function findAncestorsOfMatches(
  nodes: BookmarkNode[],
  term: string,
): string[] {
  const lower = term.toLowerCase()
  const ancestors: string[] = []

  function hasMatchingDescendant(nodes: BookmarkNode[]): boolean {
    let didMatch = false
    for (const node of nodes) {
      if (node.url) {
        if (isSearchMatch(node, lower)) didMatch = true
      } else {
        const didChildMatch = hasMatchingDescendant(node.children ?? [])
        if (didChildMatch || isSearchMatch(node, lower)) {
          ancestors.push(node.id)
          didMatch = true
        }
      }
    }
    return didMatch
  }

  hasMatchingDescendant(nodes)
  return ancestors
}
