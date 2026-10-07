import { i18n } from '#i18n'
import type { Browser } from '@wxt-dev/browser'
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

import { collectBookmarkIds } from '@/lib/bookmark-tree-nodes'
import { autoExpandFoldersStore } from '@/lib/storage'
import type {
  BookmarkNode,
  BookmarkTreeHandle,
  BookmarkTreeProperties,
  BookmarkTreeViewHandle,
  ExtendedBookmarkTreeNode,
} from '@/lib/types'
import { useStorageItem } from '@/lib/use-storage-item'

import { BookmarkTreeView } from './bookmark-tree-view'

const BOOKMARK_CHANGE_DEBOUNCE_MS = 150

/**
 * The Export page's live bookmark tree: loads the browser's bookmarks into
 * {@link BookmarkTreeView}, reloads when they change, and prunes the live
 * tree down to the checked ids on export. Exposes an imperative handle (see
 * {@link BookmarkTreeHandle}) so the parent can drive selection and
 * refreshes without lifting the checked-state map into props.
 */
export const BookmarkTree = forwardRef<
  BookmarkTreeHandle,
  BookmarkTreeProperties
>(function BookmarkTree(
  {
    searchTerm,
    onSelectionChange,
    onTotalChange,
    className,
    loadingState,
    emptyState,
    noBookmarksState,
    errorState,
  },
  reference,
) {
  const [nodes, setNodes] = useState<BookmarkNode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasLoadError, setHasLoadError] = useState(false)
  const [autoExpandToken, setAutoExpandToken] = useState(0)
  const viewReference = useRef<BookmarkTreeViewHandle>(null)

  const [autoExpandFolders] = useStorageItem(autoExpandFoldersStore)

  const loadBookmarks = useCallback(
    async (options: { shouldKeepExpansion?: boolean } = {}) => {
      try {
        const tree = await fetchFullTree()
        const rootNode = tree[0]
        const withParentId = addParentIds(rootNode?.children ?? [])
        setNodes(withParentId)
        setHasLoadError(false)
        setIsLoading(false)

        if (!autoExpandFolders || options.shouldKeepExpansion) return

        setAutoExpandToken((token) => token + 1)
      } catch {
        setHasLoadError(true)
        setIsLoading(false)
      }
    },
    [autoExpandFolders],
  )

  useImperativeHandle(reference, () => ({
    selectAll: () => viewReference.current?.selectAll(),
    deselectAll: () => viewReference.current?.deselectAll(),
    areAllVisibleSelected: () =>
      viewReference.current?.areAllVisibleSelected() ?? false,
    expandAll: () => viewReference.current?.expandAll(),
    collapseAll: () => viewReference.current?.collapseAll(),
    refresh: async () => {
      await loadBookmarks()
      viewReference.current?.clearSelection()
    },
    /**
     * Re-fetches the live bookmark tree — rather than reusing the `nodes`
     * state, which may be stale relative to the browser — and prunes it
     * down to just the checked ids, so exports always reflect the
     * browser's current bookmarks.
     * @returns The selected bookmarks, pruned to the minimal containing folders.
     */
    getSelectedBookmarks: async () => {
      const tree = await fetchFullTree()
      const checkedIds = new Set(viewReference.current?.getCheckedIds())
      return pruneTree(tree, checkedIds)
    },
  }))

  useEffect(() => {
    const load = async () => {
      await loadBookmarks()
    }
    void load()
  }, [loadBookmarks])

  /**
   * Reloads the tree (keeping the user's expansion) whenever the browser
   * adds, removes, edits or moves a bookmark, coalescing bursts such as an
   * import into a single reload.
   */
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const scheduleReload = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        void loadBookmarks({ shouldKeepExpansion: true })
      }, BOOKMARK_CHANGE_DEBOUNCE_MS)
    }
    const events = [
      browser.bookmarks.onCreated,
      browser.bookmarks.onRemoved,
      browser.bookmarks.onChanged,
      browser.bookmarks.onMoved,
    ]
    for (const event of events) event.addListener(scheduleReload)
    return () => {
      clearTimeout(timer)
      for (const event of events) event.removeListener(scheduleReload)
    }
  }, [loadBookmarks])

  function handleRetry() {
    setHasLoadError(false)
    setIsLoading(true)
    void loadBookmarks()
  }

  function resolvePlaceholder() {
    if (hasLoadError && errorState) return errorState(handleRetry)
    if (isLoading && loadingState) return loadingState
    const hasNoBookmarks = !isLoading && collectBookmarkIds(nodes).length === 0
    return hasNoBookmarks ? noBookmarksState : null
  }

  return (
    <BookmarkTreeView
      ref={viewReference}
      nodes={nodes}
      searchTerm={searchTerm}
      ariaLabel={i18n.t('exportPage_treeLabel')}
      autoExpandToken={autoExpandToken}
      onSelectionChange={onSelectionChange}
      onTotalChange={onTotalChange}
      className={className}
      placeholder={resolvePlaceholder()}
      emptyState={emptyState}
    />
  )
})

/**
 * Converts raw `browser.bookmarks` nodes into this component's
 * {@link BookmarkNode} shape, filling in each node's `parentId`
 * explicitly (the root's children are treated as top-level, i.e. their own
 * `parentId` is kept) so descendants don't depend on the live API object.
 * @param nodes The raw `browser.bookmarks` nodes to convert.
 * @param parentId The parent id to assign to top-level `nodes`.
 * @returns The converted nodes, with `parentId` filled in throughout.
 */
function addParentIds(
  nodes: Browser.bookmarks.BookmarkTreeNode[],
  parentId?: string,
): BookmarkNode[] {
  return nodes.map((node) => ({
    id: node.id,
    title: node.title,
    url: node.url,
    parentId: parentId ?? node.parentId,
    children: node.children ? addParentIds(node.children, node.id) : undefined,
  }))
}

async function fetchFullTree(): Promise<Browser.bookmarks.BookmarkTreeNode[]> {
  return browser.bookmarks.getTree()
}

/**
 * Filters a raw bookmark tree down to checked bookmarks, keeping only the
 * folders needed to contain them — a folder with no checked descendants is
 * dropped entirely rather than kept empty.
 * @param tree The raw bookmark tree to prune.
 * @param checkedIds The ids of the checked bookmarks.
 * @returns The pruned tree, containing only checked bookmarks and their ancestors.
 */
function pruneTree(
  tree: Browser.bookmarks.BookmarkTreeNode[],
  checkedIds: ReadonlySet<string>,
): ExtendedBookmarkTreeNode[] {
  function prune(
    nodes: Browser.bookmarks.BookmarkTreeNode[],
  ): ExtendedBookmarkTreeNode[] {
    const result: ExtendedBookmarkTreeNode[] = []
    for (const node of nodes) {
      if (node.url) {
        if (checkedIds.has(node.id)) {
          result.push(node as ExtendedBookmarkTreeNode)
        }
      } else if (node.children) {
        const prunedChildren = prune(node.children)
        if (prunedChildren.length > 0) {
          result.push({
            ...(node as ExtendedBookmarkTreeNode),
            children: prunedChildren,
          })
        }
      }
    }
    return result
  }

  return prune(tree[0]?.children ?? [])
}
