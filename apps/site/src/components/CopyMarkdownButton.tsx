import { Button } from '@workspace/ui/components/button'
import { CheckIcon, CopyIcon, TriangleAlertIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import {
  COPY_FEEDBACK_MILLISECONDS,
  copyMarkdownTwin,
} from '../docs/copy-markdown'

type CopyState = 'idle' | 'copied' | 'failed'

const STATE_ICONS = {
  idle: CopyIcon,
  copied: CheckIcon,
  failed: TriangleAlertIcon,
} as const

/**
 * Localized labels of the Copy Markdown button.
 */
interface CopyMarkdownCopy {
  copyMarkdown: string
  copied: string
  copyFailed: string
}

interface CopyMarkdownButtonProperties {
  twinHref: string
  copy: CopyMarkdownCopy
}

const STATE_LABEL_KEYS = {
  idle: 'copyMarkdown',
  copied: 'copied',
  failed: 'copyFailed',
} as const

export default function CopyMarkdownButton({
  twinHref,
  copy,
}: CopyMarkdownButtonProperties) {
  const [state, setState] = useState<CopyState>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  async function handleClick() {
    clearTimeout(timer.current)
    const result = await copyMarkdownTwin(twinHref, fetch, (text) =>
      navigator.clipboard.writeText(text),
    )
    setState(result)
    timer.current = setTimeout(
      () => setState('idle'),
      COPY_FEEDBACK_MILLISECONDS,
    )
  }

  const Icon = STATE_ICONS[state]
  return (
    <Button
      type="button"
      variant="outline"
      size="touch"
      data-copy-markdown
      onClick={() => void handleClick()}
    >
      <Icon aria-hidden="true" />
      <span aria-live="polite">{copy[STATE_LABEL_KEYS[state]]}</span>
    </Button>
  )
}
