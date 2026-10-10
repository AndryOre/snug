// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fakeBrowser } from 'wxt/testing/fake-browser'

import {
  autoExportConfigStore,
  autoExportLastRunStore,
  autoExportNotifyOnFailureStore,
  autoExportRunsStore,
  exportFilenameTemplateStore,
} from '@/lib/storage'
import { resetFakeBookmarks } from '@/lib/testing/fake-bookmarks'
import { FakeDirectoryHandle } from '@/lib/testing/fake-directory-handle'
import { resetFakeFolderIdentities } from '@/lib/testing/fake-folder-run-identity'
import { resetFakeI18n } from '@/lib/testing/fake-i18n'
import type { AutoExportConfig } from '@/lib/types'

import { runAutoExport } from './auto-export'

const folderHandleMock = vi.hoisted(() => ({
  handle: null as unknown,
}))

vi.mock('@/lib/folder-handle', async () => ({
  loadFolderHandle: async () => folderHandleMock.handle,
  queryFolderAccess: async (handle: { queryPermission(): Promise<string> }) =>
    handle.queryPermission(),
}))

vi.mock(
  '@/lib/folder-run-identity',
  async () => import('@/lib/testing/fake-folder-run-identity'),
)

function folderConfig(overrides: Partial<AutoExportConfig> = {}) {
  return {
    enabled: true,
    interval: '1d',
    preferredTime: '00:00',
    dayOfWeek: 1,
    path: 'backups/snug',
    formats: ['json', 'csv'],
    keepLast: 10,
    destination: 'folder',
    folderName: 'Backups',
    ...overrides,
  } satisfies AutoExportConfig
}

function mockDownloadsAndBadge() {
  const download = vi.fn(async () => 1)
  browser.downloads.download = download as typeof browser.downloads.download
  browser.action.setBadgeText = vi.fn(async () => {}) as never
  browser.action.setBadgeBackgroundColor = vi.fn(async () => {}) as never
  return download
}

beforeEach(async () => {
  fakeBrowser.reset()
  resetFakeBookmarks()
  resetFakeI18n()
  resetFakeFolderIdentities()
  folderHandleMock.handle = null
  await exportFilenameTemplateStore.setValue('export')
})

describe('runAutoExport with the Custom folder destination', () => {
  it('writes every selected format into the subfolder using the filename template', async () => {
    const root = new FakeDirectoryHandle('Backups')
    folderHandleMock.handle = root
    await autoExportConfigStore.setValue(folderConfig())
    const download = mockDownloadsAndBadge()

    await runAutoExport('manual')

    const subfolder = root.directories.get('backups')?.directories.get('snug')
    expect(
      (subfolder?.files.keys().toArray() ?? []).toSorted((a, b) =>
        a.localeCompare(b),
      ),
    ).toEqual(['export.csv', 'export.json'])
    expect(download).not.toHaveBeenCalled()
    expect(await autoExportLastRunStore.getValue()).toMatchObject({
      ok: true,
      trigger: 'manual',
    })
  })

  it('uses a destination override instead of the stored one', async () => {
    const root = new FakeDirectoryHandle('Backups')
    folderHandleMock.handle = root
    await autoExportConfigStore.setValue(
      folderConfig({ destination: 'downloads', formats: ['json'], path: '' }),
    )
    const download = mockDownloadsAndBadge()

    await runAutoExport('manual', {
      formats: ['json'],
      path: '',
      destination: 'folder',
    })

    expect(root.files.has('export.json')).toBe(true)
    expect(download).not.toHaveBeenCalled()
  })

  it('never overwrites: an existing name gets (1), then (2)', async () => {
    const root = new FakeDirectoryHandle('Backups')
    folderHandleMock.handle = root
    await autoExportConfigStore.setValue(
      folderConfig({ formats: ['json'], path: '' }),
    )
    mockDownloadsAndBadge()
    root.files.set('export.json', 'original')

    await runAutoExport('manual')
    await runAutoExport('manual')

    expect(root.files.get('export.json')).toBe('original')
    expect(
      root.files
        .keys()
        .toArray()
        .toSorted((a, b) => a.localeCompare(b)),
    ).toEqual(['export (1).json', 'export (2).json', 'export.json'])
  })

  it.each([
    ['no handle is stored', null],
    ['access is not granted', new FakeDirectoryHandle('Backups', 'prompt')],
  ])(
    'fails the run with the Failure reason and no download when %s',
    async (_label, handle) => {
      folderHandleMock.handle = handle
      await autoExportConfigStore.setValue(folderConfig())
      await autoExportNotifyOnFailureStore.setValue(true)
      const download = mockDownloadsAndBadge()
      const create = vi.fn(async () => 'id')
      browser.notifications = {
        create,
        clear: vi.fn(),
      } as unknown as typeof browser.notifications

      await expect(runAutoExport('scheduled')).rejects.toThrow(
        'Folder access needed for "Backups"',
      )

      expect(download).not.toHaveBeenCalled()
      expect(await autoExportLastRunStore.getValue()).toMatchObject({
        ok: false,
        error: 'Folder access needed for "Backups"',
      })
      expect(create).toHaveBeenCalledTimes(1)
      expect(browser.action.setBadgeText).toHaveBeenCalledWith({ text: '!' })
    },
  )
})

describe('runAutoExport retention with the Custom folder destination', () => {
  it('records each written file and prunes the oldest runs beyond keepLast', async () => {
    const root = new FakeDirectoryHandle('Backups')
    folderHandleMock.handle = root
    await autoExportConfigStore.setValue(
      folderConfig({ formats: ['json'], path: 'backups', keepLast: 2 }),
    )
    mockDownloadsAndBadge()

    vi.useFakeTimers({ toFake: ['Date'] })
    try {
      for (let run = 0; run < 3; run++) {
        vi.setSystemTime(1000 + run)
        await runAutoExport('manual')
      }
    } finally {
      vi.useRealTimers()
    }

    const subfolder = root.directories.get('backups')
    expect(
      subfolder?.files
        .keys()
        .toArray()
        .toSorted((a, b) => a.localeCompare(b)),
    ).toEqual(['export (1).json', 'export (2).json'])
    const runs = await autoExportRunsStore.getValue()
    expect(runs).toHaveLength(2)
    expect(runs.every((run) => run.destination === 'folder')).toBe(true)
  })

  it('drops the runs of a previous Custom folder without deleting its files', async () => {
    const previous = new FakeDirectoryHandle('Previous')
    folderHandleMock.handle = previous
    await autoExportConfigStore.setValue(
      folderConfig({ formats: ['json'], path: '', keepLast: 1 }),
    )
    mockDownloadsAndBadge()
    await runAutoExport('manual')
    await new Promise((resolve) => setTimeout(resolve, 5))

    const current = new FakeDirectoryHandle('Current')
    folderHandleMock.handle = current
    await runAutoExport('manual')

    expect(previous.files.keys().toArray()).toEqual(['export.json'])
    expect(current.files.keys().toArray()).toEqual(['export.json'])
    const runs = await autoExportRunsStore.getValue()
    expect(runs).toHaveLength(1)
  })
})
