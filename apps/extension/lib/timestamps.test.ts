import { describe, expect, it } from 'vitest'

import { millisecondsToSeconds, secondsToMilliseconds } from './timestamps'

describe('millisecondsToSeconds', () => {
  it('converts exact milliseconds', () => {
    expect(millisecondsToSeconds(5000)).toBe(5)
  })

  it('rounds down fractional seconds', () => {
    expect(millisecondsToSeconds(5999)).toBe(5)
  })

  it('returns zero for zero', () => {
    expect(millisecondsToSeconds(0)).toBe(0)
  })
})

describe('secondsToMilliseconds', () => {
  it('converts seconds to milliseconds', () => {
    expect(secondsToMilliseconds(5)).toBe(5000)
  })

  it('returns zero for zero', () => {
    expect(secondsToMilliseconds(0)).toBe(0)
  })
})
