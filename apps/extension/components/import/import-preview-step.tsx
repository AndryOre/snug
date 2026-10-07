import { i18n } from '#i18n'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@workspace/ui/components/item'
import { BookmarkIcon, FolderIcon } from 'lucide-react'

import { formatCount } from '@/lib/format-count'
import type { ImportPreview } from '@/lib/types'

interface ImportPreviewStepProperties {
  preview: ImportPreview
  newCount: number
  duplicateCount: number
  showDuplicates: boolean
}

function describeRoots(preview: ImportPreview): string {
  if (!preview.hasLocationData) {
    return `${i18n.t('importedBookmarks')} ${formatCount(preview.totalCount)}`
  }
  const roots: [string, number][] = [
    [i18n.t('bookmarksBar'), preview.bookmarksBarCount],
    [i18n.t('otherBookmarks'), preview.otherBookmarksCount],
  ]
  if (preview.mobileBookmarksCount > 0) {
    roots.push([i18n.t('mobileBookmarks'), preview.mobileBookmarksCount])
  }
  return roots
    .map(([label, count]) => `${label} ${formatCount(count)}`)
    .join(' · ')
}

function describeOutcome({
  newCount,
  duplicateCount,
  showDuplicates,
}: Omit<ImportPreviewStepProperties, 'preview'>): string {
  if (!showDuplicates) {
    const total = newCount + duplicateCount
    return i18n.t('import_previewWillImport', total, [formatCount(total)])
  }
  return [
    i18n.t('import_previewNew', newCount, [formatCount(newCount)]),
    i18n.t('import_previewDuplicates', duplicateCount, [
      formatCount(duplicateCount),
    ]),
  ].join(' · ')
}

/**
 * Summarises what the chosen file contains as one muted row: the bookmark
 * count of each root (or a single "Imported bookmarks" total when the file
 * has no location data), over a second line with what the import does with
 * them. With Skip duplicates on that line is "{n} new · {m} duplicates will be
 * skipped", otherwise the number of bookmarks that will be imported.
 * @param root0 This component's properties.
 * @param root0.preview The parsed preview of the chosen file.
 * @param root0.newCount Bookmarks the import creates.
 * @param root0.duplicateCount Bookmarks the import skips as duplicates.
 * @param root0.showDuplicates Whether the duplicates are skipped (Skip
 * duplicates on and not a Restore - replace).
 * @returns The summary row.
 */
export function ImportPreviewStep({
  preview,
  newCount,
  duplicateCount,
  showDuplicates,
}: ImportPreviewStepProperties) {
  return (
    <Item variant="muted" size="sm">
      <ItemMedia variant="icon">
        {preview.hasLocationData ? <FolderIcon /> : <BookmarkIcon />}
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{describeRoots(preview)}</ItemTitle>
        <ItemDescription>
          {describeOutcome({ newCount, duplicateCount, showDuplicates })}
        </ItemDescription>
      </ItemContent>
    </Item>
  )
}
