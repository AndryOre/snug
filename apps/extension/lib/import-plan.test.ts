// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fakeBrowser } from 'wxt/testing/fake-browser'

import safariHtml from '../e2e/fixtures/bookmarks-safari.html?raw'
import singleRootJson from '../e2e/fixtures/bookmarks-single-root.json?raw'
import csvSkipped from '../e2e/fixtures/bookmarks-skipped.csv?raw'
import csv from '../e2e/fixtures/bookmarks.csv?raw'
import html from '../e2e/fixtures/bookmarks.html?raw'
import plainJson from '../e2e/fixtures/bookmarks.json?raw'
import xbel from '../e2e/fixtures/bookmarks.xbel?raw'
import chromeProfileJson from '../e2e/fixtures/chrome-profile-bookmarks.json?raw'
import { countBookmarks } from './count-bookmarks'
import { normalizeUrl } from './duplicates'
import {
  buildImportPlan,
  type PlanBookmark,
  type PlanNode,
  pruneFilesToChecked,
} from './import-plan'
import { getImportPreview } from './import-preview'
import { parseImportFile } from './importers/parse-import'
import { getReplaceDiff } from './replace-diff'
import { importTree } from './run-import'
import { collectExistingUrls } from './skip-duplicates'
import {
  getFakeBookmarksRoot,
  resetFakeBookmarks,
  seedFakeBookmarksTree,
} from './testing/fake-bookmarks'
import type { ParsedBookmark } from './types'

vi.mock('./offscreen-download', () => ({
  downloadViaOffscreenDocument: vi.fn(async () => 1),
}))

const FIXTURES: [string, string, string, string][] = [
  ['html', html, 'text/html', 'bookmarks.html'],
  ['json', plainJson, 'application/json', 'bookmarks.json'],
  ['json single root', singleRootJson, 'application/json', 'single.json'],
  ['chrome', chromeProfileJson, 'application/json', 'Bookmarks'],
  ['xbel', xbel, 'application/xml', 'bookmarks.xbel'],
  ['safari', safariHtml, 'text/html', 'Safari.html'],
  ['csv', csv, 'text/csv', 'bookmarks.csv'],
  ['csv skipped', csvSkipped, 'text/csv', 'skipped.csv'],
]

const KEPT = {
  id: 'x',
  title: 'Kept',
  url: 'https://kept.example/',
  syncing: false,
}

function leaves(nodes: PlanNode[]): PlanBookmark[] {
  return nodes.flatMap((node) =>
    node.kind === 'bookmark' ? [node] : leaves(node.children),
  )
}

function mark(title: string, url: string): ParsedBookmark {
  return { title, url, dateAdded: 1 }
}

function barFile(...children: ParsedBookmark[]) {
  return {
    format: 'json' as const,
    hasLocationData: true,
    skippedInvalidUrl: 0 as const,
    tree: [
      {
        title: 'Bar',
        dateAdded: 1,
        isBookmarksBar: true,
        folderType: 'bookmarks-bar',
        syncing: false,
        children,
      },
    ],
  }
}

beforeEach(() => {
  fakeBrowser.reset()
  resetFakeBookmarks({ withMobileRoot: true })
})

