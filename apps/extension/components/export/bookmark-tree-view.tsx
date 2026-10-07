import { defaultRangeExtractor, useVirtualizer } from '@tanstack/react-virtual'
import { cn } from 'cn'
import { Check, File, Folder, Minus } from 'lucide-react'
import type { ReactNode } from 'react'
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  collectBookmarkIds,
  collectFolderIds,
  collectSelectableIds,
  determineCheckedState,
  filterNodes,
  findAncestorsOfMatches,
} from '@/lib/bookmark-tree-nodes'
import { getFaviconUrl } from '@/lib/favicon'
import { formatCount } from '@/lib/format-count'
import { showBookmarkIconStore } from '@/lib/storage'
import {
  flattenVisibleRows,
  resolveTreeKey,
  withPinnedIndex,
} from '@/lib/tree-navigation'
import type { FlatTreeRow } from '@/lib/tree-navigation'
import type {
  BookmarkNode,
  BookmarkTreeViewHandle,
  BookmarkTreeViewProperties,
  CheckedState,
} from '@/lib/types'
import { useStorageItem } from '@/lib/use-storage-item'

const TREE_ROW_HEIGHT_PX = 30
const TREE_OVERSCAN_ROWS = 10

/**
 * Renders a tree of {@link BookmarkNode}s passed in as a prop, following the
 * WAI-ARIA tree pattern: a single tab stop with roving focus, arrow-key
 * navigation, search, virtualization and focus recovery. With
 * `isSelectable` it also shows checkboxes and tracks the selection
 * (exposed as `aria-checked`); disabled nodes get no checkbox and are skipped
 * by select-all and {@link BookmarkTreeViewHandle.getCheckedIds}. It knows
 * nothing about where nodes come from: wrappers own fetching and reloading.
 */
export const BookmarkTreeView = forwardRef<
  BookmarkTreeViewHandle,
  BookmarkTreeViewProperties
