/// <reference types="chrome" />
import type { Page } from '@playwright/test'

import en from '../locales/en.json' with { type: 'json' }
import { expect, test } from './fixtures'

const PICKED_FOLDER_NAME = 'snug-e2e-folder'

const config = {
  enabled: true,
  interval: '1d',
  preferredTime: '09:30',
  dayOfWeek: 1,
  path: '',
  formats: ['json'],
  keepLast: 0,
}

/**
 * Lists the file names inside the stubbed picker's OPFS directory.
 * @param page An extension page (OPFS is per-origin, shared with the worker).
 * @returns The file names currently in the picked folder.
 */
function listPickedFolderFiles(page: Page): Promise<string[]> {
  /* eslint-disable unicorn/isolated-functions -- this callback runs in the page's own browser context, where navigator is a real global */
  return page.evaluate(async (folderName) => {
    const root = await navigator.storage.getDirectory()
    const directory = await root.getDirectoryHandle(folderName, {
      create: true,
    })
    const names = await Array.fromAsync(
      (directory as unknown as { keys(): AsyncIterable<string> }).keys(),
    )
    return names
  }, PICKED_FOLDER_NAME)
  /* eslint-enable unicorn/isolated-functions -- scoped to the callback above only */
}

test('choosing a Custom folder persists, Export now writes into it, Downloads clears it', async ({
  context,
  openExtensionPage,
  seedBookmarks,
  seedStorage,
}) => {
  await context.addInitScript((folderName) => {
    Object.defineProperty(globalThis, 'showDirectoryPicker', {
      configurable: true,
      writable: true,
      value: async () => {
        const root = await navigator.storage.getDirectory()
        return root.getDirectoryHandle(folderName, { create: true })
      },
    })
  }, PICKED_FOLDER_NAME)

  await seedStorage({
    autoExportConfig: config,
    autoExportNextRun: null,
    autoExportLastRun: null,
  })
  await seedBookmarks([{ title: 'Folder export', url: 'https://example.com/' }])

  const page = await openExtensionPage('app.html#/auto-export')

  await page
    .getByRole('button', { name: en.autoExportPage_destinationFolder.message })
    .click()
  await expect(
    page.getByText(en.autoExportPage_chooseFolderDescription.message),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: en.exportNow.message }),
  ).toBeDisabled()

  await page
    .getByRole('button', { name: en.autoExportPage_chooseFolder.message })
    .click()
  await expect(
    page.getByText(PICKED_FOLDER_NAME, { exact: true }),
  ).toBeVisible()
  await expect(page.getByText(`${PICKED_FOLDER_NAME}/`)).toBeVisible()
  await expect(
    page.getByText(en.autoExportPage_folderRestartHint.message),
  ).toBeVisible()

  await page.reload()
  await expect(
    page.getByText(PICKED_FOLDER_NAME, { exact: true }),
  ).toBeVisible()

  await page.getByRole('button', { name: en.exportNow.message }).click()
  await expect(page.getByText(en.exportNowSuccess.message)).toBeVisible({
    timeout: 60_000,
  })
  await expect
    .poll(async () => {
      const names = await listPickedFolderFiles(page)
      return names.some((name) => name.endsWith('.json'))
    })
    .toBe(true)

  await page
    .getByRole('button', {
      name: en.autoExportPage_destinationDownloads.message,
    })
    .click()
  await expect(
    page.getByText(en.autoExportPage_downloadsPrefix.message),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: en.autoExportPage_changeFolder.message }),
  ).toHaveCount(0)
})

test('the Save to group is hidden when showDirectoryPicker is undefined', async ({
  context,
  openExtensionPage,
  seedStorage,
}) => {
  await context.addInitScript(() => {
    Object.defineProperty(globalThis, 'showDirectoryPicker', {
      configurable: true,
      value: undefined,
    })
  })
  await seedStorage({
    autoExportConfig: { ...config, destination: 'folder', folderName: 'Gone' },
    autoExportNextRun: null,
    autoExportLastRun: null,
  })

  const page = await openExtensionPage('app.html#/auto-export')

  await expect(
    page.getByText(en.autoExportPage_downloadsPrefix.message),
  ).toBeVisible()
  await expect(
    page.getByText(en.autoExportPage_saveTo.message, { exact: true }),
  ).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: en.exportNow.message }),
  ).toBeEnabled()
})
