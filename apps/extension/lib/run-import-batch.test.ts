// @vitest-environment jsdom
import type { Browser } from '@wxt-dev/browser'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fakeBrowser } from 'wxt/testing/fake-browser'

import { ImportCanceledError, type ImportProgress } from './import-control'
import {
  ImportBatchReplaceError,
  runImportBatch,
  stripFileExtension,
} from './run-import-batch'
import { readLatestSafetySnapshot } from './safety-snapshot'
import { resetFakeBookmarks } from './testing/fake-bookmarks'

vi.mock('./offscreen-download', () => ({
  downloadViaOffscreenDocument: vi.fn().mockResolvedValue(1),
}))

function htmlFile(urls: string[]): string {
  const links = urls.map((url) => `<DT><A HREF="${url}">${url}</A>`).join('\n')
  return `<!DOCTYPE NETSCAPE-Bookmark-file-1><DL><p>
<DT><H3 PERSONAL_TOOLBAR_FOLDER="true">Bookmarks bar</H3><DL><p>${links}</DL><p></DL>`
}

function batchFile(fileName: string, urls: string[]) {
  return { text: htmlFile(urls), mimeType: 'text/html', fileName }
}

async function allUrls(): Promise<string[]> {
  const urls: string[] = []
  const visit = (nodes: Browser.bookmarks.BookmarkTreeNode[]): void => {
    for (const node of nodes) {
      if (node.url) urls.push(node.url)
      if (node.children) visit(node.children)
    }
  }
  visit(await browser.bookmarks.getTree())
  return urls
}

async function rootFolderTitles(): Promise<string[]> {
  const [root] = await browser.bookmarks.getTree()
  return (root?.children ?? []).flatMap((child) =>
    (child.children ?? [])
      .filter((node) => !node.url)
      .map((node) => node.title),
  )
}

beforeEach(() => {
  fakeBrowser.reset()
  resetFakeBookmarks()
})

describe('stripFileExtension', () => {
  it('drops only the last extension', () => {
    expect(stripFileExtension('work.backup.html')).toBe('work.backup')
    expect(stripFileExtension('notes')).toBe('notes')
  })
})

describe('runImportBatch', () => {
  it('imports two files in order and creates a shared URL once', async () => {
    const events: ImportProgress[] = []
    const result = await runImportBatch(
      [
        batchFile('a.html', ['https://a.example/', 'https://shared.example/']),
        batchFile('b.html', ['https://shared.example/', 'https://b.example/']),
      ],
      'restore-merge',
      {
        skipDuplicates: true,
        onProgress: (event) => {
          events.push(event)
        },
      },
    )

    const urls = await allUrls()
    expect(result.skippedDuplicates).toBe(1)
    expect(urls.toSorted((a, b) => a.localeCompare(b))).toEqual([
      'https://a.example/',
      'https://b.example/',
      'https://shared.example/',
    ])
    expect(events.at(-1)).toMatchObject({ done: 3, total: 3 })
  })

  it('removes everything both files created when canceled in the second', async () => {
    const controller = new AbortController()
    const original = fakeBrowser.bookmarks.create
    const create = original as unknown as (
      details: Browser.bookmarks.CreateDetails,
    ) => Promise<Browser.bookmarks.BookmarkTreeNode>
    let created = 0
    fakeBrowser.bookmarks.create = (async (
      details: Browser.bookmarks.CreateDetails,
    ) => {
      const node = await create(details)
      created++
      if (created === 3) controller.abort()
      return node
    }) as typeof original

    await expect(
      runImportBatch(
        [
          batchFile('a.html', ['https://a.example/', 'https://a2.example/']),
          batchFile('b.html', ['https://b.example/', 'https://b2.example/']),
        ],
        'restore-merge',
        { signal: controller.signal },
      ),
    ).rejects.toBeInstanceOf(ImportCanceledError)
    fakeBrowser.bookmarks.create = original

    expect(await allUrls()).toEqual([])
  })

  it('creates one named folder per file in Folder mode', async () => {
    await runImportBatch(
      [
        batchFile('work.html', ['https://a.example/']),
        batchFile('home.json.html', ['https://b.example/']),
      ],
      'folder',
    )

    const titles = await rootFolderTitles()
    expect(titles.toSorted((a, b) => a.localeCompare(b))).toEqual([
      'home.json',
      'work',
    ])
  })

  it('keeps Imported bookmarks for a single file', async () => {
    await runImportBatch(
      [batchFile('work.html', ['https://a.example/'])],
      'folder',
    )

    const titles = await rootFolderTitles()
    expect(titles).not.toContain('work')
    expect(titles).toHaveLength(1)
  })

  it('rejects Restore-replace with two or more files', async () => {
    await expect(
      runImportBatch(
        [batchFile('a.html', []), batchFile('b.html', [])],
        'restore-replace',
      ),
    ).rejects.toBeInstanceOf(ImportBatchReplaceError)
  })

  it('takes a Safety snapshot before a single-file Restore-replace', async () => {
    const [root] = await browser.bookmarks.getTree()
    const bar = root?.children?.[0]
    await browser.bookmarks.create({
      parentId: bar?.id,
      title: 'Old',
      url: 'https://old.example/',
    })

    await runImportBatch(
      [batchFile('a.html', ['https://new.example/'])],
      'restore-replace',
    )

    const stored = await readLatestSafetySnapshot()
    expect(stored?.roots[0]?.children?.[0]?.url).toBe('https://old.example/')
    expect(await allUrls()).toEqual(['https://new.example/'])
  })

  it('writes a pruned tree instead of the parsed one', async () => {
    await runImportBatch(
      [
        {
          ...batchFile('a.html', ['https://a.example/', 'https://b.example/']),
          prunedTree: [
            {
              id: '2',
              title: 'Other',
              isOtherBookmarks: true,
              dateAdded: 0,
              children: [
                { title: 'Kept', url: 'https://kept.example/', dateAdded: 0 },
              ],
            },
          ],
        },
      ],
      'restore-merge',
    )

    expect(await allUrls()).toEqual(['https://kept.example/'])
  })
})
