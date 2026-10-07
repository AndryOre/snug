import { useEffect } from 'react'
import type { RefObject } from 'react'

function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  )
}

/**
 * Focuses the given input when the user presses "/" outside any text field.
 * @param inputReference Ref to the input that should receive focus.
 */
export function useSlashToFocus(inputReference: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const hasModifier = event.ctrlKey || event.metaKey || event.altKey
      if (hasModifier || event.key !== '/' || isTypingTarget(event.target)) {
        return
      }
      event.preventDefault()
      inputReference.current?.focus()
    }
    globalThis.addEventListener('keydown', handleKeyDown)
    return () => globalThis.removeEventListener('keydown', handleKeyDown)
  }, [inputReference])
}
