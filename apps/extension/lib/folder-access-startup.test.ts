// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fakeBrowser } from 'wxt/testing/fake-browser'

import { checkFolderAccessAtStartup } from '@/lib/folder-access-startup'
import {
  autoExportConfigStore,
  autoExportNotifyOnFailureStore,
} from '@/lib/storage'
import { FakeDirectoryHandle } from '@/lib/testing/fake-directory-handle'
import { resetFakeI18n } from '@/lib/testing/fake-i18n'
import type { AutoExportConfig } from '@/lib/types'

const folderHandleMock = vi.hoisted(() => ({
  handle: null as unknown,
}))

vi.mock('@/lib/folder-handle', async () => ({
  loadFolderHandle: async () => folderHandleMock.handle,
  queryFolderAccess: async (handle: { queryPermission(): Promise<string> }) =>
    handle.queryPermission(),
}))

function config(overrides: Partial<AutoExportConfig> = {}): AutoExportConfig {
  return {
    enabled: true,
    interval: '1d',
    preferredTime: '00:00',
    dayOfWeek: 1,
    path: 'backups/snug',
    formats: ['json'],
    keepLast: 10,
    destination: 'folder',
    folderName: 'Backups',
    ...overrides,
  }
}

function mockBrowserApis() {
  const create = vi.fn(async (id: string, ...rest: unknown[]) => {
    void rest
    return id
  })
  browser.notifications = {
    create,
    clear: vi.fn(),
  } as unknown as typeof browser.notifications
  const setBadgeText = vi.fn(async () => {})
  browser.action.setBadgeText = setBadgeText as never
  browser.action.setBadgeBackgroundColor = vi.fn(async () => {}) as never
  return { create, setBadgeText }
}

beforeEach(async () => {
  fakeBrowser.reset()
  resetFakeI18n()
  folderHandleMock.handle = null
  await autoExportNotifyOnFailureStore.setValue(true)
})

describe('checkFolderAccessAtStartup', () => {
  it('notifies and sets the badge when Folder access is not granted', async () => {
    folderHandleMock.handle = new FakeDirectoryHandle('Backups', 'prompt')
    await autoExportConfigStore.setValue(config())
    const { create, setBadgeText } = mockBrowserApis()

    await checkFolderAccessAtStartup()

    expect(create).toHaveBeenCalledWith(
      'auto-export-failure',
      expect.objectContaining({
        message: 'Reason: Folder access needed for "Backups"',
      }),
    )
    expect(setBadgeText).toHaveBeenCalledWith({ text: '!' })
  })

  it('treats a missing handle as no Folder access', async () => {
    await autoExportConfigStore.setValue(config())
    const { create, setBadgeText } = mockBrowserApis()

    await checkFolderAccessAtStartup()

    expect(create).toHaveBeenCalledTimes(1)
    expect(setBadgeText).toHaveBeenCalledWith({ text: '!' })
  })

  it('does nothing when Folder access is granted', async () => {
    folderHandleMock.handle = new FakeDirectoryHandle('Backups', 'granted')
    await autoExportConfigStore.setValue(config())
    const { create, setBadgeText } = mockBrowserApis()

    await checkFolderAccessAtStartup()

    expect(create).not.toHaveBeenCalled()
    expect(setBadgeText).not.toHaveBeenCalled()
  })

  it('still sets the badge but skips the notification when notify-on-failure is off', async () => {
    folderHandleMock.handle = new FakeDirectoryHandle('Backups', 'prompt')
    await autoExportConfigStore.setValue(config())
    await autoExportNotifyOnFailureStore.setValue(false)
    const { create, setBadgeText } = mockBrowserApis()

    await checkFolderAccessAtStartup()

    expect(create).not.toHaveBeenCalled()
    expect(setBadgeText).toHaveBeenCalledWith({ text: '!' })
  })

  it.each([
    ['the destination is Downloads', config({ destination: 'downloads' })],
    ['Auto-export is disabled', config({ enabled: false })],
  ])('does nothing when %s', async (_label, stored) => {
    folderHandleMock.handle = new FakeDirectoryHandle('Backups', 'prompt')
    await autoExportConfigStore.setValue(stored)
    const { create, setBadgeText } = mockBrowserApis()

    await checkFolderAccessAtStartup()

    expect(create).not.toHaveBeenCalled()
    expect(setBadgeText).not.toHaveBeenCalled()
  })
})
