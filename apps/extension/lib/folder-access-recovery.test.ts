// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fakeBrowser } from 'wxt/testing/fake-browser'

import {
  allowFolderAccess,
  readFolderAccess,
  resolveFolderAccessAlert,
} from '@/lib/folder-access-recovery'

const folderHandleMock = vi.hoisted(() => ({
  handle: null as null | {
    request(): Promise<string>
    queryPermission(): Promise<string>
  },
}))

vi.mock('@/lib/folder-handle', () => ({
  loadFolderHandle: async () => folderHandleMock.handle,
  queryFolderAccess: async (handle: { queryPermission(): Promise<string> }) =>
    handle.queryPermission(),
  requestFolderAccess: async (handle: { request(): Promise<string> }) =>
    handle.request(),
}))

function makeHandle(result: string) {
  return {
    request: async () => result,
    queryPermission: async () => 'prompt',
  }
}

describe('resolveFolderAccessAlert', () => {
  it('hides the alert without a Custom folder, when granted or unknown', () => {
    const base = { isFolderDestination: true, wasRefused: false }
    expect(
      resolveFolderAccessAlert({
        ...base,
        isFolderDestination: false,
        access: 'prompt',
      }),
    ).toBe('hidden')
    expect(resolveFolderAccessAlert({ ...base, access: 'granted' })).toBe(
      'hidden',
    )
    expect(resolveFolderAccessAlert({ ...base, access: null })).toBe('hidden')
  })

  it('shows the needed alert for prompt, denied and missing access', () => {
    for (const access of ['prompt', 'denied', 'missing'] as const) {
      expect(
        resolveFolderAccessAlert({
          isFolderDestination: true,
          access,
          wasRefused: false,
        }),
      ).toBe('needed')
    }
  })

  it('shows the refused message after a declined request', () => {
    expect(
      resolveFolderAccessAlert({
        isFolderDestination: true,
        access: 'prompt',
        wasRefused: true,
      }),
    ).toBe('refused')
  })
})

describe('allowFolderAccess', () => {
  beforeEach(() => {
    fakeBrowser.reset()
    browser.action.setBadgeText = vi.fn(async () => {}) as never
    folderHandleMock.handle = null
  })

  it('clears the badge when access is granted', async () => {
    folderHandleMock.handle = makeHandle('granted')
    await expect(allowFolderAccess()).resolves.toBe('granted')
    expect(browser.action.setBadgeText).toHaveBeenCalledWith({ text: '' })
  })

  it('reports refused and keeps the badge when not granted', async () => {
    folderHandleMock.handle = makeHandle('denied')
    await expect(allowFolderAccess()).resolves.toBe('refused')
    expect(browser.action.setBadgeText).not.toHaveBeenCalled()
  })

  it('reports missing without crashing when no handle is stored', async () => {
    await expect(allowFolderAccess()).resolves.toBe('missing')
    await expect(readFolderAccess()).resolves.toBe('missing')
  })
})