describe('buildImportPlan', () => {
  describe.each(FIXTURES)('%s', (_name, text, mimeType, fileName) => {
    it.each([true, false])(
      'new count equals created bookmarks with Skip duplicates %s',
      async (skipDuplicates) => {
        seedFakeBookmarksTree([
          KEPT,
          { ...KEPT, id: 'y', url: 'https://example.com/' },
        ])
        const file = parseImportFile(text, mimeType, fileName)
        const liveTree = await browser.bookmarks.getTree()
        const plan = buildImportPlan({
          files: [{ file }],
          liveTree,
          mode: 'folder',
          skipDuplicates,
        })
        const before = countBookmarks(liveTree)

        await importTree(file, 'folder', { skipDuplicates })

        const after = countBookmarks(getFakeBookmarksRoot().children ?? [])
        expect(plan.counts.new).toBe(after - before)
      },
    )

    it.runIf(!_name.startsWith('csv'))(
      'removed list matches the replace diff and what a replace deletes',
      async () => {
        seedFakeBookmarksTree(
          [KEPT],
          [
            {
              id: 'f',
              title: 'F',
              dateAdded: 1,
              syncing: false,
              children: [{ ...KEPT, id: 'z', url: 'https://z.example/' }],
            },
          ],
        )
        const file = parseImportFile(text, mimeType, fileName)
        const plan = buildImportPlan({
          files: [{ file }],
          liveTree: await browser.bookmarks.getTree(),
          mode: 'restore-replace',
          skipDuplicates: true,
        })
        const diff = await getReplaceDiff(
          getImportPreview(text, mimeType, fileName),
        )
        await importTree(file, 'restore-replace')

        const liveUrls = collectExistingUrls(await browser.bookmarks.getTree())
        expect(plan.removed).toHaveLength(diff.removedCount)
        expect(plan.removed.map((item) => item.url)).toEqual(
          expect.arrayContaining([KEPT.url, 'https://z.example/']),
        )
        expect(liveUrls.has(normalizeUrl(KEPT.url))).toBe(false)
        expect(liveUrls.has(normalizeUrl('https://z.example/'))).toBe(false)
        expect(plan.counts.duplicate).toBe(0)
      },
    )
  })

  it('lists removed bookmarks with their folder path', async () => {
    seedFakeBookmarksTree(
      [KEPT],
      [
        {
          id: 'f',
          title: 'F',
          dateAdded: 1,
          syncing: false,
          children: [
            { ...KEPT, id: 'z', title: 'Z', url: 'https://z.example/' },
          ],
        },
      ],
    )
    const plan = buildImportPlan({
      files: [{ file: barFile(mark('A', 'https://a.example/')) }],
      liveTree: await browser.bookmarks.getTree(),
      mode: 'restore-replace',
      skipDuplicates: true,
    })
    expect(plan.removed).toEqual([
      {
        title: 'Kept',
        url: 'https://kept.example/',
        folderPath: ['Bookmarks bar'],
      },
      {
        title: 'Z',
        url: 'https://z.example/',
        folderPath: ['Other bookmarks', 'F'],
      },
    ])
  })

  it('tags later files earlier-in-batch and nests one node per file', async () => {
    const plan = buildImportPlan({
      files: [
        { name: 'one.json', file: barFile(mark('A', 'https://a.example/')) },
        {
          name: 'two.json',
          file: barFile(
            mark('A again', 'https://www.a.example'),
            mark('B', 'https://b.example/'),
          ),
        },
      ],
      liveTree: await browser.bookmarks.getTree(),
      mode: 'folder',
      skipDuplicates: true,
    })
    expect(plan.tree.map((node) => [node.id, node.title])).toEqual([
      ['f0', 'one.json'],
      ['f1', 'two.json'],
    ])
    expect(leaves(plan.tree).map((item) => item.state)).toEqual([
      { status: 'new' },
      { status: 'duplicate', reason: 'earlier-in-batch' },
      { status: 'new' },
    ])
    expect(plan.counts).toEqual({ new: 2, duplicate: 1, removed: 0 })
  })

  it('tags bookmarks already in the browser as existing', async () => {
    seedFakeBookmarksTree([KEPT])
    const plan = buildImportPlan({
      files: [{ file: barFile(mark('K', 'https://www.kept.example')) }],
      liveTree: await browser.bookmarks.getTree(),
      mode: 'restore-merge',
      skipDuplicates: true,
    })
    expect(leaves(plan.tree)[0]?.state).toEqual({
      status: 'duplicate',
      reason: 'existing',
    })
  })

  it('marks nothing duplicate in replace or with Skip duplicates off', async () => {
    seedFakeBookmarksTree([KEPT])
    const file = barFile(mark('K', KEPT.url), mark('K2', KEPT.url))
    const liveTree = await browser.bookmarks.getTree()
    for (const [mode, skipDuplicates] of [
      ['restore-replace', true],
      ['folder', false],
    ] as const) {
      const plan = buildImportPlan({
        files: [{ file }],
        liveTree,
        mode,
        skipDuplicates,
      })
      expect(plan.counts.duplicate).toBe(0)
      expect(plan.counts.new).toBe(2)
    }
  })

  it('builds a 10k-bookmark plan in under 500ms', async () => {
    const folders = Array.from({ length: 100 }, (_, folder) => ({
      title: `Folder ${folder}`,
      dateAdded: 1,
      children: Array.from({ length: 100 }, (_, item) =>
        mark(
          `B${folder}-${item}`,
          `https://site${folder}.example/page/${item}`,
        ),
      ),
    }))
    const file = barFile(...folders)
    const liveTree = await browser.bookmarks.getTree()
    const start = performance.now()
    const plan = buildImportPlan({
      files: [{ file }],
      liveTree,
      mode: 'folder',
      skipDuplicates: true,
    })
    expect(performance.now() - start).toBeLessThan(500)
    expect(plan.counts.new).toBe(10_000)
  })
})

describe('pruneFilesToChecked', () => {
  it('imports only the checked bookmarks with the right roots', async () => {
    const file = parseImportFile(plainJson, 'application/json', 'b.json')
    const plan = buildImportPlan({
      files: [{ file }],
      liveTree: await browser.bookmarks.getTree(),
      mode: 'restore-merge',
      skipDuplicates: false,
    })
    const [checked] = leaves(plan.tree)
    if (!checked) throw new Error('fixture has no bookmarks')

    const [pruned] = pruneFilesToChecked([file], new Set([checked.id]))
    if (!pruned) throw new Error('missing file')
    expect(countBookmarks(pruned.tree)).toBe(1)
    const prunedRoot = pruned.tree[0]
    const originalRoot = file.tree.find(
      (root) => root.title === prunedRoot?.title,
    )
    expect({ ...prunedRoot, children: undefined }).toEqual({
      ...originalRoot,
      children: undefined,
    })

    await importTree(pruned, 'restore-merge')
    expect(countBookmarks(getFakeBookmarksRoot().children ?? [])).toBe(1)
  })

  it('drops folders left empty and does not mutate its input', () => {
    const file = barFile(
      { title: 'Empty', dateAdded: 1, children: [] },
      {
        title: 'Sub',
        dateAdded: 1,
        children: [mark('A', 'https://a.example/')],
      },
      mark('B', 'https://b.example/'),
    )
    const snapshot = structuredClone(file)
    const [pruned] = pruneFilesToChecked([file], new Set(['f0/0/2']))
    expect(pruned?.tree[0]?.children?.map((node) => node.title)).toEqual(['B'])
    expect(file).toEqual(snapshot)
  })
})
