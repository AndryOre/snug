import { i18n } from '#i18n'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@workspace/ui/components/alert'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog'
import { Button } from '@workspace/ui/components/button'
import { Spinner } from '@workspace/ui/components/spinner'
import type { Browser } from '@wxt-dev/browser'
import {
  CircleAlertIcon,
  CircleCheckIcon,
  CircleSlashIcon,
  InfoIcon,
  Undo2Icon,
} from 'lucide-react'
import { useCallback, useMemo, useRef, useState } from 'react'
import type { SubmitEvent } from 'react'

import { ImportAllDuplicates } from '@/components/import/import-all-duplicates'
import { ImportFileStep } from '@/components/import/import-file-step'
import type { ImportFileRow } from '@/components/import/import-file-step'
import { ImportModeStep } from '@/components/import/import-mode-step'
import { ImportPreviewSkeleton } from '@/components/import/import-preview-skeleton'
import { ImportPreviewStep } from '@/components/import/import-preview-step'
import { ImportPreviewTree } from '@/components/import/import-preview-tree'
import type { ImportPreviewTreeHandle } from '@/components/import/import-preview-tree'
import { ImportReplaceDeletions } from '@/components/import/import-replace-deletions'
import { ImportSkipDuplicates } from '@/components/import/import-skip-duplicates'
import { ImportStep } from '@/components/import/import-step'
import { ReplaceSnapshotNote } from '@/components/import/replace-snapshot-note'
import { OperationProgressCard } from '@/components/operation-progress-card'
import { formatCount } from '@/lib/format-count'
import { ImportCanceledError, wasImportRestored } from '@/lib/import-control'
import {
  buildImportPlan,
  collectDuplicateIds,
  countSelectedDuplicates,
  pruneFilesToChecked,
} from '@/lib/import-plan'
import { getImportPreview } from '@/lib/import-preview'
import { toPreviewNodes } from '@/lib/import-preview-tree'
import { parseImportFile } from '@/lib/importers/parse-import'
import type { ParsedImportFile } from '@/lib/importers/parse-import'
import { resolveImportRootTitles } from '@/lib/importers/resolve-roots'
import { runImport } from '@/lib/run-import'
import type { RunImportResult } from '@/lib/run-import'
import { runImportBatch, stripFileExtension } from '@/lib/run-import-batch'
import { restoreSafetySnapshot } from '@/lib/safety-snapshot'
import type { SafetySnapshot } from '@/lib/safety-snapshot'
import { defaultImportModeStore, skipDuplicatesStore } from '@/lib/storage'
import type { BookmarkFormat, ImportMode, ImportPreview } from '@/lib/types'
import { useOperationProgress } from '@/lib/use-operation-progress'
import { useStorageItem } from '@/lib/use-storage-item'

type ImportStatus =
  'idle' | 'importing' | 'canceled' | 'success' | 'undoing' | 'undone' | 'error'

/**
 * Ref callback that moves focus to an element when it mounts, so a result
 * view keeps keyboard focus after the form that triggered it unmounts.
 * @param element The mounted element, or `null` on unmount.
 */
function focusOnMount(element: HTMLElement | null) {
  element?.focus()
}

function openBookmarkManager() {
  void browser.tabs.create({
    url:
      import.meta.env.BROWSER === 'edge'
        ? 'edge://favorites'
        : 'chrome://bookmarks',
  })
}

interface ChosenFile {
  id: string
  file: File
  text: string
  preview: ImportPreview
  parsed: ParsedImportFile
}

interface RejectedFile {
  id: string
  file: File
  message: string
}

type FileEntry =
  ({ kind: 'valid' } & ChosenFile) | ({ kind: 'invalid' } & RejectedFile)

const FORMAT_LABELS: Record<BookmarkFormat, string> = {
  json: 'JSON',
  html: 'HTML',
  csv: 'CSV',
  chrome: 'Chrome',
  xbel: 'XBEL',
  safari: 'Safari',
  unknown: '',
}

