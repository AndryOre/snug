import { copyFile, mkdir, readdir, readFile, rm, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

/**
 * Regenerates the derived raster assets of the Snug brand kit from the SVG
 * sources in `docs/brand/logo`: the extension icon (`apps/extension/assets/icon.png`), PNG
 * marks, the Chrome Web Store icon and tiles, the per-locale OG images and the README banner (a copy of the store marquee), and the YouTube channel art
 * (`docs/brand/youtube/`: banner, avatar, watermark). Run with `bun run brand:export`.
 *
 * The YouTube files are checked against their exact pixel dimensions and byte
 * budgets, and the banner's text and lockup are checked to sit inside YouTube's
 * 1546x423 safe area; the script throws on any miss.
 *
 * The OG images (`apps/site/public/og/og-<locale>.png`, 1200x630, under 300 KB)
 * are generated for every file in `apps/extension/locales`, using that locale's
 * `extensionDescription` as the tagline. Cyrillic and CJK glyphs come from fonts
 * installed on the host (Noto Sans, Liberation Sans, Noto Sans CJK, WenQuanYi);
 * Latin text uses the embedded Geist.
 *
 * Icons are drawn at 75% of a transparent canvas: the SVG's fixed size is forced
 * to fill its container, sized so the painted bookmark spans 96 of 128 px.
 *
 * Fonts are embedded from `docs/brand/brandbook/fonts` so output does not
 * depend on fonts installed on the host. CWS screenshots are not generated
 * here; they need the real running extension.
 */
const brandRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
)
const repoRoot = path.resolve(brandRoot, '../..')
const fontsRoot = path.join(brandRoot, 'brandbook/fonts')

const GROUND = '#17120A'
const ICON_ART_RATIO = 0.75
const MARK_ART_HEIGHT_RATIO = 70 / 84
const OG_MAX_BYTES = 300 * 1024
const OG_SIZE = { width: 1200, height: 630 }
const OG_TAGLINE_FONT_SIZE = 34
const NON_LATIN_FONT_FALLBACKS =
  "'Noto Sans','Liberation Sans','Noto Sans CJK JP','Noto Sans CJK KR','Noto Sans CJK SC','Source Han Sans','WenQuanYi Zen Hei'"
const MB = 1024 * 1024
const YOUTUBE_SAFE_AREA = { width: 1546, height: 423 }
const AVATAR_ART_DIAMETER_RATIO = 0.7
const BANNER_TAGLINE =
  'Export, import, and back up your bookmarks &mdash; all on your device.'

const markSvg = await readFile(path.join(brandRoot, 'logo/mark.svg'), 'utf8')
const lockupSvg = await readFile(
  path.join(brandRoot, 'logo/lockup-horizontal.svg'),
  'utf8',
)

const auroraGlow = `radial-gradient(60% 70% at 20% 30%, rgba(255,162,48,0.22), transparent 68%), radial-gradient(44% 54% at 100% 100%, rgba(255,162,48,0.14), transparent 70%), ${GROUND}`

const haloSvg = await readFile(
  path.join(brandRoot, 'logo/mark-halo.svg'),
  'utf8',
)

const fontRules = await Promise.all(
  [
    ['Geist', 'Geist-var.woff2', '400 700'],
    ['Space Grotesk', 'SpaceGrotesk-var.woff2', '300 700'],
  ].map(async ([family, fileName, weight]) => {
    const buffer = await readFile(path.join(fontsRoot, fileName))
    const data = buffer.toString('base64')
    return `@font-face{font-family:'${family}';font-weight:${weight};src:url(data:font/woff2;base64,${data}) format('woff2')}`
  }),
)
const fontFaces = fontRules.join('')

async function renderIcon(browser, size, outPath) {
  const page = await browser.newPage({
    viewport: { width: size, height: size },
  })
  const markSize = Math.round((size * ICON_ART_RATIO) / MARK_ART_HEIGHT_RATIO)
  await page.setContent(
    `<style>svg{display:block;width:100%;height:100%}</style>` +
      `<body style="margin:0;display:grid;place-items:center;width:${size}px;height:${size}px">` +
      `<div style="width:${markSize}px;height:${markSize}px">${markSvg}</div></body>`,
  )
  await mkdir(path.dirname(outPath), { recursive: true })
  await page.screenshot({ path: outPath, omitBackground: true })
  await page.close()
  console.log(path.relative(repoRoot, outPath))
}

