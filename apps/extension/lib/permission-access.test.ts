import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  hasDownloadsAccess,
  hasNotificationAccess,
  didUserGrantAccess,
  watchAccessChanges,
} from './permission-access'

function mockPermissionsApi(options: {
  isGranted?: boolean
  approve?: boolean
}) {
  type PermissionsListener = (changed: { permissions?: string[] }) => void
  const added: PermissionsListener[] = []
  const removed: PermissionsListener[] = []
  const isGrantedLookup = vi.fn(async (query: unknown) => {
    void query
    return options.isGranted ?? false
  })
  const isRequestApproved = vi.fn(async (query: unknown) => {
    void query
    return options.approve ?? false
  })
  browser.permissions = {
    contains: isGrantedLookup,
    request: isRequestApproved,
    onAdded: {
      addListener: (listener: PermissionsListener) => {
        added.push(listener)
      },
      removeListener: (listener: PermissionsListener) =>
        added.splice(added.indexOf(listener), 1),
    },
    onRemoved: {
      addListener: (listener: PermissionsListener) => {
        removed.push(listener)
      },
      removeListener: (listener: PermissionsListener) =>
        removed.splice(removed.indexOf(listener), 1),
    },
  } as unknown as typeof browser.permissions
  return {
    isGrantedLookup,
    isRequestApproved,
    added,
    removed,
  }
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('hasDownloadsAccess / hasNotificationAccess', () => {
  it('reports granted access', async () => {
    const { isGrantedLookup } = mockPermissionsApi({ isGranted: true })

    expect(await hasDownloadsAccess()).toBe(true)
    expect(await hasNotificationAccess()).toBe(true)
    expect(isGrantedLookup).toHaveBeenCalledWith({ permissions: ['downloads'] })
    expect(isGrantedLookup).toHaveBeenCalledWith({
      permissions: ['notifications'],
    })
  })

  it('reports missing access', async () => {
    mockPermissionsApi({ isGranted: false })

    expect(await hasDownloadsAccess()).toBe(false)
    expect(await hasNotificationAccess()).toBe(false)
  })

  it('treats a rejected lookup as missing and logs it', async () => {
    const { isGrantedLookup } = mockPermissionsApi({})
    isGrantedLookup.mockRejectedValueOnce(new Error('boom'))
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(await hasDownloadsAccess()).toBe(false)
    expect(consoleError).toHaveBeenCalled()
  })

  it('treats an undefined permissions API as missing', async () => {
    browser.permissions = undefined as unknown as typeof browser.permissions
    vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(await hasNotificationAccess()).toBe(false)
  })
})

describe('didUserGrantAccess', () => {
  it('resolves true when the user approves', async () => {
    const { isRequestApproved } = mockPermissionsApi({ approve: true })

    expect(await didUserGrantAccess('downloads', 'notifications')).toBe(true)
    expect(isRequestApproved).toHaveBeenCalledWith({
      permissions: ['downloads', 'notifications'],
    })
  })

  it('resolves false when the user denies', async () => {
    mockPermissionsApi({ approve: false })

    expect(await didUserGrantAccess('downloads')).toBe(false)
  })

  it('resolves false and logs when the request rejects', async () => {
    const { isRequestApproved } = mockPermissionsApi({})
    isRequestApproved.mockRejectedValueOnce(new Error('no gesture'))
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(await didUserGrantAccess('notifications')).toBe(false)
    expect(consoleError).toHaveBeenCalled()
  })

  it('calls permissions.request synchronously, before any await', () => {
    const { isRequestApproved } = mockPermissionsApi({ approve: true })

    void didUserGrantAccess('downloads')

    expect(isRequestApproved).toHaveBeenCalledTimes(1)
  })
})

describe('watchAccessChanges', () => {
  it('reports a grant from onAdded', () => {
    const { added } = mockPermissionsApi({})
    const listener = vi.fn()
    watchAccessChanges(listener)

    added[0]?.({ permissions: ['notifications'] })

    expect(listener).toHaveBeenCalledWith({
      permission: 'notifications',
      isGranted: true,
    })
  })

  it('reports a revocation from onRemoved', () => {
    const { removed } = mockPermissionsApi({})
    const listener = vi.fn()
    watchAccessChanges(listener)

    removed[0]?.({ permissions: ['downloads', 'bookmarks'] })

    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledWith({
      permission: 'downloads',
      isGranted: false,
    })
  })

  it('ignores unrelated permissions', () => {
    const { added } = mockPermissionsApi({})
    const listener = vi.fn()
    watchAccessChanges(listener)

    added[0]?.({ permissions: ['bookmarks'] })
    added[0]?.({})

    expect(listener).not.toHaveBeenCalled()
  })

  it('stops reporting after unsubscribe', () => {
    const { added, removed } = mockPermissionsApi({})
    const stop = watchAccessChanges(vi.fn())

    stop()

    expect(added).toHaveLength(0)
    expect(removed).toHaveLength(0)
  })
})
