import { i18n } from '#i18n'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@workspace/ui/components/alert'
import { Button } from '@workspace/ui/components/button'
import { Field, FieldLabel } from '@workspace/ui/components/field'
import {
  Item,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from '@workspace/ui/components/item'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { Spinner } from '@workspace/ui/components/spinner'
import { toast } from '@workspace/ui/components/toast'
import { FilesIcon, TriangleAlertIcon, UploadIcon } from 'lucide-react'
import { useId, useRef, useState } from 'react'

import { ReplaceSnapshotNote } from '@/components/import/replace-snapshot-note'
import { OperationProgressCard } from '@/components/operation-progress-card'
import {
  APP_ROUTES,
  getAppUrl,
  SAFETY_SNAPSHOT_SETTINGS_ROUTE,
} from '@/lib/app-url'
import { formatCount } from '@/lib/format-count'
import { ImportCanceledError } from '@/lib/import-control'
import { getImportModeItems } from '@/lib/import-mode-items'
import { planPopupFileBatch, planPopupImport } from '@/lib/popup-import-plan'
import { runImport } from '@/lib/run-import'
import type { ImportBatchFile } from '@/lib/run-import-batch'
import { runImportBatch } from '@/lib/run-import-batch'
import { defaultImportModeStore, skipDuplicatesStore } from '@/lib/storage'
import type { ImportMode, ImportResult } from '@/lib/types'
import { useOperationProgress } from '@/lib/use-operation-progress'
import { useStorageItem } from '@/lib/use-storage-item'

interface PendingImport {
  text: string
  mimeType: string
  fileName: string
  mode: ImportMode
}

interface PendingBatch {
  files: ImportBatchFile[]
  mode: ImportMode
  skipDuplicates: boolean
  bookmarkCount: number
  skippedFileCount: number
}

interface BatchSummary {
  fileCount: number
  bookmarkCount: number
}

async function readFileTextOrEmpty(file: File): Promise<string> {
  try {
    return await file.text()
  } catch {
    return ''
  }
}

function describeSkippedBookmarks(result: ImportResult): string[] {
  return [
    result.skippedDuplicates > 0
      ? i18n.t('import_skippedDuplicates', result.skippedDuplicates, [
          formatCount(result.skippedDuplicates),
        ])
      : '',
    result.skippedInvalidUrl > 0
      ? i18n.t('import_skippedInvalidUrl', result.skippedInvalidUrl, [
          formatCount(result.skippedInvalidUrl),
        ])
      : '',
  ].filter(Boolean)
}

function reportImportError(error: unknown): void {
  toast.add(
    error instanceof ImportCanceledError
      ? {
          title: i18n.t('progress_importCanceledTitle'),
          description: i18n.t('progress_importCanceledDescription'),
        }
      : {
          type: 'error',
          title: i18n.t('popup_importFailedTitle'),
          description: (error as Error).message,
        },
  )
}

/**
 * Popup Import section: a labelled default-mode select, a destructive alert
 * while that mode is Restore - replace, and a "Choose file..." button that
 * imports the picked files; several files are planned and imported as one
 * batch (the summed bookmark count against the limit below), and files that
 * cannot be read are skipped and reported in the result toast. A file with no location data (CSV, or HTML/JSON
 * without root folders) is imported in `folder` mode for that file only.
 * Restore - replace, and any import above `POPUP_IMPORT_BOOKMARK_LIMIT`
 * bookmarks, never run in the popup, because Chrome closes it on focus loss
 * mid-import; they open the App Import page instead. The button shows a
 * spinner and is disabled from the moment a file is picked until the import
 * ends; the outcome is reported with a toast.
 * @returns The import section element.
 */
export function ImportSection() {
  const fileInputReference = useRef<HTMLInputElement>(null)
  const modeSelectId = useId()
  const [mode, setMode] = useStorageItem(defaultImportModeStore)
  const isBusyReference = useRef(false)
  const [isImporting, setIsImporting] = useState(false)
  const [batchSummary, setBatchSummary] = useState<BatchSummary | null>(null)
  const progress = useOperationProgress()

  const performImport = async ({
    text,
    mimeType,
    fileName,
    mode: importMode,
  }: PendingImport) => {
    const signal = progress.begin()
    try {
      const result = await runImport(text, mimeType, importMode, fileName, {
        skipDuplicates: await skipDuplicatesStore.getValue(),
        signal,
        onProgress: progress.report,
      })
      const notes = describeSkippedBookmarks(result)
      toast.add({
        type: 'success',
        title: i18n.t('popup_importSuccessTitle'),
        description: notes.length > 0 ? notes.join('. ') : undefined,
      })
    } catch (error) {
      reportImportError(error)
    } finally {
      progress.end()
    }
  }

  const prepareImport = async (file: File): Promise<PendingImport | null> => {
    const text = await file.text()
    const plan = await planPopupImport({
      text,
      mimeType: file.type,
      fileName: file.name,
      mode,
      skipDuplicates: await skipDuplicatesStore.getValue(),
    })
    if (plan.kind === 'app') {
      void browser.tabs.create({ url: getAppUrl(APP_ROUTES.import) })
      return null
    }
    if (plan.kind === 'all-duplicates') {
      toast.add({
        title: i18n.t('import_nothingToImportTitle'),
        description: i18n.t('import_allDuplicates'),
      })
      return null
    }
    return { text, mimeType: file.type, fileName: file.name, mode: plan.mode }
  }

  const prepareBatch = async (files: File[]): Promise<PendingBatch | null> => {
    const shouldSkipDuplicates = await skipDuplicatesStore.getValue()
    const requests = await Promise.all(
      files.map(async (file) => ({
        text: await readFileTextOrEmpty(file),
        mimeType: file.type,
        fileName: file.name,
        mode,
        skipDuplicates: shouldSkipDuplicates,
      })),
    )
    const { plan, readableRequests, skippedFileCount, bookmarkCount } =
      await planPopupFileBatch(requests)
    if (plan.kind === 'app') {
      toast.add({
        title: i18n.t('popup_openingImportTitle'),
        description: i18n.t('popup_openingImportDescription'),
      })
      void browser.tabs.create({ url: getAppUrl(APP_ROUTES.import) })
      return null
    }
    if (plan.kind === 'all-duplicates') {
      toast.add({
        title: i18n.t('import_nothingToImportTitle'),
        description: i18n.t('import_allDuplicates'),
      })
      return null
    }
    return {
      files: readableRequests.map(({ text, mimeType, fileName }) => ({
        text,
        mimeType,
        fileName,
      })),
      mode: plan.mode,
      skipDuplicates: shouldSkipDuplicates,
      bookmarkCount,
      skippedFileCount,
    }
  }

  const performBatchImport = async (batch: PendingBatch) => {
    setBatchSummary({
      fileCount: batch.files.length,
      bookmarkCount: batch.bookmarkCount,
    })
    const signal = progress.begin()
    try {
      const result = await runImportBatch(batch.files, batch.mode, {
        skipDuplicates: batch.skipDuplicates,
        signal,
        onProgress: progress.report,
      })
      const notes = describeSkippedBookmarks(result)
      if (batch.skippedFileCount > 0) {
        toast.add({
          type: 'warning',
          title: i18n.t(
            'popup_importSkippedFilesTitle',
            batch.skippedFileCount,
            [formatCount(batch.skippedFileCount)],
          ),
          description: [
            i18n.t('popup_importSkippedFilesResult', batch.files.length, [
              formatCount(batch.files.length),
              formatCount(batch.bookmarkCount),
            ]),
            ...(notes.length > 0 ? [`${notes.join('. ')}.`] : []),
          ].join(' '),
        })
        return
      }
      toast.add({
        type: 'success',
        title: i18n.t('popup_importSuccessTitle'),
        description: notes.length > 0 ? notes.join('. ') : undefined,
      })
    } catch (error) {
      reportImportError(error)
    } finally {
      progress.end()
      setBatchSummary(null)
    }
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = [...(event.target.files ?? [])]
    event.target.value = ''
    const [file] = files
    if (!file || isBusyReference.current) return
    isBusyReference.current = true
    setIsImporting(true)
    try {
      try {
        if (files.length === 1) {
          const prepared = await prepareImport(file)
          if (prepared) await performImport(prepared)
        } else {
          const prepared = await prepareBatch(files)
          if (prepared) await performBatchImport(prepared)
        }
      } catch (error) {
        toast.add({
          type: 'error',
          title: i18n.t('popup_importFailedTitle'),
          description: (error as Error).message,
        })
      }
    } finally {
      isBusyReference.current = false
      setIsImporting(false)
    }
  }

  return (
    <section className="flex flex-col gap-2">
      <input
        ref={fileInputReference}
        type="file"
        multiple
        accept=".csv,.json,.html,.htm,.xbel,.xml"
        className="hidden"
        onChange={(event) => void handleFileChange(event)}
      />

      <Field>
        <FieldLabel htmlFor={modeSelectId}>
          {i18n.t('defaultImportMode')}
        </FieldLabel>
        <Select
          items={getImportModeItems()}
          value={mode}
          onValueChange={(value) => void setMode(value as ImportMode)}
        >
          <SelectTrigger id={modeSelectId} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="folder">
                {i18n.t('importModeFolder')}
              </SelectItem>
              <SelectItem value="restore-merge">
                {i18n.t('importModeRestoreMerge')}
              </SelectItem>
              <SelectItem value="restore-replace">
                {i18n.t('importModeRestoreReplace')}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>

      {mode === 'restore-replace' && (
        <Alert variant="destructive">
          <TriangleAlertIcon />
          <AlertTitle>{i18n.t('popup_replaceAlertTitle')}</AlertTitle>
          <AlertDescription>
            {i18n.t('importModeRestoreReplaceWarning')}
          </AlertDescription>
          <AlertDescription className="mt-2">
            <ReplaceSnapshotNote
              onOpenSettings={() =>
                void browser.tabs.create({
                  url: getAppUrl(SAFETY_SNAPSHOT_SETTINGS_ROUTE),
                })
              }
            />
          </AlertDescription>
        </Alert>
      )}

      {batchSummary && (
        <Item variant="muted" size="sm">
          <ItemMedia variant="icon">
            <FilesIcon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>
              {i18n.t('popup_importBatchSummary', batchSummary.fileCount, [
                formatCount(batchSummary.fileCount),
                formatCount(batchSummary.bookmarkCount),
              ])}
            </ItemTitle>
          </ItemContent>
        </Item>
      )}

      <Button
        variant="outline"
        className="w-full"
        disabled={isImporting}
        onClick={() => fileInputReference.current?.click()}
      >
        {isImporting ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <UploadIcon data-icon="inline-start" />
        )}
        {isImporting ? i18n.t('popup_importing') : i18n.t('popup_chooseFiles')}
      </Button>

      {progress.state.isCardVisible && (
        <OperationProgressCard
          kind="import"
          state={progress.state}
          onCancel={progress.requestCancel}
        />
      )}
    </section>
  )
}
