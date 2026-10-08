import type { Locale } from '../copy'

const DASH = /^\p{Pd}+$/u
const TRAILING_PUNCTUATION = /^[\p{Pe}\p{Pf}\p{Po}]+$/u
const SPACE_JOINED_PUNCTUATION = /^(?:[\p{Pe}\p{Pf}]|[:;!?])+$/u

/**
 * Splits text into the display words `KineticText` staggers in.
 *
 * Punctuation with no space before it attaches to the previous word. After a
 * space, closing punctuation and `: ; ! ?` still join the previous word but
 * keep their space (`"Snug :"`), so they never start a line; any other
 * punctuation or symbol (such as `&`) becomes its own word. A dash with no
 * space before it also joins both neighbours.
 */
export const splitWords = (text: string, locale: Locale): string[] => {
  const segmenter = new Intl.Segmenter(locale.replace('_', '-'), {
    granularity: 'word',
  })
  const words: string[] = []
  let joinNext = false
  let previousWasSpace = true
  for (const { segment } of segmenter.segment(text)) {
    if (segment.trim() === '') {
      previousWasSpace = true
      joinNext = false
      continue
    }
    const last = words.at(-1)
    const isDash = DASH.test(segment)
    const attachedDash = isDash && !previousWasSpace
    if (last === undefined) {
      words.push(segment)
    } else if (joinNext) {
      words[words.length - 1] = last + segment
    } else if (previousWasSpace) {
      if (SPACE_JOINED_PUNCTUATION.test(segment)) {
        words[words.length - 1] = `${last} ${segment}`
      } else {
        words.push(segment)
      }
    } else if (attachedDash || TRAILING_PUNCTUATION.test(segment)) {
      words[words.length - 1] = last + segment
    } else {
      words.push(segment)
    }
    joinNext = attachedDash
    previousWasSpace = false
  }
  return words
}
