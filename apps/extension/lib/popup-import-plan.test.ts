import { beforeEach, describe, expect, it } from 'vitest'
import { fakeBrowser } from 'wxt/testing/fake-browser'

import {
  planPopupImport,
  planPopupImportBatch,
  POPUP_IMPORT_BOOKMARK_LIMIT,
} from './popup-import-plan'
import {
  resetFakeBookmarks,
  seedFakeBookmarksTree,
} from './testing/fake-bookmarks'

function csvWithBookmarks(count: number): string {
  const rows = Array.from(
    { length: count },
    (_, index) => `Bookmark ${index},https://new-${index}.example/page`,
  )
  return ['title,url', ...rows].join('\n')
}

const EXISTING_ROW = 'Dup,https://existing.example/page'

const BAR_JSON = JSON.stringify({
  id: '1',
  title: 'Bookmarks bar',
  dateAdded: 0,
  children: [{ title: 'A', url: 'https://a.example/page', dateAdded: 0 }],
})

beforeEach(() => {
  fakeBrowser.reset()
  resetFakeBookmarks()
  seedFakeBookmarksTree([
    {
      id: 'seed',
      title: 'Existing',
      url: 'https://existing.example/page',
      syncing: false,
    },
  ])
})

describe('planPopupImport', () => {
  it('imports a small file in the popup', async () => {
    const plan = await planPopupImport({
      text: csvWithBookmarks(3),
      mimeType: 'text/csv',
      fileName: 'a.csv',
      mode: 'folder',
      skipDuplicates: true,
    })
    expect(plan).toEqual({ kind: 'import', mode: 'folder' })
  })

  it('routes a file above the limit to the App page', async () => {
    const plan = await planPopupImport({
      text: csvWithBookmarks(POPUP_IMPORT_BOOKMARK_LIMIT + 1),
      mimeType: 'text/csv',
      fileName: 'a.csv',
      mode: 'folder',
      skipDuplicates: false,
    })
    expect(plan).toEqual({ kind: 'app' })
  })

  it('keeps a file exactly at the limit in the popup', async () => {
    const plan = await planPopupImport({
      text: csvWithBookmarks(POPUP_IMPORT_BOOKMARK_LIMIT),
      mimeType: 'text/csv',
      fileName: 'a.csv',
      mode: 'folder',
      skipDuplicates: false,
    })
    expect(plan.kind).toBe('import')
  })

  it('counts only the bookmarks left after Skip duplicates against the limit', async () => {
    const text = `${csvWithBookmarks(POPUP_IMPORT_BOOKMARK_LIMIT)}\n${EXISTING_ROW}`
    const plan = await planPopupImport({
      text,
      mimeType: 'text/csv',
      fileName: 'a.csv',
      mode: 'folder',
      skipDuplicates: true,
    })
    expect(plan.kind).toBe('import')
  })

  it('reports all-duplicates instead of creating empty folders', async () => {
    const plan = await planPopupImport({
      text: `title,url\n${EXISTING_ROW}`,
      mimeType: 'text/csv',
      fileName: 'a.csv',
      mode: 'folder',
      skipDuplicates: true,
    })
    expect(plan).toEqual({ kind: 'all-duplicates', skippedDuplicates: 1 })
  })

  it('imports an all-duplicates file when Skip duplicates is off', async () => {
    const plan = await planPopupImport({
      text: `title,url\n${EXISTING_ROW}`,
      mimeType: 'text/csv',
      fileName: 'a.csv',
      mode: 'folder',
      skipDuplicates: false,
    })
    expect(plan.kind).toBe('import')
  })

  it('always routes restore-replace to the App page', async () => {
    const plan = await planPopupImport({
      text: BAR_JSON,
      mimeType: 'application/json',
      fileName: 'a.json',
      mode: 'restore-replace',
      skipDuplicates: true,
    })
    expect(plan).toEqual({ kind: 'app' })
  })

  it('falls back to folder mode for a file without location data', async () => {
    const plan = await planPopupImport({
      text: csvWithBookmarks(1),
      mimeType: 'text/csv',
      fileName: 'a.csv',
      mode: 'restore-replace',
      skipDuplicates: true,
    })
    expect(plan).toEqual({ kind: 'import', mode: 'folder' })
  })

  it('rejects an unsupported format', async () => {
    await expect(
      planPopupImport({
        text: 'plain notes',
        mimeType: 'text/plain',
        fileName: 'a.txt',
        mode: 'folder',
        skipDuplicates: true,
      }),
    ).rejects.toThrow('Unsupported file format')
  })

  it('rejects a file with no bookmarks', async () => {
    await expect(
      planPopupImport({
        text: '[]',
        mimeType: 'application/json',
        fileName: 'a.json',
        mode: 'folder',
        skipDuplicates: true,
      }),
    ).rejects.toThrow('No bookmarks found')
  })
})

function csvRequest(count: number, offset: number) {
  const rows = Array.from(
    { length: count },
    (_, index) => `B ${index},https://batch-${offset + index}.example/page`,
  )
  return {
    text: ['title,url', ...rows].join('\n'),
    mimeType: 'text/csv',
    fileName: `file-${offset}.csv`,
    mode: 'folder' as const,
    skipDuplicates: false,
  }
}

describe('planPopupImportBatch', () => {
  it('sums the files against the 200 rule', async () => {
    const half = POPUP_IMPORT_BOOKMARK_LIMIT / 2
    expect(
      await planPopupImportBatch([csvRequest(half, 0), csvRequest(half, 1000)]),
    ).toEqual({ kind: 'import', mode: 'folder' })
    expect(
      await planPopupImportBatch([
        csvRequest(half, 0),
        csvRequest(half + 1, 1000),
      ]),
    ).toEqual({ kind: 'app' })
  })

  it('counts a URL shared by two files once with Skip duplicates', async () => {
    const same = { ...csvRequest(150, 0), skipDuplicates: true }
    expect(
      await planPopupImportBatch([same, { ...same, fileName: 'again.csv' }]),
    ).toEqual({ kind: 'import', mode: 'folder' })
  })

  it('sends Restore-replace with two files to the App page', async () => {
    const request = { ...csvRequest(1, 0), mode: 'restore-replace' as const }
    expect(await planPopupImportBatch([request, request])).toEqual({
      kind: 'app',
    })
  })
})
