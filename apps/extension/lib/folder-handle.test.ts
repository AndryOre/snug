// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'

import { FakeDirectoryHandle } from '@/lib/testing/fake-directory-handle'

import {
  clearFolderHandle,
  loadFolderHandle,
  queryFolderAccess,
  queryStoredFolderAccess,
  saveFolderHandle,
} from './folder-handle'

/**
 * Minimal `indexedDB` fake: one in-memory map per database name, with the
 * request/transaction surface `folder-handle` uses.
 */
function installFakeIndexedDatabase(): void {
  const databases = new Map<string, Map<string, unknown>>()

  function request<T>(compute: () => T): IDBRequest<T> {
    const fake = { addEventListener: () => {} } as unknown as IDBRequest<T>
    queueMicrotask(() => {
      Object.assign(fake, { result: compute() })
      fake.onsuccess?.(new Event('success'))
    })
    return fake
  }

  const indexedDatabaseFake = {
    open(name: string) {
      const fake = {
        addEventListener: () => {},
      } as unknown as IDBOpenDBRequest
      queueMicrotask(() => {
        const isNew = !databases.has(name)
        const store = databases.get(name) ?? new Map<string, unknown>()
        databases.set(name, store)
        const database = {
          createObjectStore: () => {},
          close: () => {},
          transaction: () => ({
            objectStore: () => ({
              put: (value: unknown, key: string) =>
                request(() => store.set(key, value) && key),
              get: (key: string) => request(() => store.get(key)),
              delete: (key: string) => request(() => store.delete(key)),
            }),
          }),
        }
        Object.assign(fake, { result: database })
        if (isNew) fake.onupgradeneeded?.(new Event('upgradeneeded') as never)
        fake.onsuccess?.(new Event('success'))
      })
      return fake
    },
  }
  Object.assign(globalThis, { indexedDB: indexedDatabaseFake })
}

beforeEach(() => {
  installFakeIndexedDatabase()
})

describe('folder-handle', () => {
  it('returns null and reports missing access before a handle is saved', async () => {
    expect(await loadFolderHandle()).toBeNull()
    expect(await queryStoredFolderAccess()).toBe('missing')
  })

  it('saves, loads and clears the handle', async () => {
    const handle = new FakeDirectoryHandle('Backups').asHandle()

    await saveFolderHandle(handle)
    expect(await loadFolderHandle()).toBe(handle)

    await clearFolderHandle()
    expect(await loadFolderHandle()).toBeNull()
  })

  it('reports the access the handle gives', async () => {
    const handle = new FakeDirectoryHandle('Backups', 'prompt')

    expect(await queryFolderAccess(handle.asHandle())).toBe('prompt')

    await saveFolderHandle(handle.asHandle())
    expect(await queryStoredFolderAccess()).toBe('prompt')
  })
})
