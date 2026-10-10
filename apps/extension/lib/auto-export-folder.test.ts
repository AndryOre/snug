// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fakeBrowser } from 'wxt/testing/fake-browser'

import {
  autoExportConfigStore,
  autoExportLastRunStore,
  autoExportNotifyOnFailureStore,
  exportFilenameTemplateStore,
} from '@/lib/storage'
import { resetFakeBookmarks } from '@/lib/testing/fake-bookmarks'
import { FakeDirectoryHandle } from '@/lib/testing/fake-directory-handle'
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
