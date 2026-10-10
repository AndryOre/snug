/**
 * Highest ` (n)` suffix tried before giving up, so a pathological folder
 * cannot loop forever.
 */
const MAX_NAME_COLLISIONS = 10_000

async function hasFile(
  directory: FileSystemDirectoryHandle,
  name: string,
): Promise<boolean> {
  try {
    await directory.getFileHandle(name)
    return true
  } catch (error) {
    if (error instanceof DOMException && error.name === 'NotFoundError') {
      return false
    }
    throw error
  }
}

/**
 * Finds a file name that does not exist in `directory`: the plain name, else
 * `base (1).ext`, `base (2).ext`…
 * @param directory The folder the file will be written to.
 * @param baseName The file name without extension.
 * @param extension The extension without the dot.
 * @returns A name that is free in `directory`.
 */
async function resolveFreeName(
  directory: FileSystemDirectoryHandle,
  baseName: string,
  extension: string,
): Promise<string> {
  const plain = `${baseName}.${extension}`
  if (!(await hasFile(directory, plain))) return plain
  for (let suffix = 1; suffix <= MAX_NAME_COLLISIONS; suffix++) {
    const candidate = `${baseName} (${suffix}).${extension}`
    if (!(await hasFile(directory, candidate))) return candidate
  }
  throw new Error(`No free file name for ${plain}`)
}

/**
 * Writes one export file into the Custom folder, never overwriting: it
 * descends `subfolderPath` (creating missing segments), picks a free name
 * with a ` (1)`, ` (2)`… suffix on collision, and writes through a writable
 * stream. Runs in the service worker, where the handle is usable without a
 * gesture once Folder access is granted.
 * @param root The Custom folder's handle.
 * @param subfolderPath Already sanitized `/`-separated subfolder path; may be empty.
 * @param baseName The file name without extension.
 * @param extension The extension without the dot.
 * @param content The export content.
 * @returns The final file name that was written.
 */
export async function writeToCustomFolder(
  root: FileSystemDirectoryHandle,
  subfolderPath: string,
  baseName: string,
  extension: string,
  content: string,
): Promise<string> {
  let directory = root
  const segments = subfolderPath.split('/').filter(Boolean)
  for (const segment of segments) {
    directory = await directory.getDirectoryHandle(segment, { create: true })
  }
  const name = await resolveFreeName(directory, baseName, extension)
  const fileHandle = await directory.getFileHandle(name, { create: true })
  const writable = await fileHandle.createWritable()
  try {
    await writable.write(content)
  } catch (error) {
    await writable.abort()
    throw error
  }
  await writable.close()
  return name
}
