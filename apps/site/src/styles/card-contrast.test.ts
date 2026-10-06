import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const themeCss = readFileSync(
  new URL('../../../../packages/ui/src/styles/theme.css', import.meta.url),
  'utf8',
)

type Rgb = [number, number, number]

function tokenValue(block: string, name: string): string {
  const match = new RegExp(String.raw`--${name}:\s*([^;]+);`).exec(block)
  if (!match) throw new Error(`Missing --${name}`)
  return (match[1] ?? '').trim()
}

function themeBlock(selector: string): string {
  const start = themeCss.indexOf(`${selector} {`)
  return themeCss.slice(start, themeCss.indexOf('\n}', start))
}

function oklchToLinearRgb(lightness: number, chroma: number, hue: number): Rgb {
  const hueRadians = (hue * Math.PI) / 180
  const a = chroma * Math.cos(hueRadians)
  const b = chroma * Math.sin(hueRadians)
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3
  const clamp = (value: number) => Math.min(1, Math.max(0, value))
  return [
    clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ]
}

function parseOklch(value: string): { rgb: Rgb; alpha: number } {
  const match =
    /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+)%)?\s*\)/.exec(
      value,
    )
  if (!match) throw new Error(`Unsupported colour: ${value}`)
  return {
    rgb: oklchToLinearRgb(Number(match[1]), Number(match[2]), Number(match[3])),
    alpha: match[4] === undefined ? 1 : Number(match[4]) / 100,
  }
}

function luminance([red, green, blue]: Rgb): number {
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

function contrast(first: Rgb, second: Rgb): number {
  const firstLuminance = luminance(first)
  const secondLuminance = luminance(second)
  const light = Math.max(firstLuminance, secondLuminance)
  const dark = Math.min(firstLuminance, secondLuminance)
  return (light + 0.05) / (dark + 0.05)
}

function over(top: { rgb: Rgb; alpha: number }, bottom: Rgb): Rgb {
  return top.rgb.map(
    (channel, index) =>
      channel * top.alpha + (bottom[index] ?? 0) * (1 - top.alpha),
  ) as Rgb
}

describe.each([
  ['light', ':root'],
  ['dark', '.dark'],
])('%s theme card separation', (_name, selector) => {
  const block = themeBlock(selector)
  const background = parseOklch(tokenValue(block, 'background')).rgb
  const card = parseOklch(tokenValue(block, 'card')).rgb
  const hairline = over(parseOklch(tokenValue(block, 'card-border')), card)

  it('separates the card from the background by at least 1.15:1', () => {
    expect(contrast(card, background)).toBeGreaterThanOrEqual(1.15)
  })

  it('draws the card hairline at least 1.5:1 against the card', () => {
    expect(contrast(hairline, card)).toBeGreaterThanOrEqual(1.5)
  })
})
