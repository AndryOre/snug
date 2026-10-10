const identities = new Map<string, FileSystemDirectoryHandle>()

/**
 * Clears the in-memory folder identities between tests.
 */
export function resetFakeFolderIdentities(): void {
  identities.clear()
}

/**
 * In-memory stand-in for `registerFolderIdentity` in
 * `lib/folder-run-identity.ts`.
 * @param handle The Custom folder handle.
 * @returns The id of the known identity for that folder, or a new one.
 */
export async function registerFolderIdentity(
  handle: FileSystemDirectoryHandle,
): Promise<string> {
  for (const [id, known] of identities) {
    if (await known.isSameEntry(handle)) return id
  }
  const id = `folder-${identities.size + 1}`
  identities.set(id, handle)
  return id
}

/**
 * In-memory stand-in for `isCurrentFolder`.
 * @param folderId The recorded identity id.
 * @param current The current Custom folder handle.
 * @returns Whether the identity is the same entry as `current`.
 */
export async function isCurrentFolder(
  folderId: string,
  current: FileSystemDirectoryHandle,
): Promise<boolean> {
  const known = identities.get(folderId)
  return known ? known.isSameEntry(current) : false
}

/**
 * In-memory stand-in for `pruneFolderIdentities`.
 * @param keepIds The identity ids still referenced.
 */
export async function pruneFolderIdentities(
  keepIds: readonly string[],
): Promise<void> {
  for (const id of identities.keys()) {
    if (!keepIds.includes(id)) identities.delete(id)
  }
}
