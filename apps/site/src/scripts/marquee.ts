/**
 * The marquee scroll speed, in pixels per second.
 */
export const MARQUEE_SPEED_PX_PER_SECOND = 40

/**
 * Computes how long one loop of the marquee takes so the track moves at
 * `MARQUEE_SPEED_PX_PER_SECOND` whatever the width of one row.
 * @param rowWidth - The width of one row of the track, in pixels.
 * @returns The loop duration in seconds.
 * @throws {RangeError} When `rowWidth` is not a positive finite number.
 */
export function marqueeDurationSeconds(rowWidth: number): number {
  if (!Number.isFinite(rowWidth) || rowWidth <= 0) {
    throw new RangeError('The marquee row width must be positive.')
  }
  return rowWidth / MARQUEE_SPEED_PX_PER_SECOND
}
