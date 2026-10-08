import type { Page } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { expect, test } from './fixtures'

const FIXTURES_DIRECTORY = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  'fixtures',
)

async function uploadFixture(page: Page, fileName: string): Promise<void> {
  await page
    .locator('input[type="file"]')
    .setInputFiles(path.join(FIXTURES_DIRECTORY, fileName))
}

async function selectDefaultMode(page: Page, label: string): Promise<void> {
  await page.getByRole('combobox', { name: /^(?!Export format)/ }).click()
  await page.getByRole('option', { name: label }).click()
}

async function expectImportToast(page: Page): Promise<void> {
  await expect(page.getByText('Bookmarks imported')).toBeVisible()
}

test('quick import merges into the real bookmarks bar with the default mode (fixes #24)', async ({
  openExtensionPage,
  seedBookmarks,
  readBookmarkTree,
}) => {
  await seedBookmarks([
    {
      title: 'Existing other bookmark',
      url: 'https://existing-other.example/page',
    },
  ])

  const popup = await openExtensionPage('popup.html')

  await uploadFixture(popup, 'bookmarks.html')
  await expectImportToast(popup)

  const [root] = await readBookmarkTree()
  const bookmarksBar = root?.children?.find((n) => n.id === '1')
  const otherBookmarks = root?.children?.find((n) => n.id === '2')

  expect(bookmarksBar?.children?.map((n) => n.url)).toEqual([
    'https://html-bar-a.example/page',
    'https://html-bar-b.example/page',
  ])
  expect(otherBookmarks?.children?.map((n) => n.url)).toEqual(
    expect.arrayContaining([
      'https://existing-other.example/page',
      'https://html-other-a.example/page',
    ]),
  )
})

