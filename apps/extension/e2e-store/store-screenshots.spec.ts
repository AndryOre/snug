import { chromium } from '@playwright/test'
import type { Page } from '@playwright/test'
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { expect, test } from '../e2e/fixtures'
import type { SeedBookmark } from '../e2e/fixtures'
import { STORE_CAPTIONS } from './captions'
import { composeLocalSlide, composeUiSlide } from './compose-slide'
import type { SlideTheme } from './compose-slide'

const EXTENSION_ROOT = path.resolve(import.meta.dirname, '..')
const THEME: SlideTheme =
  process.env.STORE_SCREENSHOT_THEME === 'light' ? 'light' : 'dark'
const IS_LANDING = process.env.STORE_SCREENSHOT_VARIANT === 'landing'
if (THEME === 'light' && !IS_LANDING)
  throw new Error('The light theme is only generated for the landing variant')
const SCREENSHOTS_ROOT = path.resolve(
  EXTENSION_ROOT,
  IS_LANDING
    ? '../site/src/assets/screenshots'
    : '../../docs/store/assets/screenshots',
)
const VIDEO_SCREENSHOTS_ROOT = path.resolve(
  EXTENSION_ROOT,
  '../video/public/screenshots',
)
const DEFAULT_LOCALE = 'en'
const SLIDE_FILES = [
  '01-export.png',
  '02-import.png',
  '03-auto-export.png',
  '04-popup.png',
  '05-local.png',
]
const VIDEO_SLIDE_FILES = SLIDE_FILES.slice(0, 4)
const RAW_DIRECTORY = path.resolve(EXTENSION_ROOT, 'test-results/store/raw')
const DEVICE_SCALE_FACTOR = 2
const STORE_APP_CAPTURE = { width: 1280, height: 716 }
const LANDING_APP_CAPTURE = { width: 700, height: 525 }
const APP_CAPTURE = IS_LANDING ? LANDING_APP_CAPTURE : STORE_APP_CAPTURE
const CANVAS = { width: 1280, height: 800 }
const CARD_WIDTH = 1040
const CARD_TOP = 220
const POPUP_CARD_TOP = 240
const POPUP_HEIGHT = 520

const SEED_BOOKMARKS: SeedBookmark[] = [
  {
    title: 'Development',
    children: [
      { title: 'GitHub', url: 'https://github.com/' },
      { title: 'MDN Web Docs', url: 'https://developer.mozilla.org/' },
      { title: 'Stack Overflow', url: 'https://stackoverflow.com/' },
      {
        title: 'Frameworks',
        children: [
          { title: 'React', url: 'https://react.dev/' },
          { title: 'Tailwind CSS', url: 'https://tailwindcss.com/' },
        ],
      },
    ],
  },
  {
    title: 'Reading',
    children: [
      { title: 'Wikipedia', url: 'https://www.wikipedia.org/' },
      { title: 'Hacker News', url: 'https://news.ycombinator.com/' },
    ],
  },
  {
    title: 'Travel',
    children: [
      { title: 'OpenStreetMap', url: 'https://www.openstreetmap.org/' },
      { title: 'Wikivoyage', url: 'https://www.wikivoyage.org/' },
    ],
  },
]

const importFileHtml = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
  <DT><H3 PERSONAL_TOOLBAR_FOLDER="true">Bookmarks bar</H3>
  <DL><p>
    <DT><A HREF="https://github.com/">GitHub</A>
    <DT><A HREF="https://developer.mozilla.org/">MDN Web Docs</A>
    <DT><A HREF="https://vite.dev/">Vite</A>
    <DT><A HREF="https://caniuse.com/">Can I use</A>
  </DL><p>
  <DT><H3>Other bookmarks</H3>
  <DL><p>
    <DT><A HREF="https://news.ycombinator.com/">Hacker News</A>
    <DT><A HREF="https://lobste.rs/">Lobsters</A>
  </DL><p>