async function renderBanner(
  browser,
  { width, height, outPath, lockupWidth, tagline, taglineFontSize, language },
) {
  const page = await browser.newPage({ viewport: { width, height } })
  const taglineHtml = tagline
    ? `<div style="font-family: Geist, ${NON_LATIN_FONT_FALLBACKS}, system-ui, sans-serif; font-size: ${taglineFontSize ?? Math.round(height * 0.032)}px; color: #DCC8A6; max-width: ${Math.round(width * 0.72)}px; text-align: center; line-height: 1.5; margin-top: ${Math.round(height * 0.04)}px">${tagline}</div>`
    : ''
  await page.setContent(`
    <html lang="${language ?? 'en'}"><style>${fontFaces}svg{display:block;width:100%;height:auto}</style>
    <body style="margin:0;width:${width}px;height:${height}px;background:${auroraGlow};display:flex;align-items:center;justify-content:center;flex-direction:column;box-sizing:border-box">
      <div style="width:${lockupWidth}px">${lockupSvg}</div>
      ${taglineHtml}
    </body></html>`)
  return finishPage(page, outPath)
}

async function finishPage(page, outPath) {
  await page.waitForFunction('document.fonts.status === "loaded"')
  await mkdir(path.dirname(outPath), { recursive: true })
  await page.screenshot({ path: outPath })
  await page.close()
  const { size } = await stat(outPath)
  console.log(
    `${path.relative(repoRoot, outPath)} ${(size / 1024).toFixed(0)} KB`,
  )
  return size
}

async function renderSmallTile(browser, outPath) {
  const page = await browser.newPage({ viewport: { width: 440, height: 280 } })
  await page.setContent(`
    <style>${fontFaces}svg{display:block;width:100%;height:auto}</style>
    <body style="margin:0;width:440px;height:280px;position:relative;overflow:hidden;background:radial-gradient(70% 80% at 50% 38%, rgba(255,162,48,0.38), transparent 72%), radial-gradient(50% 60% at 100% 100%, rgba(255,162,48,0.2), transparent 70%), ${GROUND}">
      <div style="position:absolute;inset:0;box-shadow:inset 0 0 0 1px rgba(255,162,48,0.25);pointer-events:none"></div>
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding-bottom:16px">
        <div style="width:260px">${lockupSvg}</div>
        <div style="font-family:Geist,system-ui,sans-serif;font-size:22px;color:#DCC8A6;text-align:center;line-height:1.3;margin-top:22px;max-width:400px">Export, import &amp; back up bookmarks</div>
      </div>
    </body>`)
  return finishPage(page, outPath)
}

const folderIcon = `<svg viewBox="0 0 24 24" width="40" height="40" style="flex:none"><path d="M2 6.5A2.5 2.5 0 0 1 4.5 4H9l2.5 3H19.5A2.5 2.5 0 0 1 22 9.5v8A2.5 2.5 0 0 1 19.5 20h-15A2.5 2.5 0 0 1 2 17.5Z" fill="#DCC8A6"/></svg>`

function treeRow(indent, barWidth, checked) {
  const box = checked
    ? `<div style="width:34px;height:34px;border-radius:8px;background:#FFA230;flex:none"></div>`
    : `<div style="width:34px;height:34px;border-radius:8px;border:3px solid #FFA230;box-sizing:border-box;flex:none"></div>`
  return `<div style="display:flex;align-items:center;gap:20px;margin-left:${indent}px">${box}${folderIcon}<div style="height:16px;border-radius:8px;background:rgba(220,200,166,0.55);width:${barWidth}px"></div></div>`
}

