import { i18n } from '#i18n'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Card, CardContent } from '@workspace/ui/components/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@workspace/ui/components/collapsible'
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import type { CSSProperties } from 'react'

import { formatCount } from '@/lib/format-count'
import type { ImportPlan } from '@/lib/import-plan'

const REMOVED_ROW_HEIGHT_PX = 44
const REMOVED_OVERSCAN_ROWS = 8
const FOLDER_PATH_SEPARATOR = ' › '

type RemovedBookmarks = ImportPlan['removed']

function RemovedList({ removed }: { removed: RemovedBookmarks }) {
  const scrollReference = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual's documented hook; its returned functions are not passed to memoized children
  const virtualizer = useVirtualizer({
    count: removed.length,
    getScrollElement: () => scrollReference.current,
    estimateSize: () => REMOVED_ROW_HEIGHT_PX,
    overscan: REMOVED_OVERSCAN_ROWS,
  })

  return (
    <div
      ref={scrollReference}
      role="list"
      aria-label={i18n.t('import_deleteListLabel')}
      className="max-h-80 overflow-auto border-t pt-1"
    >
      <div
        className="relative h-(--list-height) w-full"
        style={
          {
            '--list-height': `${virtualizer.getTotalSize()}px`,
          } as CSSProperties
        }
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const bookmark = removed[virtualRow.index]
          if (!bookmark) return null
          return (
            <div
              key={virtualRow.index}
              role="listitem"
              className="absolute inset-x-0 top-0 flex h-11 translate-y-(--row-offset) flex-col justify-center rounded-md px-2.5"
              style={
                { '--row-offset': `${virtualRow.start}px` } as CSSProperties
              }
            >
              <span className="truncate text-sm font-medium">
                {bookmark.title || bookmark.url}
              </span>
              <span className="flex min-w-0 gap-2 text-xs text-muted-foreground">
                <span className="min-w-0 flex-1 truncate">{bookmark.url}</span>
                <span className="shrink-0">
                  {bookmark.folderPath.join(FOLDER_PATH_SEPARATOR)}
                </span>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface ImportReplaceDeletionsProperties {
  removed: RemovedBookmarks
  addedCount: number
}

/**
 * The Restore - replace deletion card of the Import preview: a destructive-
 * tinted card whose header carries "Will be deleted (N)" and one line saying
 * what the replace adds and that a Safety snapshot is saved first. It folds
 * the old replace-diff alert into that header. The list of bookmarks that will
 * be deleted is collapsed by default and virtualized when open; with nothing
 * to delete the header reads "Nothing will be deleted." and there is no
 * expand control.
 * @param root0 This component's properties.
 * @param root0.removed The live bookmarks the replace deletes.
 * @param root0.addedCount How many bookmarks the replace adds.
 * @returns The collapsible deletion card.
 */
export function ImportReplaceDeletions({
  removed,
  addedCount,
}: ImportReplaceDeletionsProperties) {
  const [isOpen, setIsOpen] = useState(false)
  const removedCount = removed.length
  const title = i18n.t('import_deleteTitle', removedCount, [
    formatCount(removedCount),
  ])

  if (removedCount === 0) {
    return (
      <Card size="sm" className="ring-destructive/40">
        <CardContent>
          <div className="flex flex-wrap items-center gap-x-2 text-sm">
            <span className="font-medium">{title}</span>
            <span className="text-muted-foreground">
              {i18n.t('import_deleteNone')}
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const ChevronIcon = isOpen ? ChevronDownIcon : ChevronRightIcon
  return (
    <Card size="sm" className="ring-destructive/40">
      <CardContent>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="w-full">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 pb-2 text-left text-sm">
              <ChevronIcon className="size-4 shrink-0" aria-hidden />
              <span className="font-medium">{title}</span>
              <span className="min-w-0 flex-1 text-muted-foreground">
                {i18n.t('import_deleteDescription', addedCount, [
                  formatCount(addedCount),
                ])}
              </span>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <RemovedList removed={removed} />
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}
