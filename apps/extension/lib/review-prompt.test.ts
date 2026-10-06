import { beforeEach, describe, expect, it } from 'vitest'
import { fakeBrowser } from 'wxt/testing/fake-browser'

import {
  dismissReviewPrompt,
  isReviewPromptVisible,
  markReviewPromptEligible,
} from './review-prompt'
import { reviewPromptStore } from './storage'
import type { AutoExportLastRun } from './types'

const okRun: AutoExportLastRun = { at: 1, ok: true, trigger: 'scheduled' }
const failedRun: AutoExportLastRun = {
  at: 1,
  ok: false,
  error: 'x',
  trigger: 'scheduled',
}

describe('review prompt state', () => {
  beforeEach(() => {
    fakeBrowser.reset()
  })

  it('records the first eligibleAt and keeps it on later exports', async () => {
    await markReviewPromptEligible(100)
    await markReviewPromptEligible(200)
    expect(await reviewPromptStore.getValue()).toEqual({
      eligibleAt: 100,
      dismissedAt: null,
    })
  })

  it('records dismissedAt and keeps eligibleAt', async () => {
    await markReviewPromptEligible(100)
    await dismissReviewPrompt(300)
    expect(await reviewPromptStore.getValue()).toEqual({
      eligibleAt: 100,
      dismissedAt: 300,
    })
  })
})

describe('isReviewPromptVisible', () => {
  it('is hidden until eligible', () => {
    expect(
      isReviewPromptVisible({ eligibleAt: null, dismissedAt: null }, null),
    ).toBe(false)
  })

  it('is visible when eligible with no run or a successful run', () => {
    const state = { eligibleAt: 1, dismissedAt: null }
    expect(isReviewPromptVisible(state, null)).toBe(true)
    expect(isReviewPromptVisible(state, okRun)).toBe(true)
  })

  it('is hidden once dismissed', () => {
    expect(
      isReviewPromptVisible({ eligibleAt: 1, dismissedAt: 2 }, okRun),
    ).toBe(false)
  })

  it('is hidden when the last Auto-export run failed', () => {
    expect(
      isReviewPromptVisible({ eligibleAt: 1, dismissedAt: null }, failedRun),
    ).toBe(false)
  })
})