async function renderMarquee(browser, outPath) {
  const page = await browser.newPage({ viewport: { width: 1400, height: 560 } })
  const chips = ['HTML', 'JSON', 'CSV']
    .map(
      (label) =>
        `<div style="font-family:'Space Grotesk',Geist,sans-serif;font-weight:700;font-size:34px;letter-spacing:0.04em;color:#17120A;background:linear-gradient(135deg,#FFA230,#FFD37A);border-radius:999px;padding:14px 34px;text-align:center">${label}</div>`,
    )
    .join('')
  await page.setContent(`
    <style>${fontFaces}svg{display:block}</style>
    <body style="margin:0;width:1400px;height:560px;position:relative;overflow:hidden;background:radial-gradient(45% 80% at 72% 50%, rgba(255,162,48,0.26), transparent 70%), ${auroraGlow}">
      <div style="position:absolute;left:80px;top:0;width:520px;height:560px;display:flex;flex-direction:column;justify-content:center">
        <div style="width:380px"><div style="width:380px">${lockupSvg.replace(/width="267" height="84"/, 'width="380" height="120"')}</div></div>
        <div style="font-family:Geist,system-ui,sans-serif;font-size:30px;color:#DCC8A6;line-height:1.4;margin-top:36px">Export, import, and back up your bookmarks &mdash; all on your device.</div>
      </div>
      <div style="position:absolute;left:680px;top:0;width:660px;height:560px;display:flex;align-items:center;gap:36px">
        <div style="width:420px;box-sizing:border-box;padding:40px 36px;border-radius:16px;background:#231A10;border:1px solid rgba(255,162,48,0.25);box-shadow:0 24px 60px rgba(0,0,0,0.45);display:flex;flex-direction:column;gap:30px">
          ${treeRow(0, 200, true)}
          ${treeRow(44, 160, true)}
          ${treeRow(44, 120, false)}
          ${treeRow(0, 180, true)}
        </div>
        <div style="display:flex;flex-direction:column;gap:22px;width:170px">${chips}</div>
      </div>
    </body>`)
  return finishPage(page, outPath)
}

async function assertPngSpec(outPath, { width, height, maxBytes }) {
  const buffer = await readFile(outPath)
  const actualWidth = buffer.readUInt32BE(16)
  const actualHeight = buffer.readUInt32BE(20)
  const name = path.basename(outPath)
  if (actualWidth !== width || actualHeight !== height) {
    throw new Error(
      `${name} is ${actualWidth}x${actualHeight}, expected ${width}x${height}`,
    )
  }
  if (buffer.length > maxBytes) {
    throw new Error(`${name} is ${buffer.length} bytes, over ${maxBytes}`)
  }
}

function bannerMotif(side) {
  return `<div style="position:absolute;top:50%;${side}:150px;width:260px;height:260px;margin-top:-130px;opacity:0.12">${markSvg}</div>`
}

async function renderYoutubeBanner(browser, outPath) {
  const width = 2560
  const height = 1440
  const page = await browser.newPage({ viewport: { width, height } })
  await page.setContent(`
    <style>${fontFaces}svg{display:block;width:100%;height:100%}</style>
    <body style="margin:0;width:${width}px;height:${height}px;position:relative;overflow:hidden;background:radial-gradient(55% 60% at 50% 50%, rgba(255,162,48,0.24), transparent 70%), ${auroraGlow}">
      ${bannerMotif('left')}${bannerMotif('right')}
      <div id="content" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
        <div id="lockup" style="width:620px"><div style="width:620px;height:195px">${lockupSvg}</div></div>
        <div id="tagline" style="font-family:Geist,system-ui,sans-serif;font-size:40px;color:#DCC8A6;white-space:nowrap;line-height:1.4;margin-top:40px">${BANNER_TAGLINE}</div>
      </div>
    </body>`)
  await page.waitForFunction('document.fonts.status === "loaded"')
  const bounds = []
  for (const selector of ['#lockup', '#tagline']) {
    const box = await page.locator(selector).boundingBox()
    bounds.push({
      left: box.x,
      top: box.y,
      right: box.x + box.width,
      bottom: box.y + box.height,
    })
  }
  const safeLeft = (width - YOUTUBE_SAFE_AREA.width) / 2
  const safeTop = (height - YOUTUBE_SAFE_AREA.height) / 2
  for (const box of bounds) {
    if (
      box.left < safeLeft ||
      box.right > safeLeft + YOUTUBE_SAFE_AREA.width ||
      box.top < safeTop ||
      box.bottom > safeTop + YOUTUBE_SAFE_AREA.height
    ) {
      throw new Error(
        `YouTube banner content leaves the safe area: ${JSON.stringify(box)}`,
      )
    }
  }
  await mkdir(path.dirname(outPath), { recursive: true })
  await page.screenshot({ path: outPath })
  await page.close()
  await assertPngSpec(outPath, { width, height, maxBytes: 6 * MB })
  console.log(path.relative(repoRoot, outPath))
}

