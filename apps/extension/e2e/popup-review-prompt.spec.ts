import type { Page } from '@playwright/test'

import en from '../locales/en.json' with { type: 'json' }
import { expect, test } from './fixtures'
import type { SeedBookmark } from './fixtures'

const seed: SeedBookmark[] = [
  {
    title: 'Review Prompt Bookmark',
    url: 'https://review-prompt.example.com/',
  },
]

const reviewsUrl =
  'https://chromewebstore.google.com/detail/gdhpeilfkeeajillmcncaelnppiakjhn/reviews'

const eligibleState = { eligibleAt: 1_700_000_000_000, dismissedAt: null }

const cardName = en.reviewPrompt_title.message

function reviewCard(page: Page) {
  return page.getByRole('region', { name: cardName })
}

async function exportFromPopup(page: Page) {
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export all' }).click()
  await downloadPromise
  await expect(page.getByText(/Exported \d+ bookmarks?/)).toBeVisible()
}

test('shows no Review prompt on a fresh install', async ({
  openExtensionPage,
  seedBookmarks,
}) => {
  await seedBookmarks(seed)
  const popup = await openExtensionPage('popup.html')

  await expect(popup.getByRole('button', { name: 'Export all' })).toBeVisible()
  await expect(reviewCard(popup)).toHaveCount(0)
})

test('shows the Review prompt in the same popup after a popup export', async ({
  openExtensionPage,
  seedBookmarks,
}) => {
  await seedBookmarks(seed)
  const popup = await openExtensionPage('popup.html')
  await expect(reviewCard(popup)).toHaveCount(0)

  await exportFromPopup(popup)

  await expect(reviewCard(popup)).toBeVisible()
  await expect(
    reviewCard(popup).getByText(en.reviewPrompt_description.message),
  ).toBeVisible()
})

test('"Not now" retires the Review prompt across a reopen', async ({
  openExtensionPage,
  seedBookmarks,
  seedStorage,
}) => {
  await seedBookmarks(seed)
  await seedStorage({ reviewPrompt: eligibleState })
  const popup = await openExtensionPage('popup.html')
  await expect(reviewCard(popup)).toBeVisible()

  await popup
    .getByRole('button', { name: en.reviewPrompt_notNow.message })
    .click()
  await expect(reviewCard(popup)).toHaveCount(0)
  await popup.close()

  const reopened = await openExtensionPage('popup.html')
  await expect(
    reopened.getByRole('button', { name: 'Export all' }),
  ).toBeVisible()
  await expect(reviewCard(reopened)).toHaveCount(0)
})

test('"Leave a review" opens the reviews page in a new tab and hides the card', async ({
  context,
  openExtensionPage,
  seedBookmarks,
  seedStorage,
}) => {
  await seedBookmarks(seed)
  await seedStorage({ reviewPrompt: eligibleState })
  const popup = await openExtensionPage('popup.html')
  const link = popup.getByRole('link', {
    name: en.reviewPrompt_leaveReview.message,
  })
  await expect(link).toHaveAttribute('rel', 'noopener noreferrer')

  const [newPage] = await Promise.all([
    context.waitForEvent('page'),
    link.click(),
  ])
  await expect.poll(() => newPage.url()).toContain(reviewsUrl)

  await expect(reviewCard(popup)).toHaveCount(0)
})

test('shows the Review prompt when eligibility is already recorded', async ({
  openExtensionPage,
  seedBookmarks,
  seedStorage,
}) => {
  await seedBookmarks(seed)
  await seedStorage({ reviewPrompt: eligibleState })
  const popup = await openExtensionPage('popup.html')

  await expect(reviewCard(popup)).toBeVisible()
  await expect(
    popup.getByRole('link', { name: en.reviewPrompt_leaveReview.message }),
  ).toBeVisible()
})

test('keeps the Review prompt hidden while the last auto-export run failed', async ({
  openExtensionPage,
  seedBookmarks,
  seedStorage,
}) => {
  await seedBookmarks(seed)
  await seedStorage({
    reviewPrompt: eligibleState,
    autoExportLastRun: {
      at: Date.now(),
      ok: false,
      error: 'boom',
      trigger: 'scheduled',
    },
  })
  const popup = await openExtensionPage('popup.html')

  await expect(popup.getByRole('link', { name: /failed/i })).toBeVisible()
  await expect(reviewCard(popup)).toHaveCount(0)
})

test('shows the Review prompt in the popup after an App Export page export', async ({
  openExtensionPage,
  seedBookmarks,
}) => {
  await seedBookmarks(seed)
  const page = await openExtensionPage('app.html#/export')
  await page
    .getByRole('button', { name: en.exportPage_expandAll.message })
    .click()
  const row = page.getByRole('treeitem', { name: 'Review Prompt Bookmark' })
  await row.focus()
  await page.keyboard.press('Space')

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export 1 bookmark' }).click()
  await downloadPromise

  const popup = await openExtensionPage('popup.html')
  await expect(reviewCard(popup)).toBeVisible()
})