>(function BookmarkTreeView(
  {
    nodes,
    searchTerm,
    ariaLabel,
    isSelectable = true,
    renderBadge,
    autoExpandToken,
    onSelectionChange,
    onTotalChange,
    className,
    placeholder,
    emptyState,
  },
  reference,
) {
  /**
   * Checked state for leaf (bookmark) nodes only, keyed by bookmark id.
   * Folder checked/indeterminate state is never stored here — it's derived
   * from descendant bookmarks at render time by `determineCheckedState`.
   */
  const [checkedState, setCheckedState] = useState<Map<string, boolean>>(
    new Map(),
  )
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [focusedId, setFocusedId] = useState<string | undefined>()
  const treeReference = useRef<HTMLDivElement>(null)
  const isFocusInTreeReference = useRef(false)
  const pendingFocusReference = useRef<string | undefined>(undefined)
  const appliedExpandTokenReference = useRef<number | undefined>(undefined)
  /**
   * Snapshot of `expandedFolders` from just before a search started, so it
   * can be restored once the search term is cleared. `null` means no
   * search-driven expansion is currently in effect.
   */
  const preSearchExpandedReference = useRef<Set<string> | null>(null)

  const [showBookmarkIcon] = useStorageItem(showBookmarkIconStore)

  const isSearching = searchTerm.trim() !== ''
  const visibleNodes = useMemo(
    () => (isSearching ? filterNodes(nodes, searchTerm) : nodes),
    [isSearching, nodes, searchTerm],
  )

  useImperativeHandle(reference, () => ({
    selectAll: () => {
      if (!isSelectable) return
      const visibleBookmarkIds = collectSelectableIds(visibleNodes)
      setCheckedState((previous) => {
        const next = new Map(previous)
        for (const id of visibleBookmarkIds) next.set(id, true)
        return next
      })
    },
    deselectAll: () => {
      if (!isSearching) {
        setCheckedState(new Map())
        return
      }
      const visibleBookmarkIds = collectSelectableIds(visibleNodes)
      setCheckedState((previous) => {
        const next = new Map(previous)
        for (const id of visibleBookmarkIds) next.delete(id)
        return next
      })
    },
    clearSelection: () => {
      setCheckedState(new Map())
    },
    areAllVisibleSelected: () => {
      const visibleBookmarkIds = collectSelectableIds(visibleNodes)
      return (
        visibleBookmarkIds.length > 0 &&
        visibleBookmarkIds.every((id) => checkedState.get(id) === true)
      )
    },
    expandAll: () => {
      setExpandedFolders(new Set(collectFolderIds(nodes)))
    },
    collapseAll: () => {
      setExpandedFolders(new Set())
    },
    getCheckedIds: () =>
      isSelectable
        ? collectSelectableIds(nodes).filter((id) => checkedState.get(id))
        : [],
  }))

  /**
   * Expands every folder when `autoExpandToken` changes to a value that has
   * not been applied yet, so a reload that keeps the user's expansion simply
   * leaves the token alone.
   */
  useEffect(() => {
    if (
      autoExpandToken === undefined ||
      appliedExpandTokenReference.current === autoExpandToken
    ) {
      return
    }
    appliedExpandTokenReference.current = autoExpandToken
    setExpandedFolders(new Set(collectFolderIds(nodes)))
  }, [autoExpandToken, nodes])

  /**
   * Drives the search UX: while a search term is active, expands every
   * folder that contains a match, after first snapshotting the
   * then-current expanded set into `preSearchExpandedReference`. Once the
   * term is cleared, restores that snapshot instead of leaving the
   * search-driven expansion in place.
   */
  useEffect(() => {
    if (!searchTerm.trim()) {
      if (preSearchExpandedReference.current !== null) {
        setExpandedFolders(preSearchExpandedReference.current)
        preSearchExpandedReference.current = null
      }
      return
    }
    setExpandedFolders((current) => {
      if (preSearchExpandedReference.current === null) {
        preSearchExpandedReference.current = new Set(current)
      }
      return new Set(findAncestorsOfMatches(nodes, searchTerm))
    })
  }, [searchTerm, nodes])

  useEffect(() => {
    onTotalChange(collectSelectableIds(nodes).length)
  }, [nodes, onTotalChange])

  useEffect(() => {
    const count = collectSelectableIds(nodes).filter((id) =>
      checkedState.get(id),
    ).length
    onSelectionChange(isSelectable ? count : 0)
  }, [checkedState, nodes, isSelectable, onSelectionChange])

  const rows = useMemo(
    () => flattenVisibleRows(visibleNodes, expandedFolders),
    [visibleNodes, expandedFolders],
  )
  const activeId = rows.some((row) => row.node.id === focusedId)
    ? focusedId
    : rows[0]?.node.id

  const activeIndex = rows.findIndex((row) => row.node.id === activeId)
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual's documented hook; its returned functions are not passed to memoized children
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => treeReference.current,
    estimateSize: () => TREE_ROW_HEIGHT_PX,
    getItemKey: (index) => rows[index]?.node.id ?? index,
    overscan: TREE_OVERSCAN_ROWS,
    rangeExtractor: (range) =>
      withPinnedIndex(defaultRangeExtractor(range), activeIndex),
  })

  /**
   * Restores keyboard focus when the focused row leaves the tree (a search
   * excludes it or the bookmark is deleted) while focus was inside the tree:
   * the browser would otherwise drop focus to the body.
   */
  useEffect(() => {
    if (activeId === undefined || !isFocusInTreeReference.current) return
    const activeElement = document.activeElement
    if (activeElement && activeElement !== document.body) return
    pendingFocusReference.current = activeId
  }, [rows, activeId])

  useEffect(() => {
    const pendingId = pendingFocusReference.current
    if (pendingId === undefined) return
    const target = [
      ...(treeReference.current?.querySelectorAll<HTMLElement>(
        '[role="treeitem"]',
      ) ?? []),
    ].find((element) => element.dataset.nodeId === pendingId)
    if (!target) return
    pendingFocusReference.current = undefined
    target.focus()
  })

  function handleToggleExpand(id: string) {
    setExpandedFolders((previous) => {
      const next = new Set(previous)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function setFolderExpanded(id: string, isExpanded: boolean) {
    setExpandedFolders((previous) => {
      const next = new Set(previous)
      if (isExpanded) next.add(id)
      else next.delete(id)
      return next
    })
  }

  function handleToggleSelection(node: BookmarkNode) {
    if (!isSelectable || node.isDisabled) return
    const current = node.url
      ? (checkedState.get(node.id) ?? false)
      : determineCheckedState(node.children ?? [], checkedState)
    const isChecked = current !== true

    setCheckedState((previous) => {
      const next = new Map(previous)
      if (node.url) {
        next.set(node.id, isChecked)
      } else {
        const descendants = collectSelectableIds(node.children ?? [])
        for (const id of descendants) next.set(id, isChecked)
      }
      return next
    })
  }

  function handleRowKeyDown(
    event: React.KeyboardEvent<HTMLElement>,
    row: FlatTreeRow,
  ) {
    const hasModifier = event.ctrlKey || event.metaKey || event.altKey
    if (hasModifier || event.target !== event.currentTarget) return

    if (event.key === ' ') {
      event.preventDefault()
      handleToggleSelection(row.node)
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      if (row.isFolder) handleToggleExpand(row.node.id)
      return
    }

    const action = resolveTreeKey(rows, row.node.id, event.key)
    if (!action) return
    event.preventDefault()
    if (action.type === 'focus') {
      pendingFocusReference.current = action.id
      setFocusedId(action.id)
    } else {
      setFolderExpanded(action.id, action.type === 'expand')
    }
  }

  if (placeholder) return placeholder

  if (emptyState && isSearching && visibleNodes.length === 0) {
    return emptyState
  }

  return (
    <div
      ref={treeReference}
      role="tree"
      aria-label={ariaLabel}
      aria-multiselectable={isSelectable ? 'true' : undefined}
      onFocus={() => {
        isFocusInTreeReference.current = true
      }}
      onBlur={(event) => {
        const next = event.relatedTarget
        if (next instanceof Node && !event.currentTarget.contains(next)) {
          isFocusInTreeReference.current = false
        }
      }}
      className={cn('flex-1 overflow-auto p-2', className)}
    >
      <div
        className="relative h-(--tree-height) w-full"
        style={
          {
            '--tree-height': `${virtualizer.getTotalSize()}px`,
          } as React.CSSProperties
        }
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index]
          if (!row) return null
          return (
            <TreeRow
              key={row.node.id}
              row={row}
              offset={virtualRow.start}
              isSelectable={isSelectable}
              checked={
                row.node.url
                  ? (checkedState.get(row.node.id) ?? false)
                  : determineCheckedState(row.node.children ?? [], checkedState)
              }
              isTabStop={row.node.id === activeId}
              showBookmarkIcon={showBookmarkIcon}
              badge={renderBadge?.(row.node)}
              onFocusRow={setFocusedId}
              onToggleExpand={handleToggleExpand}
              onToggleSelection={handleToggleSelection}
              onKeyDown={handleRowKeyDown}
            />
          )
        })}
      </div>
    </div>
  )
})

