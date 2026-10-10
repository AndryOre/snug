/**
 * In-memory stand-in for the slice of `FileSystemDirectoryHandle` the Custom
 * folder writer uses, so unit tests run without a real file system. Files are
 * kept as text keyed by name; subdirectories are nested fakes.
 */
export class FakeDirectoryHandle {
  readonly kind = 'directory'
  readonly files = new Map<string, string>()
  readonly directories = new Map<string, FakeDirectoryHandle>()
  readonly name: string
  permission: PermissionState

  constructor(name: string, permission: PermissionState = 'granted') {
    this.name = name
    this.permission = permission
  }

  async queryPermission(): Promise<PermissionState> {
    return this.permission
  }

  async getDirectoryHandle(
    name: string,
    options?: { create?: boolean },
  ): Promise<FakeDirectoryHandle> {
    const existing = this.directories.get(name)
    if (existing) return existing
    if (!options?.create) {
      throw new DOMException('not found', 'NotFoundError')
    }
    const created = new FakeDirectoryHandle(name)
    this.directories.set(name, created)
    return created
  }

  async isSameEntry(other: unknown): Promise<boolean> {
    return other === this
  }

  async removeEntry(name: string): Promise<void> {
    if (!this.files.delete(name)) {
      throw new DOMException('not found', 'NotFoundError')
    }
  }

  async getFileHandle(name: string, options?: { create?: boolean }) {
    if (!this.files.has(name)) {
      if (!options?.create) {
        throw new DOMException('not found', 'NotFoundError')
      }
      this.files.set(name, '')
    }
    return {
      kind: 'file',
      name,
      createWritable: async () => {
        let pending = ''
        return {
          write: async (chunk: string) => {
            pending += chunk
          },
          close: async () => {
            this.files.set(name, pending)
          },
          abort: async () => {},
        }
      },
    }
  }

  asHandle(): FileSystemDirectoryHandle {
    return this as unknown as FileSystemDirectoryHandle
  }
}
