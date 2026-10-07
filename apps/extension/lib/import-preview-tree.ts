import type { PlanNode } from './import-plan'
import type { BookmarkNode } from './types'

/**
 * Maps the import plan's display tree to the nodes the read-only
 * `BookmarkTreeView` renders. A duplicate becomes a disabled node (a muted
 * row the caller badges) only when `shouldMarkDuplicates` is on, so with Skip
 * duplicates off no row is marked.
 * @param nodes The plan's display tree.
 * @param shouldMarkDuplicates Whether duplicates are shown as skipped.
 * @returns The tree nodes, keeping the plan's path ids.
 */
export function toPreviewNodes(
  nodes: readonly PlanNode[],
  shouldMarkDuplicates: boolean,
): BookmarkNode[] {
  return nodes.map((node): BookmarkNode => {
    if (node.kind === 'folder') {
      return {
        id: node.id,
        title: node.title,
        children: toPreviewNodes(node.children, shouldMarkDuplicates),
      }
    }
    const isSkipped = shouldMarkDuplicates && node.state.status === 'duplicate'
    return {
      id: node.id,
      title: node.title,
      url: node.url,
      ...(isSkipped && { isDisabled: true }),
    }
  })
}
