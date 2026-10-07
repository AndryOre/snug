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
import { useMemo, useRef, useState } from 'react'
import type { SubmitEvent } from 'react'

import { ImportAllDuplicates } from '@/components/import/import-all-duplicates'
import { ImportFileStep } from '@/components/import/import-file-step'
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
  pruneFilesToChecked,
} from '@/lib/import-plan'
import { getImportPreview } from '@/lib/import-preview'
import { toPreviewNodes } from '@/lib/import-preview-tree'
import { parseImportFile } from '@/lib/importers/parse-import'
import type { ParsedImportFile } from '@/lib/importers/parse-import'
import { resolveImportRootTitles } from '@/lib/importers/resolve-roots'
import { createLatestOnly } from '@/lib/latest-only'
import { runImport } from '@/lib/run-import'
import type { RunImportResult } from '@/lib/run-import'
import { runImportBatch } from '@/lib/run-import-batch'
import { restoreSafetySnapshot } from '@/lib/safety-snapshot'
import type { SafetySnapshot } from '@/lib/safety-snapshot'
import { defaultImportModeStore, skipDuplicatesStore } from '@/lib/storage'
import type { ImportMode, ImportPreview } from '@/lib/types'
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
  liveTree: Browser.bookmarks.BookmarkTreeNode[]
}

async function analyzeFile(file: File) {
  const text = await file.text()
  const liveTree = await browser.bookmarks.getTree()
  const liveRootTitles = resolveImportRootTitles(liveTree[0]?.children ?? [])
  const preview = getImportPreview(text, file.type, file.name, liveRootTitles)
  if (preview.format === 'unknown') {
    throw new Error(i18n.t('unsupportedFileFormat'))
  }
  const parsed = parseImportFile(text, file.type, file.name, liveRootTitles)
  return { id: crypto.randomUUID(), text, preview, parsed, liveTree }
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
  const [chosen, setChosen] = useState<ChosenFile | null>(null)
  const [storedMode, setStoredMode] = useStorageItem(defaultImportModeStore)
  const [skipDuplicates, setSkipDuplicates] =
    useStorageItem(skipDuplicatesStore)
  const [status, setStatus] = useState<ImportStatus>('idle')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<{
    file: File
    message: string
  } | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [wasRestored, setWasRestored] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [undoSnapshot, setUndoSnapshot] = useState<SafetySnapshot | null>(null)
  const [skippedCount, setSkippedCount] = useState(0)
  const [skippedDuplicatesCount, setSkippedDuplicatesCount] = useState(0)
  const [selectedCount, setSelectedCount] = useState<number | null>(null)
  const selectionReference = useRef<ImportPreviewTreeHandle>(null)
  const progress = useOperationProgress()

  const preview = chosen?.preview ?? null
  const isSupported = preview !== null && preview.format !== 'unknown'
  const hasLocationData = preview?.hasLocationData ?? false
  const effectiveMode: ImportMode = hasLocationData ? storedMode : 'folder'
  const isImporting = status === 'importing'
  const isBusy = isImporting || isAnalyzing
  const isReplace = effectiveMode === 'restore-replace'
  const isSkippingDuplicates = skipDuplicates && !isReplace

  const plan = useMemo(
    () =>
      chosen
        ? buildImportPlan({
            files: [{ name: chosen.file.name, file: chosen.parsed }],
            liveTree: chosen.liveTree,
            mode: effectiveMode,
            skipDuplicates: true,
          })
        : null,
    [chosen, effectiveMode],
  )
  const previewNodes = useMemo(
    () => (plan ? toPreviewNodes(plan.tree, isSkippingDuplicates) : []),
    [plan, isSkippingDuplicates],
  )
  const newCount = plan?.counts.new ?? 0
  const duplicateCount = plan?.counts.duplicate ?? 0
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

  const analyzeLatestFile = useRef(createLatestOnly(analyzeFile)).current

  const importStartedReference = useRef(false)

  const handleFile = async (file: File) => {
    if (importStartedReference.current) return
    setIsAnalyzing(true)
    try {
      const outcome = await analyzeLatestFile(file)
      if (!outcome.isCurrent || importStartedReference.current) return
      setChosen({ file, ...outcome.value })
      setAnalysisError(null)
      setStatus('idle')
      setErrorMessage('')
    } catch (error) {
      setChosen(null)
      setAnalysisError({ file, message: (error as Error).message })
      setStatus('idle')
      setErrorMessage('')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const executeImport = async () => {
    if (!chosen || isAnalyzing) return

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
      const [prunedFile] = pruneFilesToChecked([chosen.parsed], checkedIds)
      const result: RunImportResult = isReplace
        ? await runImport(
            chosen.text,
            chosen.file.type,
            effectiveMode,
            chosen.file.name,
            options,
          )
        : await runImportBatch(
            [
              {
                text: chosen.text,
                mimeType: chosen.file.type,
                fileName: chosen.file.name,
                prunedTree: prunedFile?.tree ?? [],
              },
            ],
            effectiveMode,
            options,
          )
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
    setChosen(null)
    setAnalysisError(null)
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
          file={chosen?.file ?? analysisError?.file ?? null}
          onFile={(file) => void handleFile(file)}
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

      {!isAnalyzing && analysisError && (
        <Alert variant="destructive" tabIndex={-1} ref={focusOnMount}>
          <CircleAlertIcon />
          <AlertTitle>{i18n.t('import_unreadableTitle')}</AlertTitle>
          <AlertDescription>{analysisError.message}</AlertDescription>
        </Alert>
      )}

      {!isAnalyzing && isSupported && preview && plan && (
        <>
          <ImportStep number={2} title={i18n.t('importPreview')} isComplete>
            <div className="flex flex-col gap-3">
              <ImportPreviewStep
                preview={preview}
                newCount={previewNewCount}
                duplicateCount={isSkippingDuplicates ? duplicateCount : 0}
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
                    key={chosen?.id}
                    nodes={previewNodes}
                    isSelectable={!isReplace}
                    ref={selectionReference}
                    onSelectionChange={setSelectedCount}
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
              disabled={isImporting}
            />
          </ImportStep>

          {!isReplace && (
            <ImportSkipDuplicates
              isChecked={skipDuplicates}
              onCheckedChange={(checked) => void setSkipDuplicates(checked)}
              duplicateCount={duplicateCount}
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
