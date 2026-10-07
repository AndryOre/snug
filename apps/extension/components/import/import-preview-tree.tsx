import { i18n } from '#i18n'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { ButtonGroup } from '@workspace/ui/components/button-group'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@workspace/ui/components/input-group'
import { Kbd } from '@workspace/ui/components/kbd'
import {
  ChevronsDownUpIcon,
  ChevronsUpDownIcon,
  SearchIcon,
} from 'lucide-react'
import { useRef, useState } from 'react'

import { BookmarkTreeView } from '@/components/export/bookmark-tree-view'
import { ExportTreeEmpty } from '@/components/export/export-tree-states'
import type { BookmarkNode, BookmarkTreeViewHandle } from '@/lib/types'
import { useSlashToFocus } from '@/lib/use-slash-to-focus'

const EXPAND_ALL_ON_MOUNT_TOKEN = 1

function ignoreCount() {}

function renderDuplicateBadge(node: BookmarkNode) {
  return node.isDisabled ? (
    <Badge variant="outline">{i18n.t('import_duplicateBadge')}</Badge>
  ) : null
}

interface ImportPreviewTreeProperties {
  nodes: BookmarkNode[]
}

/**
 * The read-only tree of the Import preview: a search field with a "/" hint
 * and Expand all / Collapse all over {@link BookmarkTreeView}, virtualized and
 * capped at 420px with its own scroll. Disabled nodes (skipped duplicates)
 * show a "Duplicate · skipped" badge. Folders start expanded; remount it
 * (change its `key`) to reset the search and expansion for a new file.
 * @param root0 This component's properties.
 * @param root0.nodes The tree to show.
 * @returns The toolbar and the tree.
 */
export function ImportPreviewTree({ nodes }: ImportPreviewTreeProperties) {
  const [searchTerm, setSearchTerm] = useState('')
  const treeReference = useRef<BookmarkTreeViewHandle>(null)
  const searchInputReference = useRef<HTMLInputElement>(null)
  useSlashToFocus(searchInputReference)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="min-w-40 flex-1">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            ref={searchInputReference}
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={i18n.t('searchBookmarks')}
            aria-label={i18n.t('searchBookmarks')}
            aria-keyshortcuts="/"
          />
          <InputGroupAddon align="inline-end">
            <Kbd>/</Kbd>
          </InputGroupAddon>
        </InputGroup>
        <ButtonGroup>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => treeReference.current?.expandAll()}
          >
            <ChevronsUpDownIcon data-icon="inline-start" />
            {i18n.t('exportPage_expandAll')}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => treeReference.current?.collapseAll()}
          >
            <ChevronsDownUpIcon data-icon="inline-start" />
            {i18n.t('exportPage_collapseAll')}
          </Button>
        </ButtonGroup>
      </div>
      <div className="flex flex-col rounded-lg border bg-card">
        <BookmarkTreeView
          ref={treeReference}
          nodes={nodes}
          searchTerm={searchTerm}
          ariaLabel={i18n.t('import_treeLabel')}
          isSelectable={false}
          renderBadge={renderDuplicateBadge}
          autoExpandToken={EXPAND_ALL_ON_MOUNT_TOKEN}
          onSelectionChange={ignoreCount}
          onTotalChange={ignoreCount}
          className="max-h-105"
          emptyState={
            <ExportTreeEmpty
              searchTerm={searchTerm}
              onClearSearch={() => setSearchTerm('')}
            />
          }
        />
      </div>
    </div>
  )
}
