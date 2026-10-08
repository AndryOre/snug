import { fitText } from '@remotion/layout-utils'
import { useMemo } from 'react'
import { spring, useCurrentFrame, useVideoConfig } from 'remotion'

import type { Locale } from '../copy'
import { fontStackFor } from '../fonts'
import { theme } from '../theme'
import { SPRING } from './easing'
import { splitWords } from './split-words'

export type KineticTextProps = {
  text: string
  locale: Locale
  /**
   * Width the text must fit inside, in px.
   */
  maxWidth: number
  /**
   * Preferred size; shrinks to fit, never grows. Default 96.
   */
  fontSize?: number
  /**
   * Stagger unit. Default `word`; CJK locales segment by word natively.
   */
  unit?: 'word' | 'char'
  /**
   * Frame the entrance starts, relative to the enclosing Sequence.
   */
  delay?: number
  /**
   * Frames between units. Default 3.
   */
  stagger?: number
  align?: 'left' | 'center'
  weight?: number
  color?: string
  family?: 'display' | 'body'
}

const WRAP_THRESHOLD = 0.62
const WRAP_WIDTH_FACTOR = 1.7

const isCjk = (locale: Locale): boolean =>
  ['ja', 'ko', 'zh_CN'].includes(locale)

/**
 * Fits the text on one line, or on two when one line would shrink it below
 * 62% of the preferred size, so long de/fr/ru strings never overflow.
 */
const fitFontSize = (
  text: string,
  fontFamily: string,
  fontWeight: number,
  maxWidth: number,
  preferred: number,
): number => {
  const measure = (withinWidth: number): number =>
    fitText({
      text,
      withinWidth,
      fontFamily,
      fontWeight,
      validateFontIsLoaded: false,
    }).fontSize
  const oneLine = Math.min(preferred, measure(maxWidth))
  return oneLine >= preferred * WRAP_THRESHOLD
    ? Math.floor(oneLine)
    : Math.floor(Math.min(preferred, measure(maxWidth * WRAP_WIDTH_FACTOR)))
}

/**
 * Word- or character-staggered entrance (settle spring, rise and fade).
 */
export const KineticText = ({
  text,
  locale,
  maxWidth,
  fontSize = 96,
  unit = 'word',
  delay = 0,
  stagger = 3,
  align = 'center',
  weight = 700,
  color = theme.colors.text,
  family = 'display',
}: KineticTextProps) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const fontFamily = fontStackFor(locale)[family]
  const size = useMemo(
    () => fitFontSize(text, fontFamily, weight, maxWidth, fontSize),
    [text, fontFamily, weight, maxWidth, fontSize],
  )
  const units = useMemo(
    () => (unit === 'char' ? [...text] : splitWords(text, locale)),
    [text, unit, locale],
  )
  const gap = unit === 'word' && !isCjk(locale) ? '0.28em' : 0
  return (
    <div
      style={{
        width: maxWidth,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        columnGap: gap,
        fontFamily,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.15,
        color,
        textAlign: align,
      }}
    >
      {units.map((part, index) => {
        const progress = spring({
          frame: frame - delay - index * stagger,
          fps,
          config: SPRING.settle,
        })
        return (
          <span
            key={`${index}-${part}`}
            style={{
              display: 'inline-block',
              whiteSpace: 'pre',
              opacity: progress,
              transform: `translateY(${(1 - progress) * 0.4}em)`,
            }}
          >
            {part}
          </span>
        )
      })}
    </div>
  )
}
