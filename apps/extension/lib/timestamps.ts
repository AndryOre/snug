/**
 * Converts a millisecond timestamp to whole seconds, rounding down.
 * @param milliseconds The timestamp in milliseconds.
 * @returns The timestamp in whole seconds.
 */
export function millisecondsToSeconds(milliseconds: number): number {
  return Math.floor(milliseconds / 1000)
}

/**
 * Converts a second timestamp to milliseconds.
 * @param seconds The timestamp in seconds.
 * @returns The timestamp in milliseconds.
 */
export function secondsToMilliseconds(seconds: number): number {
  return seconds * 1000
}