test('restore-replace in the popup opens the App Import page and imports nothing', async ({
  context,
  openExtensionPage,
  seedBookmarks,
  readBookmarkTree,
}) => {
  await seedBookmarks([
    {
      title: 'Existing other bookmark',
      url: 'https://existing-other.example/page',
    },
  ])

  const popup = await openExtensionPage('popup.html')
  await selectDefaultMode(popup, 'Restore — replace')
  await expect(
    popup.getByText(
      'Clears your Bookmarks Bar and Other Bookmarks first. A Safety snapshot lets you undo the import.',
    ),
  ).toBeVisible()

  const appPagePromise = context.waitForEvent('page')
  await uploadFixture(popup, 'bookmarks.html')
  const appPage = await appPagePromise

  await expect(appPage).toHaveURL(/app\.html#\/import$/)
  await expect(popup.getByText('Bookmarks imported')).not.toBeVisible()

  const [root] = await readBookmarkTree()
  const bookmarksBar = root?.children?.find((n) => n.id === '1')
  const otherBookmarks = root?.children?.find((n) => n.id === '2')

  expect(bookmarksBar?.children ?? []).toEqual([])
  expect(otherBookmarks?.children?.map((n) => n.url)).toEqual([
    'https://existing-other.example/page',
  ])
})

test('a CSV file imports into "Imported bookmarks" even when the stored default is a restore mode', async ({
  openExtensionPage,
  seedBookmarks,
  readBookmarkTree,
}) => {
  await seedBookmarks([
    {
      title: 'Existing other bookmark',
      url: 'https://existing-other.example/page',
    },
  ])

  const popup = await openExtensionPage('popup.html')
  await selectDefaultMode(popup, 'Restore — replace')

  await uploadFixture(popup, 'bookmarks.csv')
  await expectImportToast(popup)

  const [root] = await readBookmarkTree()
  const otherBookmarks = root?.children?.find((n) => n.id === '2')
  const importedFolder = otherBookmarks?.children?.find(
    (n) => n.title === 'Imported bookmarks',
  )

  expect(importedFolder).toBeTruthy()
  expect(
    importedFolder?.children?.some(
      (n) => n.url === 'https://csv-root-a.example/page',
    ),
  ).toBe(true)
  expect(
    otherBookmarks?.children?.some(
      (n) => n.url === 'https://existing-other.example/page',
    ),
  ).toBe(true)
})

test('an unsupported file shows an error toast instead of an alert', async ({
  openExtensionPage,
}) => {
  const popup = await openExtensionPage('popup.html')

  await popup.locator('input[type="file"]').setInputFiles({
    name: 'notes.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('not a bookmarks file'),
  })

  await expect(popup.getByText('Import failed')).toBeVisible()
  await expect(popup.getByText('Unsupported file format')).toBeVisible()
})

test('a JSON file whose root is a single object imports every bookmark its preview counts', async ({
  openExtensionPage,
  readBookmarkTree,
}) => {
  const popup = await openExtensionPage('popup.html')

  await uploadFixture(popup, 'bookmarks-single-root.json')
  await expectImportToast(popup)

  const [root] = await readBookmarkTree()
  const bookmarksBar = root?.children?.find((n) => n.id === '1')

  expect(bookmarksBar?.children?.map((n) => n.url)).toEqual([
    'https://single-root-a.example/page',
    'https://single-root-b.example/page',
  ])
})

test('a file with no bookmarks shows an error toast and imports nothing', async ({
  openExtensionPage,
}) => {
  const popup = await openExtensionPage('popup.html')

  await popup.locator('input[type="file"]').setInputFiles({
    name: 'empty.json',
    mimeType: 'application/json',
    buffer: Buffer.from('[]'),
  })

  await expect(popup.getByText('Import failed')).toBeVisible()
  await expect(popup.getByText('No bookmarks found in this file')).toBeVisible()
})

test('a file above the size threshold opens the App Import page and imports nothing', async ({
  context,
  openExtensionPage,
  readBookmarkTree,
}) => {
  const popup = await openExtensionPage('popup.html')
  const rows = Array.from(
    { length: 201 },
    (_, index) => `Big ${index},https://big-${index}.example/page,`,
  )

  const appPagePromise = context.waitForEvent('page')
  await popup.locator('input[type="file"]').setInputFiles({
    name: 'big.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(['title,url,folder', ...rows].join('\n')),
  })
  const appPage = await appPagePromise

  await expect(appPage).toHaveURL(/app\.html#\/import$/)
  await expect(popup.getByText('Bookmarks imported')).not.toBeVisible()

  const [root] = await readBookmarkTree()
  const otherBookmarks = root?.children?.find((n) => n.id === '2')
  expect(otherBookmarks?.children ?? []).toEqual([])
})

test('a file whose bookmarks all exist creates no folder and says nothing was imported', async ({
  openExtensionPage,
  seedBookmarks,
  readBookmarkTree,
}) => {
  await seedBookmarks([
    {
      title: 'Existing CSV root',
      url: 'https://csv-root-a.example/page',
    },
  ])

  const popup = await openExtensionPage('popup.html')
  await popup.locator('input[type="file"]').setInputFiles({
    name: 'dupes.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(
      'title,url,folder\nCSV Root A,https://csv-root-a.example/page,Docs',
    ),
  })

  await expect(popup.getByText('Nothing to import')).toBeVisible()
  await expect(popup.getByText('Bookmarks imported')).not.toBeVisible()

  const [root] = await readBookmarkTree()
  const otherBookmarks = root?.children?.find((n) => n.id === '2')
  expect(
    otherBookmarks?.children?.some((n) => n.title === 'Imported bookmarks'),
  ).toBe(false)
})

test('several files quick import in one run and an unreadable one is skipped and reported', async ({
  openExtensionPage,
  readBookmarkTree,
}) => {
  const popup = await openExtensionPage('popup.html')
  await popup.locator('input[type="file"]').setInputFiles([
    {
      name: 'bookmarks.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(
        'title,url\nFirst A,https://first-a.example/page\nFirst B,https://first-b.example/page',
      ),
    },
    {
      name: 'broken.json',
      mimeType: 'application/json',
      buffer: Buffer.from('{not json'),
    },
    {
      name: 'second.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from('title,url\nSecond A,https://second-a.example/page'),
    },
  ])

  await expect(
    popup.getByText("1 file couldn't be read and was skipped"),
  ).toBeVisible()
  await expect(popup.getByText(/broken\.json: \S/)).toBeVisible()

  const [root] = await readBookmarkTree()
  const otherBookmarks = root?.children?.find((n) => n.id === '2')
  const importedFolder = otherBookmarks?.children?.find(
    (n) => n.title === 'Imported bookmarks',
  )
  expect(importedFolder?.children?.map((n) => n.url)).toEqual([
    'https://first-a.example/page',
    'https://first-b.example/page',
    'https://second-a.example/page',
  ])
})

test('the skipped-files warning names at most three files and counts the rest', async ({
  openExtensionPage,
}) => {
  const popup = await openExtensionPage('popup.html')
  const brokenFiles = [1, 2, 3, 4, 5].map((index) => ({
    name: `broken-${index}.json`,
    mimeType: 'application/json',
    buffer: Buffer.from('{not json'),
  }))
  await popup.locator('input[type="file"]').setInputFiles([
    {
      name: 'good-a.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from('title,url\nGood A,https://good-a.example/page'),
    },
    {
      name: 'good-b.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from('title,url\nGood B,https://good-b.example/page'),
    },
    ...brokenFiles,
  ])

  await expect(
    popup.getByText("5 files couldn't be read and were skipped"),
  ).toBeVisible()
  await expect(popup.getByText(/broken-1\.json: \S/)).toBeVisible()
  await expect(popup.getByText(/broken-2\.json: \S/)).toBeVisible()
  await expect(popup.getByText(/broken-3\.json: \S/)).toBeVisible()
  await expect(popup.getByText(/broken-4\.json/)).toHaveCount(0)
  await expect(popup.getByText('and 2 more.')).toBeVisible()
})

interface DroppedFile {
  name: string
  mimeType: string
  content: string
}

