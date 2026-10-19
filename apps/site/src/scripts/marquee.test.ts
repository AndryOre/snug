import { describe, expect, it } from 'vitest'

import { MARQUEE_SPEED_PX_PER_SECOND, marqueeDurationSeconds } from './marquee'

describe('marqueeDurationSeconds', () => {
  it('moves the track at the fixed speed whatever its width', () => {
    for (const halfWidth of [800, 1280, 2820]) {
      expect(halfWidth / marqueeDurationSeconds(halfWidth)).toBeCloseTo(
        MARQUEE_SPEED_PX_PER_SECOND,
        5,
      )
    }
  })

  it('computes the loop time of a known width', () => {
    expect(marqueeDurationSeconds(2000)).toBe(50)
  })

  it.each([0, -1, NaN, Infinity])('rejects the width %s', (halfWidth) => {
    expect(() => marqueeDurationSeconds(halfWidth)).toThrow(RangeError)
  })
})
