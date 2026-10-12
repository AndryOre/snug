/**
 * Events that start hydration of an island: the pointer entering it, focus
 * moving into it, or a touch landing on it.
 */
export const INTERACTION_EVENTS = [
  'pointerenter',
  'focusin',
  'touchstart',
] as const

const CAPTURE = { capture: true }

/**
 * Hydrate an island on its first interaction. A click that lands while the
 * island's code is still loading would hit inert server HTML, so those clicks
 * are recorded and replayed once hydration finishes.
 * @param root - The island element.
 * @param load - Resolves to the island's hydrate function once its code has
 * loaded, as Astro's client directive `load` does.
 */
export function hydrateOnInteraction(
  root: EventTarget,
  load: () => Promise<() => Promise<void>>,
): void {
  const earlyClickTargets: EventTarget[] = []
  const recordClick = (event: Event) => {
    if (event.target) earlyClickTargets.push(event.target)
  }

  const hydrateAndReplay = async () => {
    const hydrate = await load()
    root.removeEventListener('click', recordClick, CAPTURE)
    await hydrate()
    for (const target of earlyClickTargets) {
      const replayable = target as { isConnected?: boolean; click?: () => void }
      if (replayable.isConnected !== false) replayable.click?.()
    }
  }

  const start = () => {
    for (const type of INTERACTION_EVENTS) {
      root.removeEventListener(type, start, CAPTURE)
    }
    void hydrateAndReplay()
  }

  for (const type of INTERACTION_EVENTS) {
    root.addEventListener(type, start, CAPTURE)
  }
  root.addEventListener('click', recordClick, CAPTURE)
}
