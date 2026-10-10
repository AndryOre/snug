import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fakeBrowser } from 'wxt/testing/fake-browser'

import { autoExportRunsStore } from '@/lib/storage'
import { FakeDirectoryHandle } from '@/lib/testing/fake-directory-handle'
import {
  registerFolderIdentity,
  resetFakeFolderIdentities,
} from '@/lib/testing/fake-folder-run-identity'

import {
  applyRetention,
  recordSavedDownload,
  recordSavedFolderFile,
} from './auto-export-retention'

const folderHandleMock = vi.hoisted(() => ({
  handle: null as unknown,
}))

vi.mock('@/lib/folder-handle', () => ({
  loadFolderHandle: async () => folderHandleMock.handle,
  queryFolderAccess: async (handle: { queryPermission(): Promise<string> }) =>
    handle.queryPermission(),
}))

vi.mock(
  '@/lib/folder-run-identity',
  async () => import('@/lib/testing/fake-folder-run-identity'),
)

/**
 * Seeds `folder` with files and records them as one Custom folder run.
 * @param folder The folder the files live in.
 * @param runAt The run's start time.
 * @param names File names, written at the folder root.
 */
async function recordFolderRun(
  folder: FakeDirectoryHandle,
  runAt: number,
  names: string[],
): Promise<void> {
  const folderId = await registerFolderIdentity(folder.asHandle())
  for (const name of names) {
    folder.files.set(name, 'data')
    await recordSavedFolderFile(folderId, name, runAt)
  }
}

/**
 * Replaces `browser.downloads.removeFile`/`erase` (unimplemented in
 * `fakeBrowser`) with `vi.fn`s; ids in `missingFileIds` make `removeFile`
 * reject like Chrome does for a file the user already deleted or moved.
 * Also stubs `downloads.search` so every recorded id resolves to a download
 * started by this extension, except `foreignIds`, which resolve to another
 * extension's or are gone.
 * @param missingFileIds Download ids whose file is gone.
 * @param foreignIds Download ids that no longer belong to Snug.
 * @returns The installed mocks.
 */
function mockDownloadsCleanup(
  missingFileIds: number[] = [],
  foreignIds: number[] = [],
) {
  const removeFile = vi.fn(async (id: number) => {
    if (missingFileIds.includes(id)) throw new Error('Download file missing.')
  })
  const erase = vi.fn<(query: { id: number }) => Promise<number[]>>(
    async () => [],
  )
  const search = vi.fn(async ({ id }: { id: number }) => [
    {
      id,
      byExtensionId: foreignIds.includes(id)
        ? 'some-other-extension'
        : browser.runtime.id,
    },
  ])
  browser.downloads.search =
    search as unknown as typeof browser.downloads.search
  browser.downloads.removeFile =
    removeFile as unknown as typeof browser.downloads.removeFile
  browser.downloads.erase = erase as unknown as typeof browser.downloads.erase
  return { removeFile, erase, search }
}

/**
 * Records `ids` as the downloads of one run started at `runAt`.
 * @param runAt The run's start time.
 * @param ids The run's download ids, oldest first.
 */
async function recordRun(runAt: number, ids: number[]): Promise<void> {
  for (const id of ids) await recordSavedDownload(id, runAt)
}

function runsOf(...idGroups: number[][]) {
  return idGroups.map((ids, index) => ({
    destination: 'downloads',
    runAt: index + 1,
    ids,
  }))
}

beforeEach(() => {
  fakeBrowser.reset()
  resetFakeFolderIdentities()
  folderHandleMock.handle = null
})

describe('recordSavedDownload', () => {
  it('groups ids of the same run together and persists them', async () => {
    await recordRun(100, [4, 9, 12])
    await recordRun(200, [20])

    const expected = [
      { destination: 'downloads', runAt: 100, ids: [4, 9, 12] },
      { destination: 'downloads', runAt: 200, ids: [20] },
    ]
    expect(await autoExportRunsStore.getValue()).toEqual(expected)
    const raw = await fakeBrowser.storage.local.get('autoExportDownloadIds')
    expect(raw.autoExportDownloadIds).toEqual(expected)
  })

  it('keeps overlapping runs apart instead of splitting one run in two', async () => {
    await recordSavedDownload(1, 100)
    await recordSavedDownload(2, 200)
    await recordSavedDownload(3, 100)

    expect(await autoExportRunsStore.getValue()).toEqual([
      { destination: 'downloads', runAt: 100, ids: [1, 3] },
      { destination: 'downloads', runAt: 200, ids: [2] },
    ])
  })

  it('does not lose ids recorded concurrently', async () => {
    await Promise.all([1, 2, 3, 4].map((id) => recordSavedDownload(id, 50)))

    const [run, ...rest] = await autoExportRunsStore.getValue()
    expect(rest).toEqual([])
    expect(run?.runAt).toBe(50)
    expect(
      run?.destination === 'downloads' ? run.ids.toSorted((a, b) => a - b) : [],
    ).toEqual([1, 2, 3, 4])
  })
})

