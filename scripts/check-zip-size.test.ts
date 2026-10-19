import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
  evaluateZipSize,
  findChromeZip,
  ZIP_SIZE_BUDGET_BYTES,
} from './check-zip-size'

describe('evaluateZipSize', () => {
  it('passes at or under the budget', () => {
    expect(evaluateZipSize('a-chrome.zip', 100, 100).isWithinBudget).toBe(true)
    expect(evaluateZipSize('a-chrome.zip', 99, 100).isWithinBudget).toBe(true)
  })

  it('fails over the budget and says so in the summary line', () => {
    const verdict = evaluateZipSize('a-chrome.zip', 101, 100)
    expect(verdict.isWithinBudget).toBe(false)
    expect(verdict.summaryLine).toContain('OVER')
  })

  it('keeps the budget at the documented size plus 10%', () => {
    expect(ZIP_SIZE_BUDGET_BYTES).toBe(Math.ceil(641_826 * 1.1))
  })
})

describe('findChromeZip', () => {
  let directory: string
  beforeEach(() => {
    directory = mkdtempSync(path.join(tmpdir(), 'zip-size-'))
  })
  afterEach(() => rmSync(directory, { recursive: true, force: true }))

  it('finds the chrome zip and ignores the edge one', () => {
    writeFileSync(path.join(directory, 'snug-1-edge.zip'), '')
    writeFileSync(path.join(directory, 'snug-1-chrome.zip'), '')
    expect(findChromeZip(directory)).toBe(
      path.join(directory, 'snug-1-chrome.zip'),
    )
  })

  it('returns undefined when missing', () => {
    expect(findChromeZip(directory)).toBeUndefined()
    expect(findChromeZip(path.join(directory, 'nope'))).toBeUndefined()
  })
})
