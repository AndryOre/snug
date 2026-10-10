import { loadFolderHandle, queryFolderAccess } from '@/lib/folder-handle'
import {
  isCurrentFolder,
  pruneFolderIdentities,
} from '@/lib/folder-run-identity'
import {
  type AutoExportFolderRun,
  type AutoExportRun,
  autoExportRunsStore,
} from '@/lib/storage'

const writeQueue: { tail: Promise<void> } = { tail: Promise.resolve() }

/**
 * Serializes read-modify-write cycles on {@link autoExportRunsStore}, so
 * concurrent per-format saves can't overwrite each other's entries.
 * @param update Receives the current runs and returns the runs to persist.
 * @returns Resolves once the new runs are persisted.
 */
async function updateRuns(
  update: (runs: AutoExportRun[]) => Promise<AutoExportRun[]> | AutoExportRun[],
): Promise<void> {
  const previous = writeQueue.tail
  const { promise: gate, resolve: releaseGate } = Promise.withResolvers<void>()
  writeQueue.tail = gate

  try {
    await previous
    const runs = await autoExportRunsStore.getValue()
    await autoExportRunsStore.setValue(await update(runs))
  } finally {
    releaseGate()
  }
}

/**
 * Persists the id of a download Snug just saved for auto-export, so
 * {@link applyRetention} can later remove it — and only it — even after the
 * service worker restarts.
 * @param downloadId The id `browser.downloads.download` returned.
 * @param runAt Start time of the run that saved it; ids sharing a `runAt` are
 * grouped into one run.
 * @returns Resolves once the id is persisted.
 */
export function recordSavedDownload(
  downloadId: number,
  runAt: number,
): Promise<void> {
  return updateRuns((runs) => {
    const runIndex = runs.findIndex(
      (run) => run.destination === 'downloads' && run.runAt === runAt,
    )
    const existing = runs[runIndex]
    return existing?.destination === 'downloads'
      ? runs.map((run, index) =>
          index === runIndex
            ? { ...existing, ids: [...existing.ids, downloadId] }
            : run,
        )
      : [...runs, { destination: 'downloads', runAt, ids: [downloadId] }]
  })
}

/**
 * Persists the path of a file Snug just wrote into the Custom folder, so
 * {@link applyRetention} can later remove it — and only it.
 * @param folderId The folder's identity id from `registerFolderIdentity`.
 * @param path The file's path relative to the folder's root.
 * @param runAt Start time of the run that saved it; paths sharing a `runAt`
 * and folder are grouped into one run.
 * @returns Resolves once the path is persisted.
 */
export function recordSavedFolderFile(
  folderId: string,
  path: string,
  runAt: number,
): Promise<void> {
  return updateRuns((runs) => {
    const runIndex = runs.findIndex(
      (run) =>
        run.destination === 'folder' &&
        run.runAt === runAt &&
        run.folderId === folderId,
    )
    const existing = runs[runIndex]
    return existing?.destination === 'folder'
      ? runs.map((run, index) =>
          index === runIndex
            ? { ...existing, paths: [...existing.paths, path] }
            : run,
        )
      : [...runs, { destination: 'folder', runAt, folderId, paths: [path] }]
  })
}

/**
 * Checks that a recorded id still refers to a download this extension
 * created. Chrome can reuse ids after the user clears download history, so a
 * stale id may now point at one of the user's own files.
 * @param downloadId The recorded download id.
 * @returns `true` only when the download exists and was started by Snug.
 */
async function isOwnDownload(downloadId: number): Promise<boolean> {
  try {
    const [item] = await browser.downloads.search({ id: downloadId })
    return item?.byExtensionId === browser.runtime.id
  } catch {
    return false
  }
}

/**
 * Removes one of Snug's own saved files and its history entry. An id that no
 * longer refers to a Snug download is skipped untouched. A file the user
 * already deleted or moved makes `removeFile` reject; that is expected and
 * not an error, so each step is attempted independently.
 * @param downloadId The recorded download to clean up.
 * @returns Resolves once both steps have been attempted.
 */
async function removeSavedDownload(downloadId: number): Promise<void> {
  if (!(await isOwnDownload(downloadId))) return
  try {
    await browser.downloads.removeFile(downloadId)
  } catch {}
  try {
    await browser.downloads.erase({ id: downloadId })
  } catch {}
}

