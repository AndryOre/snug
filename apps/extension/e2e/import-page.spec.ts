import type { Page } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import en from '../locales/en.json' with { type: 'json' }
import { expect, test } from './fixtures'

const FIXTURES_DIRECTORY = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  'fixtures',
)

async function openImportPage(
  openExtensionPage: (pageName: string) => Promise<Page>,
): Promise<Page> {
  return openExtensionPage('app.html#/import')
}

async function chooseFile(page: Page, fileName: string): Promise<void> {
  await page
    .getByLabel(en.import_fileInputLabel.message)
    .setInputFiles(path.join(FIXTURES_DIRECTORY, fileName))
}

async function selectMode(page: Page, label: string): Promise<void> {
  await page.getByRole('radio', { name: new RegExp(`^${label}`) }).click()
}

async function submitImport(page: Page, count: number): Promise<void> {
  await page
    .getByRole('button', {
      name: `Import ${count.toLocaleString('en-US')} bookmarks`,
    })
    .click()
}

async function expectSuccess(page: Page): Promise<void> {
  await expect(
    page.getByText(en.bookmarksImportedSuccessfully.message),
  ).toBeVisible()
}

test.describe('Import page', () => {
  test('shows the empty drop zone first', async ({ openExtensionPage }) => {
    const page = await openImportPage(openExtensionPage)

    await expect(page.getByText(en.dropFileHere.message)).toBeVisible()
    await expect(page.getByRole('button', { name: /^Import \d+/ })).toHaveCount(
      0,
    )
  })

  test('HTML preview lists per-root counts and enables restore modes', async ({
    openExtensionPage,
  }) => {
    const page = await openImportPage(openExtensionPage)
    await chooseFile(page, 'bookmarks.html')

    await expect(page.getByText('bookmarks.html')).toBeVisible()
    await expect(
      page.getByText('Bookmarks bar 2 · Other bookmarks 1'),
    ).toBeVisible()
    await expect(
      page.getByText('3 new · 0 duplicates will be skipped'),
    ).toBeVisible()
    await expect(
      page.getByRole('radio', { name: /^Restore — merge/ }),
    ).toBeEnabled()
    await expect(
      page.getByRole('radio', { name: /^Restore — replace/ }),
    ).toBeEnabled()
    await expect(
      page.getByRole('button', { name: 'Import 3 bookmarks' }),
    ).toBeVisible()
  })

  test('HTML folder mode imports into an "Imported bookmarks" folder', async ({
    openExtensionPage,
    seedBookmarks,
    readBookmarkTree,
  }) => {
    await seedBookmarks([
      { title: 'Existing', url: 'https://existing-other.example/page' },
    ])
    const page = await openImportPage(openExtensionPage)
    await chooseFile(page, 'bookmarks.html')
    await selectMode(page, 'Create folder')
    await submitImport(page, 3)
    await expectSuccess(page)

    const [root] = await readBookmarkTree()
    const otherBookmarks = root?.children?.find((n) => n.id === '2')
    const importedFolder = otherBookmarks?.children?.find(
      (n) => n.title === 'Imported bookmarks',
    )
    const importedBar = importedFolder?.children?.find(
      (n) => n.title === 'Bookmarks bar',
    )

    expect(importedBar?.children?.map((n) => n.url)).toEqual([
      'https://html-bar-a.example/page',
      'https://html-bar-b.example/page',
    ])
    expect(
      otherBookmarks?.children?.some(
        (n) => n.url === 'https://existing-other.example/page',
      ),
    ).toBe(true)
  })

  test('HTML restore-merge writes into the existing roots', async ({
    openExtensionPage,
    seedBookmarks,
    readBookmarkTree,
  }) => {
    await seedBookmarks([
      { title: 'Existing', url: 'https://existing-other.example/page' },
    ])
    const page = await openImportPage(openExtensionPage)
    await chooseFile(page, 'bookmarks.html')
    await selectMode(page, 'Restore — merge')
    await submitImport(page, 3)
    await expectSuccess(page)

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

  test('JSON restore-replace asks for confirmation and clears existing roots', async ({
    openExtensionPage,
    seedBookmarks,
    readBookmarkTree,
  }) => {
    await seedBookmarks([
      { title: 'Existing', url: 'https://existing-other.example/page' },
    ])
    const page = await openImportPage(openExtensionPage)
    await chooseFile(page, 'bookmarks.json')
    await selectMode(page, 'Restore — replace')
    await submitImport(page, 3)

    const dialog = page.getByRole('alertdialog', {
      name: en.import_replaceTitle.message,
    })
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText(/snug-safety-snapshot-.+\.json/)
    await expect(
      dialog.getByRole('link', {
        name: en.replaceSnapshotSettingsLink.message,
      }),
    ).toHaveAttribute('href', /#\/settings$/)
    await page
      .getByRole('button', { name: en.import_replaceConfirm.message })
      .click()
    await expectSuccess(page)

    const [root] = await readBookmarkTree()
    const bookmarksBar = root?.children?.find((n) => n.id === '1')
    const otherBookmarks = root?.children?.find((n) => n.id === '2')

    expect(bookmarksBar?.children?.map((n) => n.url)).toEqual([
      'https://json-bar-a.example/page',
    ])
    expect(otherBookmarks?.children?.map((n) => n.url)).toEqual([
      'https://json-other-a.example/page',
      'https://json-other-b.example/page',
    ])
  })

  test('canceling a long Restore-replace rolls back to the previous bookmarks', async ({
    openExtensionPage,
    seedBookmarks,
    readBookmarkTree,
  }) => {
    await seedBookmarks([
      { title: 'Existing', url: 'https://existing-other.example/page' },
    ])
    const page = await openImportPage(openExtensionPage)
    const largeBackup = JSON.stringify([
      {
        id: '2',
        title: 'Other bookmarks',
        dateAdded: 0,
        children: Array.from({ length: 4000 }, (_, index) => ({
          title: `Large ${index}`,
          url: `https://large.example/${index}`,
          dateAdded: 0,
        })),
      },
    ])
    await page.getByLabel(en.import_fileInputLabel.message).setInputFiles({
      name: 'large.json',
      mimeType: 'application/json',
      buffer: Buffer.from(largeBackup),
    })
    await selectMode(page, 'Restore — replace')
    await submitImport(page, 4000)
    await page
      .getByRole('button', { name: en.import_replaceConfirm.message })
      .click()

    const progressBar = page.getByRole('progressbar', {
      name: en.progress_importTitle.message,
    })
    await expect(progressBar).toBeVisible()
    await page
      .getByRole('button', { name: en.progress_cancelImport.message })
      .click()

    await expect(
      page.getByText(en.progress_importCanceledTitle.message),
    ).toBeVisible()

    const [root] = await readBookmarkTree()
    const otherBookmarks = root?.children?.find((n) => n.id === '2')
    expect(otherBookmarks?.children?.map((n) => n.url)).toEqual([
      'https://existing-other.example/page',
    ])
  })

  test('replace preview lists the bookmarks that will be deleted, with no "cannot be undone" copy', async ({
    openExtensionPage,
    seedBookmarks,
  }) => {
    await seedBookmarks([
      { title: 'Existing', url: 'https://existing-other.example/page' },
    ])
    const page = await openImportPage(openExtensionPage)
    await chooseFile(page, 'bookmarks.json')
    await selectMode(page, 'Restore — replace')

    await expect(
      page.getByText(en.import_replaceNoteTitle.message),
    ).toBeVisible()
    await expect(
      page.getByText(
        'Replace removes these and adds 3 bookmarks. Snug saves a Safety snapshot first.',
      ),
    ).toBeVisible()
    await expect(
      page.getByRole('tree', { name: en.import_treeLabel.message }),
    ).toBeVisible()
    await expect(page.getByText(en.import_duplicateBadge.message)).toHaveCount(
      0,
    )

    const deletionList = page.getByRole('list', {
      name: en.import_deleteListLabel.message,
    })
    await expect(deletionList).toHaveCount(0)
    await page.getByRole('button', { name: /^Will be deleted \(1\)/ }).click()
    await expect(deletionList).toBeVisible()
    await expect(
      deletionList.getByText('Existing', { exact: true }),
    ).toBeVisible()
    await expect(
      deletionList.getByText('https://existing-other.example/page'),
    ).toBeVisible()
    await expect(deletionList.getByText('Other bookmarks')).toBeVisible()

    await submitImport(page, 3)
    await expect(page.getByText(/cannot be undone/i)).toHaveCount(0)
  })

  test('replace into empty roots says nothing will be deleted', async ({
    openExtensionPage,
  }) => {
    const page = await openImportPage(openExtensionPage)
    await chooseFile(page, 'bookmarks.json')
    await selectMode(page, 'Restore — replace')

    await expect(page.getByText('Will be deleted (0)')).toBeVisible()
    await expect(page.getByText(en.import_deleteNone.message)).toBeVisible()
    await expect(
      page.getByRole('button', { name: /^Will be deleted/ }),
    ).toHaveCount(0)
  })

  test('Undo import restores the pre-import bookmarks', async ({
    openExtensionPage,
    seedBookmarks,
    readBookmarkTree,
  }) => {
    await seedBookmarks([
      { title: 'Existing', url: 'https://existing-other.example/page' },
    ])
    const page = await openImportPage(openExtensionPage)
    await chooseFile(page, 'bookmarks.json')
    await selectMode(page, 'Restore — replace')
    await submitImport(page, 3)
    await page
      .getByRole('button', { name: en.import_replaceConfirm.message })
      .click()
    await expectSuccess(page)
    await expect(page.getByRole('alert').first()).toBeFocused()

    await page.getByRole('button', { name: en.import_undo.message }).click()
    await expect(page.getByText(en.import_undoneTitle.message)).toBeVisible()
    await expect(page.getByRole('alert').first()).toBeFocused()

    const [root] = await readBookmarkTree()
    const bookmarksBar = root?.children?.find((n) => n.id === '1')
    const otherBookmarks = root?.children?.find((n) => n.id === '2')
    expect(bookmarksBar?.children ?? []).toEqual([])
    expect(otherBookmarks?.children?.map((n) => n.url)).toEqual([
      'https://existing-other.example/page',
    ])
  })

  test.describe('Skip duplicates', () => {
    const SWITCH_NAME = en.import_skipDuplicates.message

    test('on by default: the count before importing equals the bookmarks created', async ({
      openExtensionPage,
      seedBookmarks,
      readBookmarkTree,
    }) => {
      await seedBookmarks([
        {
          title: 'Reading',
          children: [
            // eslint-disable-next-line unicorn/prefer-https -- exercises http/https normalization
            { title: 'Already', url: 'http://www.html-bar-a.example/page/' },
          ],
        },
      ])
      const page = await openImportPage(openExtensionPage)
      await chooseFile(page, 'bookmarks.html')
      await selectMode(page, 'Create folder')

      await expect(
        page.getByRole('switch', { name: SWITCH_NAME }),
      ).toBeChecked()
      await expect(
        page.getByText(
          '1 bookmark in this file already exists or repeats and will be skipped',
        ),
      ).toBeVisible()
      await expect(
        page.getByText('2 new · 1 duplicate will be skipped'),
      ).toBeVisible()
      await expect(
        page
          .getByRole('tree', { name: en.import_treeLabel.message })
          .getByText(en.import_duplicateBadge.message),
      ).toHaveCount(1)
      await submitImport(page, 2)
      await expectSuccess(page)
      await expect(page.getByText('1 skipped as a duplicate')).toBeVisible()

      const [root] = await readBookmarkTree()
      const urls = JSON.stringify(root)
      expect(urls.match(/html-bar-a\.example/g)).toHaveLength(1)
      expect(urls).toContain('html-bar-b.example')
      expect(urls).toContain('html-other-a.example')
    })

    test('off: duplicates are created and counted', async ({
      openExtensionPage,
      seedBookmarks,
    }) => {
      await seedBookmarks([
        { title: 'Already', url: 'https://html-bar-a.example/page' },
      ])
      const page = await openImportPage(openExtensionPage)
      await chooseFile(page, 'bookmarks.html')
      await selectMode(page, 'Create folder')
      await expect(
        page.getByText(en.import_duplicateBadge.message),
      ).toHaveCount(1)
      await page.getByRole('switch', { name: SWITCH_NAME }).click()

      await expect(page.getByText('3 bookmarks will be imported')).toBeVisible()
      await expect(
        page.getByText(en.import_duplicateBadge.message),
      ).toHaveCount(0)
      await submitImport(page, 3)
      await expectSuccess(page)
      await expect(page.getByText(/skipped as/)).toHaveCount(0)
    })

    test('every bookmark already exists: nothing new to import until Skip duplicates is turned off', async ({
      openExtensionPage,
      seedBookmarks,
    }) => {
      await seedBookmarks([
        { title: 'A', url: 'https://html-bar-a.example/page' },
        { title: 'B', url: 'https://html-bar-b.example/page' },
        { title: 'C', url: 'https://html-other-a.example/page' },
      ])
      const page = await openImportPage(openExtensionPage)
      await chooseFile(page, 'bookmarks.html')

      await expect(
        page.getByText(en.import_allDuplicatesTitle.message),
      ).toBeVisible()
      await expect(
        page.getByRole('button', { name: en.import_nothingNew.message }),
      ).toBeDisabled()

      await page
        .getByRole('button', { name: en.import_allDuplicatesAction.message })
        .click()
      await expect(
        page.getByRole('tree', { name: en.import_treeLabel.message }),
      ).toBeVisible()
      await expect(
        page.getByRole('button', { name: 'Import 3 bookmarks' }),
      ).toBeEnabled()
    })

    test('is not rendered in Restore - replace', async ({
      openExtensionPage,
    }) => {
      const page = await openImportPage(openExtensionPage)
      await chooseFile(page, 'bookmarks.html')
      await selectMode(page, 'Restore — replace')

      await expect(page.getByRole('switch', { name: SWITCH_NAME })).toHaveCount(
        0,
      )
    })
  })

  test('reports how many bookmarks were skipped for an unsupported address', async ({
    openExtensionPage,
  }) => {
    const page = await openImportPage(openExtensionPage)
    await chooseFile(page, 'bookmarks-skipped.csv')
    await page.getByRole('button', { name: /^Import \d+ bookmark/ }).click()

    await expectSuccess(page)
    await expect(
      page.getByText('1 skipped because its address is not supported'),
    ).toBeVisible()
  })

  test('cancelling the replace confirmation writes nothing', async ({
    openExtensionPage,
    seedBookmarks,
    readBookmarkTree,
  }) => {
    await seedBookmarks([
      { title: 'Existing', url: 'https://existing-other.example/page' },
    ])
    const page = await openImportPage(openExtensionPage)
    await chooseFile(page, 'bookmarks.json')
    await selectMode(page, 'Restore — replace')
    await submitImport(page, 3)
    await page.getByRole('button', { name: en.cancel.message }).click()

    await expect(page.getByRole('alertdialog')).toHaveCount(0)
    await expect(
      page.getByText(en.bookmarksImportedSuccessfully.message),
    ).toHaveCount(0)

    const [root] = await readBookmarkTree()
    const otherBookmarks = root?.children?.find((n) => n.id === '2')
    expect(otherBookmarks?.children?.map((n) => n.url)).toEqual([
      'https://existing-other.example/page',
    ])
  })

  test('CSV shows one row, disables restore modes with the reason, and imports in folder mode', async ({
    openExtensionPage,
    readBookmarkTree,
  }) => {
    const page = await openImportPage(openExtensionPage)
    await chooseFile(page, 'bookmarks.csv')

    await expect(page.getByText('Imported bookmarks 3')).toBeVisible()
    await expect(
      page.getByRole('radio', { name: /^Restore — merge/ }),
    ).toBeDisabled()
    await expect(
      page.getByRole('radio', { name: /^Restore — replace/ }),
    ).toBeDisabled()
    await expect(
      page.getByText(en.import_restoreUnavailable.message).first(),
    ).toBeVisible()

    await submitImport(page, 3)
    await expectSuccess(page)

    const [root] = await readBookmarkTree()
    const otherBookmarks = root?.children?.find((n) => n.id === '2')
    const importedFolder = otherBookmarks?.children?.find(
      (n) => n.title === 'Imported bookmarks',
    )
    const docsFolder = importedFolder?.children?.find((n) => n.title === 'Docs')

    expect(docsFolder?.children?.map((n) => n.url)).toEqual([
      'https://csv-docs-a.example/page',
      'https://csv-docs-b.example/page',
    ])
  })

  test('success offers to import another file', async ({
    openExtensionPage,
  }) => {
    const page = await openImportPage(openExtensionPage)
    await chooseFile(page, 'bookmarks.csv')
    await submitImport(page, 3)
    await expectSuccess(page)
    await expect(
      page.getByRole('button', { name: en.import_openManager.message }),
    ).toBeVisible()

    await page.getByRole('button', { name: en.import_another.message }).click()

    await expect(page.getByText(en.dropFileHere.message)).toBeVisible()
  })

  test('a CSV reported with an Excel MIME type still imports', async ({
    openExtensionPage,
  }) => {
    const page = await openImportPage(openExtensionPage)
    await page.getByLabel(en.import_fileInputLabel.message).setInputFiles({
      name: 'bookmarks.csv',
      mimeType: 'application/vnd.ms-excel',
      buffer: await readFile(path.join(FIXTURES_DIRECTORY, 'bookmarks.csv')),
    })
    await submitImport(page, 3)
    await expectSuccess(page)
  })

  test('a Chrome profile Bookmarks file previews per root and restore-merges into the roots', async ({
    openExtensionPage,
    readBookmarkTree,
  }) => {
    const page = await openImportPage(openExtensionPage)
    await chooseFile(page, 'chrome-profile-bookmarks.json')

    await expect(
      page.getByRole('radio', { name: /^Restore — merge/ }),
    ).toBeEnabled()
    await expect(page.getByText(/Other bookmarks \d/)).toBeVisible()
    await selectMode(page, 'Restore — merge')
    await submitImport(page, 4)
    await expectSuccess(page)

    const [root] = await readBookmarkTree()
    const bookmarksBar = root?.children?.find((n) => n.id === '1')
    const otherBookmarks = root?.children?.find((n) => n.id === '2')
    expect(bookmarksBar?.children?.map((n) => n.title)).toEqual([
      'Chrome Bar A',
      'Chrome Folder',
    ])
    expect(JSON.stringify(otherBookmarks)).toContain(
      'https://chrome-other-a.example/page',
    )
  })

  test('an XBEL file previews per root and restore-merges into the roots', async ({
    openExtensionPage,
    readBookmarkTree,
  }) => {
    const page = await openImportPage(openExtensionPage)
    await chooseFile(page, 'bookmarks.xbel')

    await expect(
      page.getByRole('radio', { name: /^Restore — merge/ }),
    ).toBeEnabled()
    await selectMode(page, 'Restore — merge')
    await submitImport(page, 3)
    await expectSuccess(page)

    const [root] = await readBookmarkTree()
    const bookmarksBar = root?.children?.find((n) => n.id === '1')
    const otherBookmarks = root?.children?.find((n) => n.id === '2')
    expect(bookmarksBar?.children?.map((n) => n.title)).toEqual([
      'XBEL Bar A',
      'XBEL Folder',
    ])
    expect(otherBookmarks?.children?.map((n) => n.url)).toContain(
      'https://xbel-other-a.example/page',
    )
  })

  test('an unsupported file shows an inline error and no import button', async ({
    openExtensionPage,
  }) => {
    const page = await openImportPage(openExtensionPage)
    await page.getByLabel(en.import_fileInputLabel.message).setInputFiles({
      name: 'notes.html',
      mimeType: 'text/plain',
      buffer: Buffer.from('this is not a bookmarks file'),
    })

    await expect(
      page.getByText(en.import_unreadableTitle.message),
    ).toBeVisible()
    await expect(page.getByText(en.unsupportedFileFormat.message)).toBeVisible()
    await expect(page.getByRole('button', { name: /^Import \d+/ })).toHaveCount(
      0,
    )
  })
  test('previews a 10,000 bookmark upload quickly and keeps the tree virtualized and scrollable', async ({
    openExtensionPage,
  }) => {
    const folderCount = 100
    const perFolder = 100
    const bar = Array.from({ length: folderCount }, (_, folderIndex) => ({
      title: `Folder ${folderIndex}`,
      children: Array.from({ length: perFolder }, (_, index) => ({
        title: `Bookmark ${folderIndex}-${index}`,
        url: `https://bulk.example/${folderIndex}/${index}`,
      })),
    }))
    const content = JSON.stringify([
      { id: '1', title: 'Bookmarks bar', children: bar },
      { id: '2', title: 'Other bookmarks', children: [] },
    ])
    const page = await openImportPage(openExtensionPage)
    await page.getByLabel(en.import_fileInputLabel.message).setInputFiles({
      name: 'bulk.json',
      mimeType: 'application/json',
      buffer: Buffer.from(content),
    })

    const tree = page.getByRole('tree', { name: en.import_treeLabel.message })
    await expect(tree).toBeVisible({ timeout: 15_000 })
    await expect(
      page.getByText('10,000 new · 0 duplicates will be skipped'),
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Import 10,000 bookmarks' }),
    ).toBeVisible()
    expect(await tree.getByRole('treeitem').count()).toBeLessThan(150)

    const frameDelayMs = await tree.evaluate(async (element) => {
      const startedAt = performance.now()
      element.scrollTo({ top: element.scrollHeight / 2 })
      await new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      })
      return performance.now() - startedAt
    })
    expect(frameDelayMs).toBeLessThan(2000)
    expect(await tree.getByRole('treeitem').count()).toBeLessThan(150)
  })
})