</DL><p>
`

async function captureRaw(
  page: Page,
  selector: string,
  fileName: string,
): Promise<Buffer> {
  await mkdir(RAW_DIRECTORY, { recursive: true })
  return page.locator(selector).screenshot({
    animations: 'disabled',
    omitBackground: true,
    path: path.join(RAW_DIRECTORY, fileName),
    scale: 'device',
  })
}

async function emitSlide(
  composer: Page,
  rawShot: Buffer,
  outputPath: string,
  slide: Omit<Parameters<typeof composeUiSlide>[1], 'screenshot' | 'theme'>,
): Promise<void> {
  if (IS_LANDING) {
    await writeFile(outputPath, rawShot)
    return
  }
  await composeUiSlide(
    composer,
    { ...slide, screenshot: rawShot, theme: THEME },
    outputPath,
  )
}

test.use({
  colorScheme: THEME,
  deviceScaleFactor: DEVICE_SCALE_FACTOR,
  viewport: APP_CAPTURE,
})

async function readMessages(
  locale: string,
): Promise<Record<string, { message: string }>> {
  const raw = await readFile(
    path.resolve(EXTENSION_ROOT, 'locales', `${locale}.json`),
    'utf8',
  )
  return JSON.parse(raw) as Record<string, { message: string }>
}

test('composes the five store screenshots', async ({
  openExtensionPage,
  seedBookmarks,
  seedStorage,
}, testInfo) => {
  const locale = testInfo.project.name
  const captions = STORE_CAPTIONS[locale]
  if (!captions) throw new Error(`No store captions for locale ${locale}`)
  const messages = await readMessages(locale)
  const message = (key: string): string => {
    const entry = messages[key]
    if (!entry) throw new Error(`Missing ${key} in locales/${locale}.json`)
    return entry.message
  }
  const localeDirectory =
    IS_LANDING && THEME === 'light'
      ? path.join(SCREENSHOTS_ROOT, locale, 'light')
      : path.join(SCREENSHOTS_ROOT, locale)
  await mkdir(localeDirectory, { recursive: true })
  if (!IS_LANDING && locale === DEFAULT_LOCALE)
    await mkdir(SCREENSHOTS_ROOT, { recursive: true })
  const composerBrowser = await chromium.launch({ channel: 'chromium' })
  const composer = await composerBrowser.newPage({
    viewport: CANVAS,
    deviceScaleFactor: 1,
  })
  const outputPath = (fileName: string): string =>
    path.join(localeDirectory, fileName)

  await seedStorage({ theme: THEME })
  await seedBookmarks(SEED_BOOKMARKS)

  const exportPage = await openExtensionPage('app.html#/export')
  await expect(
    exportPage.getByRole('heading', {
      level: 1,
      name: message('shell_navExport'),
    }),
  ).toBeVisible()
  await exportPage
    .getByRole('button', { name: message('exportPage_expandAll') })
    .click()
  await exportPage
    .getByRole('treeitem', { name: 'Development', exact: true })
    .focus()
  await exportPage.keyboard.press('Space')
  await expect(exportPage.locator('html.dark')).toHaveCount(
    THEME === 'dark' ? 1 : 0,
  )
  if (IS_LANDING)
    await exportPage.addStyleTag({
      content: 'p.truncate.tabular-nums { visibility: hidden; }',
    })
  const exportShot = await captureRaw(exportPage, 'body', '01-export.png')
  await emitSlide(composer, exportShot, outputPath('01-export.png'), {
    ...captions.export,
    cardWidth: CARD_WIDTH,
    cardTop: CARD_TOP,
  })

  const importPage = await openExtensionPage('app.html#/import')
  await expect(
    importPage.getByRole('heading', {
      level: 1,
      name: message('shell_navImport'),
    }),
  ).toBeVisible()
  await importPage.getByLabel(message('import_fileInputLabel')).setInputFiles({
    name: 'bookmarks.html',
    mimeType: 'text/html',
    buffer: Buffer.from(importFileHtml),
  })
  await expect(importPage.getByRole('radio')).toHaveCount(3)
  await importPage.getByRole('radio').nth(1).click()
  await importPage.addStyleTag({
    content: '*, *::before, *::after { transition: none !important; }',
  })
  await importPage
    .getByRole('searchbox', { name: message('searchBookmarks') })
    .evaluate((searchbox) => {
      const header = document.querySelector('header')
      const headerHeight = header ? header.getBoundingClientRect().height : 0
      searchbox.scrollIntoView({ block: 'start' })
      let scroller: HTMLElement | null = searchbox.parentElement
      while (scroller && scroller.scrollHeight <= scroller.clientHeight)
        scroller = scroller.parentElement
      scroller?.scrollBy(0, -(headerHeight + 16))
    })
  await expect(
    importPage.getByRole('treeitem', { checked: true }),
  ).not.toHaveCount(0)
  const importShot = await captureRaw(importPage, 'body', '02-import.png')
  await emitSlide(composer, importShot, outputPath('02-import.png'), {
    ...captions.import,
    cardWidth: CARD_WIDTH,
    cardTop: CARD_TOP,
  })

  const hourInMilliseconds = 60 * 60 * 1000
  await seedStorage({
    autoExportConfig: {
      enabled: true,
      interval: '1d',
      preferredTime: '09:30',
      dayOfWeek: 1,
      path: 'bookmarks-backup/',
      formats: ['html', 'json', 'markdown'],
      keepLast: 10,
      destination: 'folder',
      folderName: 'Bookmarks backups',
    },
    autoExportConfig$: { v: 4 },
    autoExportNextRun: Date.now() + 8 * hourInMilliseconds,
    autoExportLastRun: {
      at: Date.now() - 16 * hourInMilliseconds,
      ok: true,
      trigger: 'scheduled',
    },
  })
  const seedPage = await openExtensionPage('app.html#/auto-export')
  await seedPage.evaluate(async () => {
    const root = await navigator.storage.getDirectory()
    const handle = await root.getDirectoryHandle('Bookmarks backups', {
      create: true,
    })
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('snug-custom-folder', 1)
      request.onupgradeneeded = () => {
        request.result.createObjectStore('handles')
      }
      request.onsuccess = () => resolve(request.result)
      request.addEventListener('error', () => reject(request.error))
    })
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction('handles', 'readwrite')
      transaction.objectStore('handles').put(handle, 'custom-folder')
      transaction.oncomplete = () => resolve()
      transaction.addEventListener('error', () => reject(transaction.error))
    })
    database.close()
  })
  await seedPage.close()
  const autoExportPage = await openExtensionPage('app.html#/auto-export')
  await expect(
    autoExportPage.getByRole('heading', {
      level: 1,
      name: message('shell_navAutoExport'),
    }),
  ).toBeVisible()
  await expect(
    autoExportPage.getByText(message('autoExportPage_nextRun')),
  ).toBeVisible()
  await expect(autoExportPage.getByRole('switch').first()).toBeChecked()
  await expect(
    autoExportPage.getByText('Bookmarks backups', { exact: true }),
  ).toBeVisible()
  await expect(
    autoExportPage.getByText(message('autoExportPage_folderAccessTitle')),
  ).toHaveCount(0)
  const autoExportShot = await captureRaw(
    autoExportPage,
    'body',
    '03-auto-export.png',
  )
  await emitSlide(composer, autoExportShot, outputPath('03-auto-export.png'), {
    ...captions.autoExport,
    cardWidth: CARD_WIDTH,
    cardTop: CARD_TOP,
  })

  const popup = await openExtensionPage('popup.html')
  await expect(popup.getByTestId('popup-frame')).toBeVisible()
  const dragData = await popup.evaluateHandle(() => {
    const transfer = new DataTransfer()
    transfer.items.add(
      new File(['<!DOCTYPE NETSCAPE-Bookmark-file-1>'], 'bookmarks.html', {
        type: 'text/html',
      }),
    )
    return transfer
  })
  await popup
    .locator('section:has(input[type="file"])')
    .dispatchEvent('dragover', { dataTransfer: dragData })
  await expect(popup.getByTestId('popup-import-drop-overlay')).toBeVisible()
  if (IS_LANDING) {
    await popup.addStyleTag({
      content: `
        html, body { margin: 0; width: ${LANDING_APP_CAPTURE.width}px; height: ${LANDING_APP_CAPTURE.height}px; background: var(--background) !important; }
        body { display: grid; place-items: center; }
        [data-testid="popup-frame"] { background: var(--popover); border-radius: 16px; border: 1px solid var(--border); }
      `,
    })
    const landingPopupShot = await captureRaw(popup, 'body', '04-popup.png')
    await writeFile(outputPath('04-popup.png'), landingPopupShot)
  } else {
    await popup.addStyleTag({
      content: `
        html, body { background: transparent !important; }
        [data-testid="popup-frame"] { background: var(--popover); border-radius: 16px; }
      `,
    })
    const popupShot = await captureRaw(
      popup,
      '[data-testid="popup-frame"]',
      '04-popup.png',
    )
    const popupBox = await popup.getByTestId('popup-frame').boundingBox()
    if (!popupBox) throw new Error('The popup frame has no bounding box')
    await composeUiSlide(
      composer,
      {
        ...captions.popup,
        screenshot: popupShot,
        cardWidth: Math.round(
          (popupBox.width * POPUP_HEIGHT) / popupBox.height,
        ),
        cardTop: POPUP_CARD_TOP,
        cardHeight: POPUP_HEIGHT,
        theme: THEME,
      },
      outputPath('04-popup.png'),
    )
  }

  if (!IS_LANDING)
    await composeLocalSlide(
      composer,
      { headline: captions.local.headline },
      [
        { icon: 'account', text: captions.local.claims[0] },
        { icon: 'upload', text: captions.local.claims[1] },
        { icon: 'tracking', text: captions.local.claims[2] },
        { icon: 'source', text: captions.local.claims[3] },
      ],
      outputPath('05-local.png'),
    )
  await composerBrowser.close()
  if (!IS_LANDING) {
    const videoDirectory = path.join(VIDEO_SCREENSHOTS_ROOT, locale)
    await mkdir(videoDirectory, { recursive: true })
    for (const fileName of VIDEO_SLIDE_FILES)
      await copyFile(
        path.join(localeDirectory, fileName),
        path.join(videoDirectory, fileName),
      )
  }
  if (!IS_LANDING && locale === DEFAULT_LOCALE) {
    for (const fileName of SLIDE_FILES)
      await copyFile(
        path.join(localeDirectory, fileName),
        path.join(SCREENSHOTS_ROOT, fileName),
      )
  }
})