async function renderYoutubeAvatar(browser, outPath) {
  const size = 800
  const page = await browser.newPage({
    viewport: { width: size, height: size },
  })
  const markSize = Math.round(
    (size * AVATAR_ART_DIAMETER_RATIO) / MARK_ART_HEIGHT_RATIO,
  )
  await page.setContent(`
    <style>svg{display:block;width:100%;height:100%}</style>
    <body style="margin:0;width:${size}px;height:${size}px;display:grid;place-items:center;background:radial-gradient(50% 50% at 50% 50%, rgba(255,162,48,0.38), transparent 75%), ${GROUND}">
      <div style="width:${markSize}px;height:${markSize}px">${markSvg}</div>
    </body>`)
  await mkdir(path.dirname(outPath), { recursive: true })
  await page.screenshot({ path: outPath })
  await page.close()
  await assertPngSpec(outPath, { width: size, height: size, maxBytes: 2 * MB })
  console.log(path.relative(repoRoot, outPath))
}

async function renderYoutubeWatermark(browser, outPath) {
  const size = 300
  const page = await browser.newPage({
    viewport: { width: size, height: size },
  })
  const markSize = Math.round((size * 0.85) / MARK_ART_HEIGHT_RATIO)
  await page.setContent(`
    <style>svg{display:block;width:100%;height:100%}</style>
    <body style="margin:0;display:grid;place-items:center;width:${size}px;height:${size}px">
      <div style="width:${markSize}px;height:${markSize}px">${haloSvg}</div>
    </body>`)
  await mkdir(path.dirname(outPath), { recursive: true })
  await page.screenshot({ path: outPath, omitBackground: true })
  await page.close()
  await assertPngSpec(outPath, { width: size, height: size, maxBytes: 1 * MB })
  console.log(path.relative(repoRoot, outPath))
}

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

async function readOgTaglines() {
  const localesRoot = path.join(repoRoot, 'apps/extension/locales')
  const entries = await readdir(localesRoot)
  const fileNames = entries
    .filter((name) => name.endsWith('.json'))
    .toSorted((first, second) => first.localeCompare(second))
  return Promise.all(
    fileNames.map(async (fileName) => {
      const raw = await readFile(path.join(localesRoot, fileName), 'utf8')
      const messages = JSON.parse(raw)
      return {
        locale: path.basename(fileName, '.json'),
        tagline: messages.extensionDescription.message,
      }
    }),
  )
}

async function renderOgImages(browser) {
  const ogRoot = path.join(repoRoot, 'apps/site/public/og')
  await rm(ogRoot, { recursive: true, force: true })
  const taglines = await readOgTaglines()
  for (const { locale, tagline } of taglines) {
    const outPath = path.join(ogRoot, `og-${locale}.png`)
    await renderBanner(browser, {
      ...OG_SIZE,
      outPath,
      lockupWidth: 360,
      tagline: escapeHtml(tagline),
      taglineFontSize: OG_TAGLINE_FONT_SIZE,
      language: locale.replace('_', '-'),
    })
    await assertPngSpec(outPath, { ...OG_SIZE, maxBytes: OG_MAX_BYTES })
  }
}

const browser = await chromium.launch()

try {
  for (const size of [16, 32, 48, 128]) {
    await renderIcon(
      browser,
      size,
      path.join(brandRoot, 'logo/png', `mark-${size}.png`),
    )
  }
  await renderIcon(
    browser,
    512,
    path.join(repoRoot, 'apps/extension/assets/icon.png'),
  )

  const storeAssets = path.join(repoRoot, 'docs/store/assets')
  await renderIcon(browser, 128, path.join(storeAssets, 'store-icon-128.png'))
  await renderSmallTile(
    browser,
    path.join(storeAssets, 'small-tile-440x280.png'),
  )
  const marqueePath = path.join(storeAssets, 'marquee-1400x560.png')
  await renderMarquee(browser, marqueePath)
  const readmeBannerPath = path.join(repoRoot, 'docs/assets/readme-banner.png')
  await mkdir(path.dirname(readmeBannerPath), { recursive: true })
  await copyFile(marqueePath, readmeBannerPath)

  await renderOgImages(browser)

  const youtubeRoot = path.join(brandRoot, 'youtube')
  await renderYoutubeBanner(
    browser,
    path.join(youtubeRoot, 'banner-2560x1440.png'),
  )
  await renderYoutubeAvatar(browser, path.join(youtubeRoot, 'avatar-800.png'))
  await renderYoutubeWatermark(
    browser,
    path.join(youtubeRoot, 'watermark-300.png'),
  )
} finally {
  await browser.close()
}