async function analyzeFile(
  file: File,
  liveTree: Browser.bookmarks.BookmarkTreeNode[],
): Promise<FileEntry> {
  const id = crypto.randomUUID()
  try {
    const text = await file.text()
    const liveRootTitles = resolveImportRootTitles(liveTree[0]?.children ?? [])
    const preview = getImportPreview(text, file.type, file.name, liveRootTitles)
    if (preview.format === 'unknown') {
      throw new Error(i18n.t('unsupportedFileFormat'))
    }
    const parsed = parseImportFile(text, file.type, file.name, liveRootTitles)
    return { kind: 'valid', id, file, text, preview, parsed }
  } catch (error) {
    return { kind: 'invalid', id, file, message: (error as Error).message }
  }
}

function describeFileRow(entry: FileEntry): ImportFileRow {
  if (entry.kind === 'invalid') {
    return {
      id: entry.id,
      name: entry.file.name,
      description: entry.message,
      isInvalid: true,
    }
  }
  const { totalCount } = entry.preview
  return {
    id: entry.id,
    name: entry.file.name,
    description: `${FORMAT_LABELS[entry.preview.format]} · ${i18n.t(
      'importPreviewCount',
      totalCount,
      [formatCount(totalCount)],
    )}`,
    isInvalid: false,
  }
}

function describeLeftOutFile(rejected: RejectedFile): string {
  return `${rejected.file.name}: ${rejected.message}`
}

function combinePreviews(previews: ImportPreview[]): ImportPreview | null {
  const [first] = previews
  if (!first) return null
  if (previews.length === 1) return first
  const combined: ImportPreview = {
    format: first.format,
    bookmarksBarCount: 0,
    otherBookmarksCount: 0,
    mobileBookmarksCount: 0,
    clearsMobileRoot: false,
    totalCount: 0,
    hasLocationData: false,
  }
  for (const preview of previews) {
    combined.bookmarksBarCount += preview.bookmarksBarCount
    combined.otherBookmarksCount += preview.otherBookmarksCount
    combined.mobileBookmarksCount += preview.mobileBookmarksCount
    combined.totalCount += preview.totalCount
    combined.clearsMobileRoot ||= preview.clearsMobileRoot
    combined.hasLocationData ||= preview.hasLocationData
  }
  return combined
}

/**
 * The Import screen: a stepped flow of file, preview, import mode and a
 * primary action. The mode initialises from, and writes back to,
 * {@link defaultImportModeStore} (shared with the popup's quick import); a
 * file without location data is forced to Folder mode for that file only,
 * leaving the stored default untouched. "Restore - replace" is destructive,
 * so it asks for confirmation before anything is written.
 * @returns The rendered stepped import flow.
 */