/**
 * Removes one file Snug wrote into the Custom folder, found by walking its
 * recorded relative path without creating anything. Only that single file
 * entry is removed, never a directory. A file or subfolder that is already
 * gone is expected, so every failure is swallowed.
 * @param root The Custom folder's handle.
 * @param path The file's recorded path relative to `root`.
 * @returns Resolves once the removal was attempted.
 */
async function removeSavedFolderFile(
  root: FileSystemDirectoryHandle,
  path: string,
): Promise<void> {
  const segments = path.split('/').filter(Boolean)
  const fileName = segments.pop()
  if (!fileName) return
  try {
    let directory = root
    for (const segment of segments) {
      directory = await directory.getDirectoryHandle(segment)
    }
    await directory.removeEntry(fileName)
  } catch {}
}

interface FolderContext {
  handle: FileSystemDirectoryHandle
  hasAccess: boolean
}

/**
 * Loads the Custom folder handle and whether Folder access is `granted`,
 * tolerating a store that cannot be read (retention must never throw).
 * @returns The context, or `null` when no handle is stored.
 */
async function loadFolderContext(): Promise<FolderContext | null> {
  try {
    const handle = await loadFolderHandle()
    if (!handle) return null
    return {
      handle,
      hasAccess: (await queryFolderAccess(handle)) === 'granted',
    }
  } catch {
    return null
  }
}

/**
 * Drops, without deleting any file, the runs saved into a folder that is not
 * the current Custom folder. Downloads runs are always kept. Without a stored
 * handle nothing can be compared, so folder runs stay.
 * @param runs The full history.
 * @param context The current folder, or `null` when none is stored.
 * @returns The history without stale folder runs.
 */
async function dropStaleFolderRuns(
  runs: AutoExportRun[],
  context: FolderContext | null,
): Promise<AutoExportRun[]> {
  if (!context) return runs
  const kept: AutoExportRun[] = []
  for (const run of runs) {
    if (run.destination === 'downloads') {
      kept.push(run)
      continue
    }
    let isCurrent = false
    try {
      isCurrent = await isCurrentFolder(run.folderId, context.handle)
    } catch {}
    if (isCurrent) kept.push(run)
  }
  return kept
}

/**
 * Retention: keeps only the files of the newest `keepLast` runs Snug saved
 * across both Export destinations, removing every file of older runs.
 * Downloads runs go through `downloads.removeFile` plus `downloads.erase`;
 * Custom folder runs through `removeEntry` on the folder handle. Only ids and
 * paths Snug recorded are ever touched, never other files. `0` keeps
 * everything. Never throws for a missing file; the rest are still cleaned up.
 *
 * Folder runs from a folder that is no longer the current one are dropped
 * from the history without deleting any file. Without Folder access, folder
 * runs are skipped and stay in the history for the next run.
 * @param keepLast How many of the newest runs to keep; `0` keeps all.
 * @returns Resolves once the excess runs have been handled.
 */
export async function applyRetention(keepLast: number): Promise<void> {
  if (keepLast <= 0) return
  await updateRuns(async (storedRuns) => {
    const hasFolderRuns = storedRuns.some((run) => run.destination === 'folder')
    const context = hasFolderRuns ? await loadFolderContext() : null
    const runs = await dropStaleFolderRuns(storedRuns, context)

    const excessCount = Math.max(0, runs.length - keepLast)
    const remaining: AutoExportRun[] = runs.slice(excessCount)
    const skipped: AutoExportFolderRun[] = []
    for (const run of runs.slice(0, excessCount)) {
      if (run.destination === 'downloads') {
        for (const downloadId of run.ids) await removeSavedDownload(downloadId)
      } else if (context?.hasAccess) {
        for (const path of run.paths) {
          await removeSavedFolderFile(context.handle, path)
        }
      } else {
        skipped.push(run)
      }
    }

    const nextRuns = [...skipped, ...remaining]
    if (hasFolderRuns) {
      await pruneFolderIdentitiesSafely(nextRuns)
    }
    return nextRuns
  })
}

/**
 * Forgets folder identities no remaining run refers to; a failure here only
 * leaves a stale identity behind, so it never fails retention.
 * @param runs The history that will be persisted.
 * @returns Resolves once the cleanup was attempted.
 */
async function pruneFolderIdentitiesSafely(
  runs: AutoExportRun[],
): Promise<void> {
  const referenced = runs.flatMap((run) =>
    run.destination === 'folder' ? [run.folderId] : [],
  )
  try {
    await pruneFolderIdentities(referenced)
  } catch {}
}
