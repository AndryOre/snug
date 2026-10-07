import { readFile } from 'node:fs/promises'

import en from '../locales/en.json' with { type: 'json' }
import { expect, test } from './fixtures'

test('theme choice applies live, persists across reloads and reaches the popup', async ({
  openExtensionPage,
}) => {
  const page = await openExtensionPage('app.html#/settings')
  const html = page.locator('html')

  await page.emulateMedia({ colorScheme: 'dark' })
  await expect(html).toHaveClass(/dark/)

  await page
    .getByRole('button', { name: en.settingsPage_themeLight.message })
    .click()
  await expect(html).toHaveClass(/light/)

  await page.reload()
  await expect(html).toHaveClass(/light/)
  await expect(
    page.getByRole('button', { name: en.settingsPage_themeLight.message }),
  ).toHaveAttribute('aria-pressed', 'true')

  const popup = await openExtensionPage('popup.html')
  await expect(popup.locator('html')).toHaveClass(/light/)

  await page
    .getByRole('button', { name: en.settingsPage_themeSystem.message })
    .click()
  await expect(html).toHaveClass(/dark/)
  await page.emulateMedia({ colorScheme: 'light' })
  await expect(html).toHaveClass(/light/)
})

test('saved dark theme is on the root at first paint, before React mounts', async ({
  openExtensionPage,
}) => {
  const page = await openExtensionPage('app.html#/settings')
  await page
    .getByRole('button', { name: en.settingsPage_themeDark.message })
    .click()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await page.emulateMedia({ colorScheme: 'light' })

  await page.addInitScript(() => {
    const root = document.documentElement
    new MutationObserver(() => {
      root.dataset.themeLog = `${root.dataset.themeLog ?? ''}|${root.className}`
    }).observe(root, { attributes: true, attributeFilter: ['class'] })
  })
  await page.reload()
  await expect(page.locator('html')).toHaveClass(/dark/)

  const classLog = await page.locator('html').getAttribute('data-theme-log')
  expect(classLog ?? '').not.toContain('light')
})

test('display switches persist across reloads', async ({
  openExtensionPage,
}) => {
  const page = await openExtensionPage('app.html#/settings')
  const iconSwitch = page.getByRole('switch', {
    name: en.showBookmarkIcon.message,
  })
  const expandSwitch = page.getByRole('switch', {
    name: en.autoExpandFolders.message,
  })

  await expect(iconSwitch).toBeChecked()
  await expect(expandSwitch).not.toBeChecked()

  await iconSwitch.click()
  await expandSwitch.click()
  await page.reload()

  await expect(iconSwitch).not.toBeChecked()
  await expect(expandSwitch).toBeChecked()
})

test('default import mode persists and is shown in the popup', async ({
  openExtensionPage,
}) => {
  const page = await openExtensionPage('app.html#/settings')

  await page.getByRole('combobox', { name: /^(?!Export format)/ }).click()
  await page.getByRole('option', { name: en.importModeFolder.message }).click()
  await page.reload()

  await expect(
    page.getByRole('combobox', { name: /^(?!Export format)/ }),
  ).toContainText(en.importModeFolder.message)

  const popup = await openExtensionPage('popup.html')
  await expect(
    popup.getByRole('combobox', { name: /^(?!Export format)/ }),
  ).toContainText(en.importModeFolder.message)
})

function snapshotRoots(url: string) {
  return [
    { id: '1', title: 'Bookmarks bar', dateAdded: 0, children: [] },
    {
      id: '2',
      title: 'Other bookmarks',
      dateAdded: 0,
      children: [{ title: 'Snapshot', url, dateAdded: 0 }],
    },
  ]
}

test('Safety snapshots card shows an empty state when none exist', async ({
  openExtensionPage,
}) => {
  const page = await openExtensionPage('app.html#/settings')

  await expect(
    page.getByText(en.safetySnapshot_emptyTitle.message),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: en.safetySnapshot_take.message }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: en.safetySnapshot_restore.message }),
  ).toHaveCount(0)
})

test('Safety snapshots list newest first with a Latest badge, Download saves the chosen one and Restore keeps the others', async ({
  openExtensionPage,
  seedBookmarks,
  seedStorage,
  readBookmarkTree,
  serviceWorker,
}) => {
  await seedBookmarks([
    { title: 'Current', url: 'https://current.example/page' },
  ])
  await seedStorage({
    safetySnapshot: [
      { takenAt: Date.now(), roots: snapshotRoots('https://newest.example/') },
      {
        takenAt: Date.now() - 86_400_000,
        roots: snapshotRoots('https://older.example/page'),
      },
    ],
    safetySnapshot$: { v: 2 },
  })
  const page = await openExtensionPage('app.html#/settings')
  const rows = page.getByTestId('safety-snapshot-row')

  await expect(rows).toHaveCount(2)
  await expect(rows.nth(0)).toContainText(en.safetySnapshot_latest.message)
  await expect(rows.nth(1)).not.toContainText(en.safetySnapshot_latest.message)

  const downloadPromise = page.waitForEvent('download')
  await rows
    .nth(1)
    .getByRole('button', { name: en.safetySnapshot_download.message })
    .click()
  const download = await downloadPromise
  await expect
    .poll(async () => {
      const items = await serviceWorker.evaluate(() =>
        chrome.downloads.search({ orderBy: ['-startTime'], limit: 5 }),
      )
      return items.some((item) =>
        /snug-safety-snapshot-.+\.json$/.test(item.filename),
      )
    })
    .toBe(true)
  const content = await readFile((await download.path()) as string, 'utf8')
  expect(content).toContain('https://older.example/page')
  expect(content).not.toContain('https://newest.example/')

  await rows
    .nth(1)
    .getByRole('button', { name: en.safetySnapshot_restore.message })
    .click()
  await expect(
    page.getByRole('alertdialog', {
      name: en.safetySnapshot_restoreTitle.message,
    }),
  ).toBeVisible()
  await page
    .getByRole('button', { name: en.safetySnapshot_restoreConfirm.message })
    .click()
  await expect(page.getByText(en.safetySnapshot_restored.message)).toBeVisible()

  const [root] = await readBookmarkTree()
  const otherBookmarks = root?.children?.find((n) => n.id === '2')
  expect(otherBookmarks?.children?.map((n) => n.url)).toEqual([
    'https://older.example/page',
  ])
  await expect(rows).toHaveCount(3)
  await expect(rows.nth(0)).toContainText(en.safetySnapshot_latest.message)
})

test('Take a snapshot now saves the file and adds a row', async ({
  openExtensionPage,
  seedBookmarks,
}) => {
  await seedBookmarks([
    { title: 'Current', url: 'https://current.example/page' },
  ])
  const page = await openExtensionPage('app.html#/settings')

  const downloadPromise = page.waitForEvent('download')
  await page
    .getByRole('button', { name: en.safetySnapshot_take.message })
    .click()
  await downloadPromise

  await expect(page.getByTestId('safety-snapshot-row')).toHaveCount(1)
  await expect(
    page.getByText(en.safetySnapshot_emptyTitle.message),
  ).toHaveCount(0)
})
