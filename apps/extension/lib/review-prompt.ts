import { reviewPromptStore } from '@/lib/storage'
import type { AutoExportLastRun, ReviewPromptState } from '@/lib/types'

/**
 * Records that the user completed a successful export. Idempotent: the first
 * `eligibleAt` is kept so later exports never move it.
 * @param now Epoch milliseconds of the successful export.
 */
export async function markReviewPromptEligible(now: number): Promise<void> {
  const state = await reviewPromptStore.getValue()
  if (state.eligibleAt !== null) return
  await reviewPromptStore.setValue({ ...state, eligibleAt: now })
}

/**
 * Retires the Review prompt permanently. Used by both "Leave a review" and
 * "Not now".
 * @param now Epoch milliseconds of the dismissal.
 */
export async function dismissReviewPrompt(now: number): Promise<void> {
  const state = await reviewPromptStore.getValue()
  await reviewPromptStore.setValue({ ...state, dismissedAt: now })
}

/**
 * Whether the popup shows the Review prompt: only once eligible, never after
 * dismissal, and not while the last Auto-export run failed.
 * @param state The persisted Review prompt state.
 * @param lastRun The last Auto-export run, or `null` when none has run.
 * @returns `true` when the card should render.
 */
export function isReviewPromptVisible(
  state: ReviewPromptState,
  lastRun: AutoExportLastRun | null,
): boolean {
  const isLive = state.eligibleAt !== null && state.dismissedAt === null
  return isLive && lastRun?.ok !== false
}