async function dropOnImportSection(
  page: Page,
  files: DroppedFile[],
): Promise<void> {
  /* eslint-disable unicorn/isolated-functions -- this callback runs in the popup's own browser context, where DOM globals are real */
  await page.evaluate((droppedFiles) => {
    const section = document
      .querySelector('input[type="file"]')
      ?.closest('section')
    if (!section) throw new Error('import section missing')
    const transfer = new DataTransfer()
    for (const { name, mimeType, content } of droppedFiles) {
      transfer.items.add(new File([content], name, { type: mimeType }))
    }
    for (const type of ['dragover', 'drop']) {
      section.dispatchEvent(
        new DragEvent(type, {
          bubbles: true,
          cancelable: true,
          dataTransfer: transfer,
        }),
      )
    }
  }, files)
  /* eslint-enable unicorn/isolated-functions -- scoped to the callback above only */
}

test('dropping one file on the Import section quick imports it', async ({
  openExtensionPage,
  readBookmarkTree,
}) => {
  const popup = await openExtensionPage('popup.html')

  await dropOnImportSection(popup, [
    {
      name: 'dropped.csv',
      mimeType: 'text/csv',
      content: 'title,url\nDropped A,https://dropped-a.example/page',
    },
  ])
  await expectImportToast(popup)

  const [root] = await readBookmarkTree()
  const otherBookmarks = root?.children?.find((n) => n.id === '2')
  const importedFolder = otherBookmarks?.children?.find(
    (n) => n.title === 'Imported bookmarks',
  )
  expect(importedFolder?.children?.map((n) => n.url)).toEqual([
    'https://dropped-a.example/page',
  ])
})

test('dragging files over the Import section shows the drop label and dropping several imports one batch', async ({
  openExtensionPage,
  readBookmarkTree,
}) => {
  const popup = await openExtensionPage('popup.html')

  await popup.evaluate(() => {
    const transfer = new DataTransfer()
    transfer.items.add(new File(['x'], 'a.csv', { type: 'text/csv' }))
    document
      .querySelector('input[type="file"]')
      ?.closest('section')
      ?.dispatchEvent(
        new DragEvent('dragover', {
          bubbles: true,
          cancelable: true,
          dataTransfer: transfer,
        }),
      )
  })

  await expect(popup.getByText('Drop files to import')).toBeVisible()

  await dropOnImportSection(popup, [
    {
      name: 'one.csv',
      mimeType: 'text/csv',
      content: 'title,url\nOne,https://drop-one.example/page',
    },
    {
      name: 'two.csv',
      mimeType: 'text/csv',
      content: 'title,url\nTwo,https://drop-two.example/page',
    },
  ])
  await expectImportToast(popup)
  await expect(popup.getByText('Drop files to import')).not.toBeVisible()

  const [root] = await readBookmarkTree()
  const otherBookmarks = root?.children?.find((n) => n.id === '2')
  const importedFolder = otherBookmarks?.children?.find(
    (n) => n.title === 'Imported bookmarks',
  )
  expect(importedFolder?.children?.map((n) => n.url)).toEqual([
    'https://drop-one.example/page',
    'https://drop-two.example/page',
  ])
})

test('a drop while an import is running is ignored', async ({
  openExtensionPage,
  readBookmarkTree,
}) => {
  const popup = await openExtensionPage('popup.html')

  await popup.evaluate(async () => {
    const section = document
      .querySelector('input[type="file"]')
      ?.closest('section')
    if (!section) throw new Error('import section missing')
    const drop = (file: File) => {
      const transfer = new DataTransfer()
      transfer.items.add(file)
      section.dispatchEvent(
        new DragEvent('drop', {
          bubbles: true,
          cancelable: true,
          dataTransfer: transfer,
        }),
      )
    }
    const { promise: gate, resolve: release } = Promise.withResolvers<void>()
    const slow = new File(
      ['title,url\nSlow,https://slow.example/page'],
      'slow.csv',
      { type: 'text/csv' },
    )
    const originalText = slow.text.bind(slow)
    Object.defineProperty(slow, 'text', {
      value: async () => {
        await gate
        return originalText()
      },
    })
    drop(slow)
    await new Promise((resolve) => setTimeout(resolve, 100))
    drop(
      new File(['title,url\nLate,https://late.example/page'], 'late.csv', {
        type: 'text/csv',
      }),
    )
    Object.defineProperty(globalThis, 'releaseSlowDrop', { value: release })
  })

  await expect(
    popup.getByText('Import in progress. Dropped files are ignored.'),
  ).toBeVisible()

  await popup.evaluate(() => {
    ;(
      globalThis as unknown as { releaseSlowDrop: () => void }
    ).releaseSlowDrop()
  })

  await expectImportToast(popup)

  const [root] = await readBookmarkTree()
  const otherBookmarks = root?.children?.find((n) => n.id === '2')
  const importedFolder = otherBookmarks?.children?.find(
    (n) => n.title === 'Imported bookmarks',
  )
  expect(importedFolder?.children?.map((n) => n.url)).toEqual([
    'https://slow.example/page',
  ])
})
