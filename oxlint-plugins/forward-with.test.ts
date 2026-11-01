import { expect, it } from 'vitest'

import { forwardWith } from './forward-with.mjs'

it('forwards reads to the frozen target and binds its methods', () => {
  class Target {
    name = 'target'

    describe() {
      return this.name
    }
  }
  const target = Object.freeze(new Target())
  const proxy = forwardWith(target, {}) as typeof target
  expect(proxy.name).toBe('target')
  expect(proxy.describe()).toBe('target')
})

it('returns an override instead of the frozen target value', () => {
  const target = Object.freeze({ value: 'original' })
  const proxy = forwardWith(target, { value: 'replaced' }) as typeof target
  expect(proxy.value).toBe('replaced')
})
