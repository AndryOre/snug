import { readFileSync } from 'node:fs'
import { beforeEach, describe, expect, it } from 'vitest'

import {
  resetFakeBookmarks,
  seedFakeBookmarksTree,
} from '@/lib/testing/fake-bookmarks'

import { exportToCSV } from './export-csv'
import { exportToHTML } from './export-html'
import { exportToJSON } from './export-json'
import { exportToMarkdown } from './export-markdown'
import { exportToOPML } from './export-opml'
import { exportToXBEL } from './export-xbel'

const SAMPLES_FOLDER = new URL(
  '../../../site/src/content/playground-samples/',
  import.meta.url,
)

function readSample(name: string): string {
  return readFileSync(new URL(name, SAMPLES_FOLDER), 'utf8')
}

const treeOptions = {
  selectedBookmarks: null,
  includeDateAdded: false,
  includeDateLastUsed: false,
  includeDateGroupModified: false,
  hideOtherBookmarks: false,
  hideParentFolder: false,
}

beforeEach(() => {
  resetFakeBookmarks()
  seedFakeBookmarksTree([
    {
      id: '10',
      parentId: '1',
      title: 'Reading list',
      syncing: false,
      children: [
        {
          id: '11',
          parentId: '10',
          title: 'Astro docs',
          url: 'https://docs.astro.build',
          syncing: false,
        },
        {
          id: '12',
          parentId: '10',
          title: 'MDN Web Docs',
          url: 'https://developer.mozilla.org',
          syncing: false,
        },
      ],
    },
    {
      id: '13',
      parentId: '1',
      title: 'Snug',
      url: 'https://snug.andryore.dev',
      syncing: false,
    },
  ])
})

describe('Landing playground samples', () => {
  it('shows the HTML the exporter produces', async () => {
    const html = await exportToHTML({ ...treeOptions, includeIconData: false })
    expect(readSample('bookmarks.html')).toBe(html)
  })

  it('shows the JSON the exporter produces', async () => {
    const json = await exportToJSON({ ...treeOptions, includeIconData: false })
    expect(readSample('bookmarks.json')).toBe(JSON.stringify(json, null, 2))
  })

  it('shows the CSV the exporter produces', async () => {
    const csv = await exportToCSV({ ...treeOptions, includeIconData: false })
    expect(readSample('bookmarks.csv')).toBe(csv)
  })

  it('shows the Markdown the exporter produces', async () => {
    expect(readSample('bookmarks.md')).toBe(await exportToMarkdown(treeOptions))
  })

  it('shows the OPML the exporter produces', async () => {
    expect(readSample('bookmarks.opml')).toBe(await exportToOPML(treeOptions))
  })

  it('shows the XBEL the exporter produces', async () => {
    expect(readSample('bookmarks.xbel')).toBe(await exportToXBEL(treeOptions))
  })
})
