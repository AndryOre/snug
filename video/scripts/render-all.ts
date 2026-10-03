import { bundle } from '@remotion/bundler'
import { renderMedia, selectComposition } from '@remotion/renderer'
import { existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { LOCALES, type Locale } from '../src/copy'
import { FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from '../src/timing'

const ROOT = path.resolve(import.meta.dirname, '..')
const OUT_DIR = path.join(ROOT, 'out')
const MUSIC_TRACK = path.join(ROOT, 'public', 'music', 'track.mp3')
const DURATION_TOLERANCE_SECONDS = 0.1
const EXPECTED_SECONDS = TOTAL_FRAMES / FPS

type ProbeStream = {
  codec_type: string
  width?: number
  height?: number
  r_frame_rate?: string
}

type ProbeResult = {
  streams: ProbeStream[]
  format: { duration: string }
}

const isLocale = (value: string): value is Locale =>
  (LOCALES as readonly string[]).includes(value)

const parseLocales = (argv: string[]): Locale[] => {
  const flagIndex = argv.findIndex(
    (arg) => arg === '--locales' || arg.startsWith('--locales='),
  )
  if (flagIndex === -1) return [...LOCALES]
  const flag = argv[flagIndex] ?? ''
  const raw = flag.includes('=') ? flag.split('=')[1] : argv[flagIndex + 1]
  const requested = (raw ?? '').split(',').filter(Boolean)
  const unknown = requested.filter((code) => !isLocale(code))
  if (requested.length === 0 || unknown.length > 0) {
    throw new Error(
      `Invalid --locales "${raw ?? ''}". Unknown: ${unknown.join(', ') || 'none given'}. Valid: ${LOCALES.join(', ')}`,
    )
  }
  return requested.filter(isLocale)
}

const parseFrameRate = (rate: string | undefined): number => {
  const [numerator, denominator] = (rate ?? '0/1').split('/').map(Number)
  return (numerator ?? 0) / (denominator || 1)
}

const probe = async (file: string): Promise<ProbeResult> => {
  const process = Bun.spawn(
    [
      'ffprobe',
      '-v',
      'error',
      '-print_format',
      'json',
      '-show_streams',
      '-show_format',
      file,
    ],
    { stdout: 'pipe', stderr: 'pipe' },
  )
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(process.stdout).text(),
    new Response(process.stderr).text(),
    process.exited,
  ])
  if (exitCode !== 0) throw new Error(`ffprobe failed on ${file}: ${stderr}`)
  return JSON.parse(stdout) as ProbeResult
}

const verify = async (file: string): Promise<string[]> => {
  const { streams, format } = await probe(file)
  const problems: string[] = []
  const video = streams.find((stream) => stream.codec_type === 'video')
  const duration = Number(format.duration)
  if (Math.abs(duration - EXPECTED_SECONDS) > DURATION_TOLERANCE_SECONDS) {
    problems.push(`duration ${duration}s, expected ${EXPECTED_SECONDS}s`)
  }
  if (!video) {
    problems.push('no video stream')
  } else {
    if (video.width !== WIDTH || video.height !== HEIGHT) {
      problems.push(`size ${video.width}x${video.height}`)
    }
    if (parseFrameRate(video.r_frame_rate) !== FPS) {
      problems.push(`frame rate ${video.r_frame_rate}`)
    }
  }
  const hasAudio = streams.some((stream) => stream.codec_type === 'audio')
  if (existsSync(MUSIC_TRACK) && !hasAudio) {
    problems.push('missing audio stream although public/music/track.mp3 exists')
  }
  return problems
}

const main = async () => {
  const locales = parseLocales(process.argv.slice(2))
  mkdirSync(OUT_DIR, { recursive: true })
  const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE ?? null

  console.log('Bundling…')
  const serveUrl = await bundle({
    entryPoint: path.join(ROOT, 'src', 'index.ts'),
  })

  const failures: string[] = []
  for (const locale of locales) {
    const outputLocation = path.join(OUT_DIR, `snug-promo-${locale}.mp4`)
    const inputProps = { locale }
    const composition = await selectComposition({
      serveUrl,
      id: 'Promo',
      inputProps,
      browserExecutable,
    })
    console.log(`Rendering ${locale}…`)
    await renderMedia({
      composition,
      serveUrl,
      codec: 'h264',
      outputLocation,
      inputProps,
      browserExecutable,
    })
    const problems = await verify(outputLocation)
    if (problems.length > 0) {
      failures.push(`${locale}: ${problems.join('; ')}`)
    } else {
      console.log(`${locale}: ok -> ${outputLocation}`)
    }
  }

  if (failures.length > 0) {
    throw new Error(`Verification failed:\n${failures.join('\n')}`)
  }
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
