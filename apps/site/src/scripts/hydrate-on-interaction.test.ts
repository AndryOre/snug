import { describe, expect, it, vi } from 'vitest'

import {
  hydrateOnInteraction,
  INTERACTION_EVENTS,
} from './hydrate-on-interaction'

class FakeRoot extends EventTarget {
  click = vi.fn()
}

function setup() {
  const root = new FakeRoot()
  const hydrate = vi.fn(() => Promise.resolve())
  const loading = Promise.withResolvers<() => Promise<void>>()
  const load = vi.fn(() => loading.promise)
  hydrateOnInteraction(root, load)
  return { root, load, hydrate, finishLoading: () => loading.resolve(hydrate) }
}

describe('hydrateOnInteraction', () => {
  it('does not load before any interaction', () => {
    const { load } = setup()
    expect(load).not.toHaveBeenCalled()
  })

  it.each(INTERACTION_EVENTS)('loads once on the first %s', (type) => {
    const { root, load } = setup()
    root.dispatchEvent(new Event(type))
    root.dispatchEvent(new Event(type))
    root.dispatchEvent(new Event('focusin'))
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('replays a click that landed before hydration', async () => {
    const { root, hydrate, finishLoading } = setup()
    root.dispatchEvent(new Event('touchstart'))
    root.dispatchEvent(new Event('click'))
    expect(root.click).not.toHaveBeenCalled()
    finishLoading()
    await vi.waitFor(() => expect(root.click).toHaveBeenCalledTimes(1))
    expect(hydrate).toHaveBeenCalledTimes(1)
  })

  it('does not replay without an early click', async () => {
    const { root, hydrate, finishLoading } = setup()
    root.dispatchEvent(new Event('focusin'))
    finishLoading()
    await vi.waitFor(() => expect(hydrate).toHaveBeenCalledTimes(1))
    expect(root.click).not.toHaveBeenCalled()
  })
})