export function ImportRoute() {
  const [entries, setEntries] = useState<FileEntry[]>([])
  const [liveTree, setLiveTree] = useState<
    Browser.bookmarks.BookmarkTreeNode[]
  >([])
  const [storedMode, setStoredMode] = useStorageItem(defaultImportModeStore)
  const [skipDuplicates, setSkipDuplicates] =
    useStorageItem(skipDuplicatesStore)
  const [status, setStatus] = useState<ImportStatus>('idle')
  const [analyzingCount, setAnalyzingCount] = useState(0)
  const [leftOutFiles, setLeftOutFiles] = useState<RejectedFile[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [wasRestored, setWasRestored] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [undoSnapshot, setUndoSnapshot] = useState<SafetySnapshot | null>(null)
  const [skippedCount, setSkippedCount] = useState(0)
  const [skippedDuplicatesCount, setSkippedDuplicatesCount] = useState(0)
  const [selection, setSelection] = useState<{
    count: number
    ids: ReadonlySet<string>
  } | null>(null)
  const selectedCount = selection?.count ?? null
  const handleSelectionChange = useCallback(
    (count: number, ids: string[]) =>
      setSelection({ count, ids: new Set(ids) }),
    [],
  )
  const selectionReference = useRef<ImportPreviewTreeHandle>(null)
  const progress = useOperationProgress()

  const validFiles = useMemo(
    () =>
      entries.filter((entry): entry is { kind: 'valid' } & ChosenFile => {
        return entry.kind === 'valid'
      }),
    [entries],
  )
  const fileRows = useMemo(
    () => entries.map((entry) => describeFileRow(entry)),
    [entries],
  )
  const preview = useMemo(
    () => combinePreviews(validFiles.map((entry) => entry.preview)),
    [validFiles],
  )
  const selectionKey = validFiles.map((entry) => entry.id).join(',')
  const isSupported = preview !== null
  const hasLocationData = preview?.hasLocationData ?? false
  const isBatch = validFiles.length >= 2
  const effectiveMode: ImportMode =
    !hasLocationData || (isBatch && storedMode === 'restore-replace')
      ? 'folder'
      : storedMode
  const isImporting = status === 'importing'
  const isAnalyzing = analyzingCount > 0
  const isBusy = isImporting || isAnalyzing
  const isReplace = effectiveMode === 'restore-replace'
  const isSkippingDuplicates = skipDuplicates && !isReplace

  const plan = useMemo(
    () =>
      validFiles.length > 0
        ? buildImportPlan({
            files: validFiles.map((entry) => ({
              name: stripFileExtension(entry.file.name),
              file: entry.parsed,
            })),
            liveTree,
            mode: effectiveMode,
            skipDuplicates: true,
          })
        : null,
    [validFiles, liveTree, effectiveMode],
  )
  const previewNodes = useMemo(
    () => (plan ? toPreviewNodes(plan.tree, isSkippingDuplicates) : []),
    [plan, isSkippingDuplicates],
  )
  const newCount = plan?.counts.new ?? 0
  const duplicateCount = plan?.counts.duplicate ?? 0
  const selectedDuplicateCount =
    plan && selection
      ? countSelectedDuplicates(plan.tree, selection.ids, isSkippingDuplicates)
      : duplicateCount
  const fullImportCount = isSkippingDuplicates
    ? newCount
    : newCount + duplicateCount
  const importCount = isReplace
    ? fullImportCount
    : Math.min(selectedCount ?? fullImportCount, fullImportCount)
  const previewNewCount = isReplace ? newCount : importCount
  const isEmpty = isSupported && newCount + duplicateCount === 0
  const isAllDuplicates =
    isSkippingDuplicates && newCount === 0 && duplicateCount > 0
  const isSelectionEmpty =
    !isReplace && !isEmpty && !isAllDuplicates && importCount === 0

  const importStartedReference = useRef(false)

  const handleFiles = async (files: File[]) => {
    if (importStartedReference.current) return
    setAnalyzingCount((count) => count + 1)
    try {
      const freshTree = await browser.bookmarks.getTree()
      const analyzed = await Promise.all(
        files.map((file) => analyzeFile(file, freshTree)),
      )
      if (importStartedReference.current) return
      setLiveTree(freshTree)
      setEntries((current) => [...current, ...analyzed])
      setStatus('idle')
      setErrorMessage('')
    } catch (error) {
      setStatus('error')
      setErrorMessage((error as Error).message)
    } finally {
      setAnalyzingCount((count) => count - 1)
    }
  }

  const handleRemoveFile = (id: string) => {
    if (importStartedReference.current) return
    setEntries((current) => current.filter((entry) => entry.id !== id))
    setStatus('idle')
    setErrorMessage('')
  }

  const executeImport = async () => {
    if (isAnalyzing || validFiles.length === 0) return

    importStartedReference.current = true
    setStatus('importing')
    setErrorMessage('')
    setUndoSnapshot(null)
    setSkippedCount(0)
    setSkippedDuplicatesCount(0)
    const signal = progress.begin()

    try {
      const options = {
        skipDuplicates: isSkippingDuplicates,
        signal,
        onProgress: progress.report,
      }
      const selectedIds = new Set(selectionReference.current?.getCheckedIds())
      const checkedIds = new Set([
        ...selectedIds,
        ...(isSkippingDuplicates
          ? collectDuplicateIds(plan?.tree ?? [], selectedIds)
          : []),
      ])
      const prunedFiles = pruneFilesToChecked(
        validFiles.map((entry) => entry.parsed),
        checkedIds,
      )
      const [onlyFile] = validFiles
      const result: RunImportResult =
        isReplace && onlyFile
          ? await runImport(
              onlyFile.text,
              onlyFile.file.type,
              effectiveMode,
              onlyFile.file.name,
              options,
            )
          : await runImportBatch(
              validFiles.map((entry, index) => ({
                text: entry.text,
                mimeType: entry.file.type,
                fileName: entry.file.name,
                prunedTree: prunedFiles[index]?.tree ?? [],
              })),
              effectiveMode,
              options,
            )
      setLeftOutFiles(entries.filter((entry) => entry.kind === 'invalid'))
      setUndoSnapshot(result.snapshot ?? null)
      setSkippedCount(result.skippedInvalidUrl)
      setSkippedDuplicatesCount(result.skippedDuplicates)
      setStatus('success')
    } catch (error) {
      if (error instanceof ImportCanceledError) {
        setStatus('canceled')
      } else {
        setStatus('error')
        setErrorMessage((error as Error).message)
        setWasRestored(wasImportRestored(error))
      }
    } finally {
      importStartedReference.current = false
      progress.end()
    }
  }

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isBusy) return
    if (effectiveMode === 'restore-replace') {
      setIsConfirmOpen(true)
    } else {
      void executeImport()
    }
  }

  const handleConfirm = () => {
    setIsConfirmOpen(false)
    void executeImport()
  }

  const handleUndo = async () => {
    if (!undoSnapshot) return

    setStatus('undoing')
    setErrorMessage('')

    try {
      await restoreSafetySnapshot(undoSnapshot)
      setUndoSnapshot(null)
      setStatus('undone')
    } catch (error) {
      setStatus('success')
      setErrorMessage((error as Error).message)
    }
  }

  const handleReset = () => {
    setUndoSnapshot(null)
    setEntries([])
    setLeftOutFiles([])
    setStatus('idle')
    setErrorMessage('')
  }

  if (status === 'undone') {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <Alert key="undone" tabIndex={-1} ref={focusOnMount}>
          <Undo2Icon />
          <AlertTitle>{i18n.t('import_undoneTitle')}</AlertTitle>
          <AlertDescription>
            {i18n.t('import_undoneDescription')}
          </AlertDescription>
        </Alert>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleReset}>
            {i18n.t('import_another')}
          </Button>
          <Button variant="ghost" onClick={openBookmarkManager}>
            {i18n.t('import_openManager')}
          </Button>
        </div>
      </div>
    )
  }

  if (status === 'success' || status === 'undoing') {
    const isUndoing = status === 'undoing'
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <Alert key="success" tabIndex={-1} ref={focusOnMount}>
          <CircleCheckIcon />
          <AlertTitle>{i18n.t('bookmarksImportedSuccessfully')}</AlertTitle>
          {skippedDuplicatesCount > 0 && (
            <AlertDescription>
              {i18n.t('import_skippedDuplicates', skippedDuplicatesCount, [
                formatCount(skippedDuplicatesCount),
              ])}
            </AlertDescription>
          )}
          {skippedCount > 0 && (
            <AlertDescription>
              {i18n.t('import_skippedInvalidUrl', skippedCount, [
                formatCount(skippedCount),
              ])}
            </AlertDescription>
          )}
        </Alert>
        {leftOutFiles.length > 0 && (
          <Alert>
            <InfoIcon />
            <AlertTitle>{i18n.t('import_skippedFilesTitle')}</AlertTitle>
            {leftOutFiles.map((leftOut) => (
              <AlertDescription key={leftOut.id}>
                {describeLeftOutFile(leftOut)}
              </AlertDescription>
            ))}
          </Alert>
        )}
        {errorMessage && (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertTitle>{i18n.t('import_undoFailedTitle')}</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        <div className="flex flex-wrap gap-2">
          {undoSnapshot && (
            <Button
              variant="destructive"
              disabled={isUndoing}
              onClick={() => void handleUndo()}
            >
              {isUndoing && <Spinner data-icon="inline-start" />}
              {isUndoing ? i18n.t('import_undoing') : i18n.t('import_undo')}
            </Button>
          )}
          <Button variant="outline" onClick={handleReset}>
            {i18n.t('import_another')}
          </Button>
          <Button variant="ghost" onClick={openBookmarkManager}>
            {i18n.t('import_openManager')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-2xl flex-col gap-4"
    >
      <ImportStep
        number={1}
        title={i18n.t('import_stepFile')}
        isComplete={isSupported}
      >
        <ImportFileStep
          rows={fileRows}
          onFiles={(files) => void handleFiles(files)}
          onRemove={handleRemoveFile}
          disabled={isBusy}
        />
      </ImportStep>

      {isAnalyzing && (
        <>
          <ImportStep
            number={2}
            title={i18n.t('importPreview')}
            isComplete={false}
          >
            <ImportPreviewSkeleton />
          </ImportStep>
          <Button type="submit" size="lg" disabled>
            <Spinner data-icon="inline-start" />
            {i18n.t('import_reading')}
          </Button>
        </>
      )}

      {!isAnalyzing && isSupported && preview && plan && (
        <>
          <ImportStep number={2} title={i18n.t('importPreview')} isComplete>
            <div className="flex flex-col gap-3">
              <ImportPreviewStep
                preview={preview}
                newCount={previewNewCount}
                duplicateCount={
                  isSkippingDuplicates ? selectedDuplicateCount : 0
                }
                showDuplicates={isSkippingDuplicates}
              />
              {isReplace && (
                <Alert>
                  <InfoIcon />
                  <AlertTitle>{i18n.t('import_replaceNoteTitle')}</AlertTitle>
                  <AlertDescription>
                    {i18n.t('import_replaceNoteDescription')}
                  </AlertDescription>
                </Alert>
              )}
              {isAllDuplicates ? (
                <ImportAllDuplicates
                  onTurnOffSkipDuplicates={() => void setSkipDuplicates(false)}
                />
              ) : (
                !isEmpty && (
                  <ImportPreviewTree
                    key={selectionKey}
                    nodes={previewNodes}
                    isSelectable={!isReplace}
                    ref={selectionReference}
                    onSelectionChange={handleSelectionChange}
                  />
                )
              )}
              {isReplace && (
                <ImportReplaceDeletions
                  removed={plan.removed}
                  addedCount={newCount}
                />
              )}
            </div>
          </ImportStep>

          <ImportStep
            number={3}
            title={i18n.t('importMode')}
            isComplete={false}
          >
            <ImportModeStep
              value={effectiveMode}
              onChange={(mode) => void setStoredMode(mode)}
              hasLocationData={hasLocationData}
              isReplaceDisabled={isBatch}
              disabled={isImporting}
            />
          </ImportStep>

          {!isReplace && (
            <ImportSkipDuplicates
              isChecked={skipDuplicates}
              onCheckedChange={(checked) => void setSkipDuplicates(checked)}
              duplicateCount={selectedDuplicateCount}
              fileDuplicateCount={duplicateCount}
              disabled={isImporting}
            />
          )}

          <Button
            type="submit"
            size="lg"
            disabled={isBusy || isEmpty || importCount === 0}
          >
            {isImporting && <Spinner data-icon="inline-start" />}
            {isImporting && i18n.t('import_importing')}
            {!isImporting && isAllDuplicates && i18n.t('import_nothingNew')}
            {!isImporting &&
              isSelectionEmpty &&
              i18n.t('import_selectBookmarks')}
            {!isImporting &&
              !isAllDuplicates &&
              !isSelectionEmpty &&
              i18n.t('import_submit', importCount, [formatCount(importCount)])}
          </Button>
          {progress.state.isCardVisible && (
            <OperationProgressCard
              kind="import"
              state={progress.state}
              onCancel={progress.requestCancel}
            />
          )}
          {isEmpty && (
            <p className="text-sm text-muted-foreground">
              {i18n.t('import_noBookmarks')}
            </p>
          )}
        </>
      )}

      {status === 'canceled' && (
        <Alert tabIndex={-1} ref={focusOnMount}>
          <CircleSlashIcon />
          <AlertTitle>{i18n.t('progress_importCanceledTitle')}</AlertTitle>
          <AlertDescription>
            {i18n.t('progress_importCanceledDescription')}
          </AlertDescription>
        </Alert>
      )}

      {status === 'error' && (
        <Alert variant="destructive" tabIndex={-1} ref={focusOnMount}>
          <CircleAlertIcon />
          <AlertTitle>{i18n.t('import_errorTitle')}</AlertTitle>
          <AlertDescription>
            {errorMessage}
            {wasRestored && ` ${i18n.t('import_errorRestored')}`}
          </AlertDescription>
        </Alert>
      )}

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{i18n.t('import_replaceTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {i18n.t('replaceConfirmDescription', importCount, [
                formatCount(importCount),
              ])}
            </AlertDialogDescription>
            <div className="text-sm text-muted-foreground">
              <ReplaceSnapshotNote />
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{i18n.t('cancel')}</AlertDialogCancel>
            <Button variant="destructive" onClick={handleConfirm}>
              {i18n.t('import_replaceConfirm')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  )
}