describe('legacy flat id list migration', () => {
  it('turns each legacy id into its own run so nothing extra is deleted', async () => {
    await fakeBrowser.storage.local.set({ autoExportDownloadIds: [7, 8, 9] })
    await autoExportRunsStore.migrate()

    expect(await autoExportRunsStore.getValue()).toEqual([
      { destination: 'downloads', runAt: 0, ids: [7] },
      { destination: 'downloads', runAt: 0, ids: [8] },
      { destination: 'downloads', runAt: 0, ids: [9] },
    ])
  })

  it('applies retention to migrated ids exactly as it did to files', async () => {
    const { removeFile } = mockDownloadsCleanup()
    await fakeBrowser.storage.local.set({ autoExportDownloadIds: [7, 8, 9] })
    await autoExportRunsStore.migrate()

    await applyRetention(2)

    expect(removeFile.mock.calls.map(([id]) => id)).toEqual([7])
  })
})

describe('applyRetention', () => {
  it('keeps every file of the last N runs and removes only older runs', async () => {
    const { removeFile, erase } = mockDownloadsCleanup()
    await recordRun(1, [1, 2, 3])
    await recordRun(2, [4, 5, 6])
    await recordRun(3, [7, 8, 9])

    await applyRetention(2)

    expect(removeFile.mock.calls.map(([id]) => id)).toEqual([1, 2, 3])
    expect(erase.mock.calls.map(([query]) => query)).toEqual([
      { id: 1 },
      { id: 2 },
      { id: 3 },
    ])
    expect(await autoExportRunsStore.getValue()).toEqual([
      { destination: 'downloads', runAt: 2, ids: [4, 5, 6] },
      { destination: 'downloads', runAt: 3, ids: [7, 8, 9] },
    ])
  })

  it('keeps all files of the previous run when a run has more files than the limit', async () => {
    const { removeFile } = mockDownloadsCleanup()
    await recordRun(1, [1, 2, 3, 4, 5, 6])
    await recordRun(2, [7, 8, 9, 10, 11, 12])

    await applyRetention(10)

    expect(removeFile).not.toHaveBeenCalled()
  })

  it('removes nothing when 0 is configured', async () => {
    const { removeFile, erase } = mockDownloadsCleanup()
    await recordRun(1, [1, 2])
    await recordRun(2, [3])

    await applyRetention(0)

    expect(removeFile).not.toHaveBeenCalled()
    expect(erase).not.toHaveBeenCalled()
    expect(await autoExportRunsStore.getValue()).toEqual(runsOf([1, 2], [3]))
  })

  it('applies a lowered limit on the next call', async () => {
    const { removeFile } = mockDownloadsCleanup()
    await recordRun(1, [1, 2])
    await recordRun(2, [3, 4])
    await applyRetention(2)
    expect(removeFile).not.toHaveBeenCalled()

    await applyRetention(1)

    expect(removeFile.mock.calls.map(([id]) => id)).toEqual([1, 2])
    expect(await autoExportRunsStore.getValue()).toEqual([
      { destination: 'downloads', runAt: 2, ids: [3, 4] },
    ])
  })

  it('skips a missing file and still cleans up the rest', async () => {
    const { removeFile, erase } = mockDownloadsCleanup([2])
    await recordRun(1, [1, 2])
    await recordRun(2, [3])

    await expect(applyRetention(1)).resolves.toBeUndefined()

    expect(removeFile.mock.calls.map(([id]) => id)).toEqual([1, 2])
    expect(erase).toHaveBeenCalledTimes(2)
    expect(await autoExportRunsStore.getValue()).toEqual([
      { destination: 'downloads', runAt: 2, ids: [3] },
    ])
  })
})

describe('applyRetention ownership check', () => {
  it('skips an id that no longer belongs to Snug and still drops it from storage', async () => {
    const { removeFile, erase } = mockDownloadsCleanup([], [2])
    await recordRun(1, [1, 2])
    await recordRun(2, [3])

    await applyRetention(1)

    expect(removeFile.mock.calls.map(([id]) => id)).toEqual([1])
    expect(erase.mock.calls.map(([query]) => query.id)).toEqual([1])
    expect(await autoExportRunsStore.getValue()).toEqual([
      { destination: 'downloads', runAt: 2, ids: [3] },
    ])
  })
})

