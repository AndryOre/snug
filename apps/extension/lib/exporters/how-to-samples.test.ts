import { readFileSync } from 'node:fs'
import { beforeEach, describe, expect, it } from 'vitest'

import {
  resetFakeBookmarks,
  seedFakeBookmarksTree,
} from '@/lib/testing/fake-bookmarks'

import { exportToCSV } from './export-csv'
import { exportToJSON } from './export-json'

const SAMPLES_FOLDER = new URL(
  '../../../site/src/content/how-to-samples/',
  import.meta.url,
)

function readSample(name: string): string {
  return readFileSync(new URL(name, SAMPLES_FOLDER), 'utf8').trimEnd()
}

function seedSampleTree(shouldIncludeSlashFolder: boolean): void {
  seedFakeBookmarksTree(
    [
      {
        id: '10',
        parentId: '1',
        title: 'Dev, "Tools"',
        syncing: false,
        children: [
          {
            id: '11',
            parentId: '10',
            title: 'Comma, and "quotes"',
            url: 'https://example.com/a,b',
            syncing: false,
          },
        ],
      },
      ...(shouldIncludeSlashFolder
        ? [
            {
              id: '12',
              parentId: '1',
              title: 'Q3/Q4',
              syncing: false,
              children: [
                {
                  id: '13',
                  parentId: '12',
                  title: 'Roadmap',
                  url: 'https://example.com/roadmap',
                  syncing: false,
                },
              ],
            },
          ]
        : []),
    ],
    [
      {
        id: '20',
        parentId: '2',
        title: 'Loose',
        url: 'https://example.org',
        syncing: false,
      },
    ],
  )
}

beforeEach(() => {
  resetFakeBookmarks()
})

describe('How-to page samples', () => {
  it('shows the CSV the exporter produces for the fixture tree', async () => {
    seedSampleTree(true)
    const csv = await exportToCSV({
      selectedBookmarks: null,
      includeIconData: false,
      includeDateAdded: false,
      includeDateLastUsed: false,
      hideParentFolder: false,
    })

    expect(readSample('chrome-bookmarks.csv')).toBe(csv)
  })

  it('shows the JSON the exporter produces for the fixture tree', async () => {
    seedSampleTree(false)
    const json = await exportToJSON({
      selectedBookmarks: null,
      includeIconData: false,
      includeDateAdded: false,
      includeDateLastUsed: false,
      includeDateGroupModified: false,
      hideOtherBookmarks: false,
      hideParentFolder: false,
    })

    expect(readSample('chrome-bookmarks.json')).toBe(
      JSON.stringify(json, null, 2),
    )
  })
})
