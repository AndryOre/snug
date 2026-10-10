const DATABASE_NAME = 'snug-custom-folder-identities'
const STORE_NAME = 'folders'

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1)
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME)
    }
    request.onsuccess = () => resolve(request.result)
    request.addEventListener('error', () => reject(request.error))
  })
}

async function runRequest<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const database = await openDatabase()
  try {
    return await new Promise<T>((resolve, reject) => {
      const request = operation(
        database.transaction(STORE_NAME, mode).objectStore(STORE_NAME),
      )
      request.onsuccess = () => resolve(request.result)
      request.addEventListener('error', () => reject(request.error))
    })
  } finally {
    database.close()
  }
}

async function listIdentities(): Promise<
  { id: string; handle: FileSystemDirectoryHandle }[]
> {
  const [ids, handles] = await Promise.all([
    runRequest<IDBValidKey[]>('readonly', (store) => store.getAllKeys()),
    runRequest<FileSystemDirectoryHandle[]>('readonly', (store) =>
      store.getAll(),
    ),
  ])
  return ids.map((id, index) => ({
    id: String(id),
    handle: handles[index] as FileSystemDirectoryHandle,
  }))
}

/**
 * Names a folder so a retention history entry can later tell which folder it
 * was saved in. A handle cannot live in `chrome.storage`, so every distinct
 * folder is kept in IndexedDB under a generated id, and a folder already known
 * (`isSameEntry`) reuses its id.
 * @param handle The Custom folder a run is saving into.
 * @returns The folder's identity id.
 */
export async function registerFolderIdentity(
  handle: FileSystemDirectoryHandle,
): Promise<string> {
  const knownIdentities = await listIdentities()
  for (const known of knownIdentities) {
    if (await known.handle.isSameEntry(handle)) return known.id
  }
  const id = crypto.randomUUID()
  await runRequest('readwrite', (store) => store.put(handle, id))
  return id
}

/**
 * Checks whether a recorded folder is the Custom folder as it is now.
 * @param folderId The identity id stored with a folder run.
 * @param current The Custom folder's stored handle.
 * @returns `true` only when the identity is known and is the same entry as
 * `current`; an unknown identity can never be trusted with a deletion.
 */
export async function isCurrentFolder(
  folderId: string,
  current: FileSystemDirectoryHandle,
): Promise<boolean> {
  const identities = await listIdentities()
  const known = identities.find(({ id }) => id === folderId)
  return known ? known.handle.isSameEntry(current) : false
}

/**
 * Forgets every folder identity no history entry refers to any more.
 * @param keepIds The identity ids still referenced by the history.
 * @returns Resolves once the unreferenced identities are removed.
 */
export async function pruneFolderIdentities(
  keepIds: readonly string[],
): Promise<void> {
  const identities = await listIdentities()
  for (const { id } of identities) {
    if (!keepIds.includes(id)) {
      await runRequest('readwrite', (store) => store.delete(id))
    }
  }
}
