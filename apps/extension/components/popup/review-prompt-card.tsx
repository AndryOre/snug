import { i18n } from '#i18n'
import { Button, buttonVariants } from '@workspace/ui/components/button'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '@workspace/ui/components/item'
import { ExternalLinkIcon } from 'lucide-react'
import { useId } from 'react'

import { useAutoExportLastRun } from '@/components/popup/auto-export-status-item'
import { CHROME_WEB_STORE_REVIEWS_URL } from '@/lib/brand'
import { dismissReviewPrompt, isReviewPromptVisible } from '@/lib/review-prompt'
import { reviewPromptStore } from '@/lib/storage'
import { useStorageItem } from '@/lib/use-storage-item'

function dismiss() {
  void dismissReviewPrompt(Date.now())
}

/**
 * Popup card inviting an honest Chrome Web Store review. Renders only while
 * {@link isReviewPromptVisible} holds and reacts to storage changes, so it
 * appears right after a popup export. Both actions retire it permanently.
 * @returns The Review prompt card, or `null` when hidden.
 */
export function ReviewPromptCard() {
  const [state] = useStorageItem(reviewPromptStore)
  const lastRun = useAutoExportLastRun()
  const titleId = useId()

  if (!isReviewPromptVisible(state, lastRun)) return null

  return (
    <Item
      variant="muted"
      size="sm"
      role="region"
      aria-labelledby={titleId}
      data-testid="review-prompt"
    >
      <ItemContent>
        <ItemTitle id={titleId}>{i18n.t('reviewPrompt_title')}</ItemTitle>
        <ItemDescription>{i18n.t('reviewPrompt_description')}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <a
          href={CHROME_WEB_STORE_REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ size: 'sm' })}
          onClick={dismiss}
        >
          {i18n.t('reviewPrompt_leaveReview')}
          <ExternalLinkIcon data-icon="inline-end" />
        </a>
        <Button variant="ghost" size="sm" onClick={dismiss}>
          {i18n.t('reviewPrompt_notNow')}
        </Button>
      </ItemActions>
    </Item>
  )
}
