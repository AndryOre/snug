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
import { runImport } from './run-import'
import {
  getFakeBookmarksRoot,
  resetFakeBookmarks,
  seedFakeBookmarksTree,
} from './testing/fake-bookmarks'
import type { ImportMode } from './types'

vi.mock('./offscreen-download', () => ({
  downloadViaOffscreenDocument: vi.fn(async () => 1),
}))

interface Shape {
  title: string
  url?: string
  children?: Shape[]
}

interface TreeNode {
  title: string
  url?: string
  children?: TreeNode[]
}

function shapeOf(node: TreeNode): Shape {
  return {
    title: node.title,
    ...(node.url && { url: node.url }),
    ...(node.children && {
      children: node.children.map((child) => shapeOf(child)),
    }),
  }
}

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

const MODES: ImportMode[] = ['folder', 'restore-merge', 'restore-replace']

beforeEach(() => {
  fakeBrowser.reset()
  resetFakeBookmarks({ withMobileRoot: true })
})

describe('import pipeline equivalence', () => {
  describe.each(FIXTURES)('%s', (name, text, mimeType, fileName) => {
    it.each(MODES)('creates the same tree in %s mode', async (mode) => {
      seedFakeBookmarksTree([
        {
          id: 'x',
          title: 'Kept',
          url: 'https://kept.example/',
          syncing: false,
        },
      ])

      const result = await runImport(text, mimeType, mode, fileName)

      expect({
        result: {
          skippedInvalidUrl: result.skippedInvalidUrl,
          skippedDuplicates: result.skippedDuplicates,
        },
        tree: getFakeBookmarksRoot().children?.map((node) => shapeOf(node)),
      }).toMatchSnapshot(`${name} ${mode}`)
    })
  })
})