describe('applyRetention across Export destinations', () => {
  it('prunes the oldest runs regardless of destination, keeping the newest keepLast', async () => {
    const { removeFile } = mockDownloadsCleanup()
    const folder = new FakeDirectoryHandle('Backups')
    folderHandleMock.handle = folder
    await recordRun(1, [1])
    await recordFolderRun(folder, 2, ['b.json'])
    await recordRun(3, [3])
    await recordFolderRun(folder, 4, ['d.json'])

    await applyRetention(2)

    expect(removeFile.mock.calls.map(([id]) => id)).toEqual([1])
    expect(folder.files.keys().toArray()).toEqual(['d.json'])
    const runs = await autoExportRunsStore.getValue()
    expect(runs.map((run) => run.runAt)).toEqual([3, 4])
  })

  it('removes recorded files in subfolders and only those', async () => {
    const folder = new FakeDirectoryHandle('Backups')
    folderHandleMock.handle = folder
    const nested = await folder.getDirectoryHandle('backups', { create: true })
    nested.files.set('old.json', 'data')
    nested.files.set('users-own.json', 'keep me')
    const folderId = await registerFolderIdentity(folder.asHandle())
    await recordSavedFolderFile(folderId, 'backups/old.json', 1)
    await recordSavedFolderFile(folderId, 'backups/new.json', 2)

    await applyRetention(1)

    expect(nested.files.keys().toArray()).toEqual(['users-own.json'])
  })

  it('does not fail when a recorded folder file is already gone', async () => {
    const folder = new FakeDirectoryHandle('Backups')
    folderHandleMock.handle = folder
    const folderId = await registerFolderIdentity(folder.asHandle())
    await recordSavedFolderFile(folderId, 'missing.json', 1)
    await recordSavedFolderFile(folderId, 'missing-dir/x.json', 1)
    await recordSavedFolderFile(folderId, 'kept.json', 2)

    await expect(applyRetention(1)).resolves.toBeUndefined()

    const runs = await autoExportRunsStore.getValue()
    expect(runs.map((run) => run.runAt)).toEqual([2])
  })

  it('drops runs of a folder that is no longer the Custom folder without deleting files', async () => {
    const { removeFile } = mockDownloadsCleanup()
    const oldFolder = new FakeDirectoryHandle('Old')
    const newFolder = new FakeDirectoryHandle('New')
    await recordRun(1, [1])
    await recordFolderRun(oldFolder, 2, ['old-a.json'])
    await recordFolderRun(oldFolder, 3, ['old-b.json'])
    await recordFolderRun(newFolder, 4, ['new.json'])
    folderHandleMock.handle = newFolder

    await applyRetention(2)

    expect(oldFolder.files.keys().toArray()).toEqual([
      'old-a.json',
      'old-b.json',
    ])
    expect(removeFile).not.toHaveBeenCalled()
    expect(newFolder.files.has('new.json')).toBe(true)
    const runs = await autoExportRunsStore.getValue()
    expect(runs.map((run) => run.runAt)).toEqual([1, 4])
  })

  it('skips folder deletions without Folder access and keeps those runs', async () => {
    const { removeFile } = mockDownloadsCleanup()
    const folder = new FakeDirectoryHandle('Backups', 'prompt')
    folderHandleMock.handle = folder
    await recordFolderRun(folder, 1, ['a.json'])
    await recordRun(2, [2])
    await recordRun(3, [3])

    await applyRetention(1)

    expect(folder.files.has('a.json')).toBe(true)
    expect(removeFile.mock.calls.map(([id]) => id)).toEqual([2])
    let runs = await autoExportRunsStore.getValue()
    expect(runs.map((run) => run.runAt)).toEqual([1, 3])

    folder.permission = 'granted'
    await applyRetention(1)

    expect(folder.files.has('a.json')).toBe(false)
    runs = await autoExportRunsStore.getValue()
    expect(runs.map((run) => run.runAt)).toEqual([3])
  })

  it('keeps folder runs when no folder handle is stored', async () => {
    const folder = new FakeDirectoryHandle('Backups')
    await recordFolderRun(folder, 1, ['a.json'])
    await recordFolderRun(folder, 2, ['b.json'])

    await applyRetention(1)

    expect(folder.files.size).toBe(2)
    expect(await autoExportRunsStore.getValue()).toHaveLength(2)
  })
})