interface TreeRowProperties {
  row: FlatTreeRow
  offset: number
  isSelectable: boolean
  checked: CheckedState
  isTabStop: boolean
  showBookmarkIcon: boolean
  badge: ReactNode
  onFocusRow: (id: string) => void
  onToggleExpand: (id: string) => void
  onToggleSelection: (node: BookmarkNode) => void
  onKeyDown: (event: React.KeyboardEvent<HTMLElement>, row: FlatTreeRow) => void
}

function TreeRow({
  row,
  offset,
  isSelectable,
  checked,
  isTabStop,
  showBookmarkIcon,
  badge,
  onFocusRow,
  onToggleExpand,
  onToggleSelection,
  onKeyDown,
}: TreeRowProperties) {
  const { node, level, isFolder, isExpanded } = row
  const hasCheckbox = isSelectable && !node.isDisabled

  return (
    <div
      // eslint-disable-next-line jsx-a11y/role-has-required-aria-props -- ARIA 1.2 makes aria-checked the supported selection state for a multiselectable tree; aria-selected is optional
      role="treeitem"
      aria-label={node.title}
      aria-level={level}
      aria-setsize={row.setSize}
      aria-posinset={row.position}
      aria-expanded={isFolder ? isExpanded : undefined}
      aria-checked={
        hasCheckbox
          ? checked === 'indeterminate'
            ? 'mixed'
            : checked
          : undefined
      }
      aria-disabled={node.isDisabled ? true : undefined}
      tabIndex={isTabStop ? 0 : -1}
      data-node-id={node.id}
      className={cn(
        'absolute inset-x-0 top-0 ml-(--tree-indent) flex h-7.5 translate-y-(--tree-offset) items-center gap-1.5 rounded px-1 outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring',
        isSelectable || isFolder ? 'cursor-pointer' : 'cursor-default',
        node.isDisabled && 'text-muted-foreground',
      )}
      style={
        {
          '--tree-indent': `${(level - 1) * 16}px`,
          '--tree-offset': `${offset}px`,
        } as React.CSSProperties
      }
      onFocus={(event) => {
        if (event.target === event.currentTarget) onFocusRow(node.id)
      }}
      onClick={() => {
        if (isFolder) onToggleExpand(node.id)
        else onToggleSelection(node)
      }}
      onKeyDown={(event) => onKeyDown(event, row)}
    >
      {hasCheckbox && (
        <TreeCheckMark
          checked={checked}
          onToggle={() => onToggleSelection(node)}
        />
      )}

      {node.url ? (
        showBookmarkIcon ? (
          <img
            src={getFaviconUrl(node.url)}
            alt=""
            className="size-4 shrink-0"
            aria-hidden="true"
            onError={(event) => {
              ;(event.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <File
            className="size-4 shrink-0 text-bookmark-file"
            aria-hidden="true"
          />
        )
      ) : (
        <Folder
          className="size-4 shrink-0 text-bookmark-folder"
          fill="currentColor"
          aria-hidden="true"
        />
      )}

      <span className="min-w-0 flex-1 truncate text-sm">{node.title}</span>

      {isFolder && (
        <span
          className="shrink-0 text-xs text-muted-foreground tabular-nums"
          aria-hidden="true"
        >
          {formatCount(collectBookmarkIds(node.children ?? []).length)}
        </span>
      )}

      {badge}
    </div>
  )
}

function TreeCheckMark({
  checked,
  onToggle,
}: {
  checked: CheckedState
  onToggle: () => void
}) {
  const state = checked === 'indeterminate' ? 'mixed' : String(checked)
  return (
    <span
      aria-hidden="true"
      data-checked={state}
      className="flex size-4 shrink-0 items-center justify-center rounded-sm border border-input transition-colors data-[checked=mixed]:border-primary data-[checked=mixed]:bg-primary data-[checked=mixed]:text-primary-foreground data-[checked=true]:border-primary data-[checked=true]:bg-primary data-[checked=true]:text-primary-foreground dark:bg-input/30"
      onClick={(event) => {
        event.stopPropagation()
        onToggle()
      }}
    >
      {checked === 'indeterminate' ? (
        <Minus className="size-3.5" />
      ) : (
        checked && <Check className="size-3.5" />
      )}
    </span>
  )
}
