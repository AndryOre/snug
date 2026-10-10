import { describe, expect, it, vi } from 'vitest'

import {
  installSearchTrustedTypesPolicy,
  restrictToPagefindWorker,
} from './search-trusted-types'

const ORIGIN = 'https://snug.andryore.dev'

describe('restrictToPagefindWorker', () => {
  it('allows the Pagefind worker by relative and absolute URL', () => {
    expect(
      restrictToPagefindWorker('/pagefind/pagefind-worker.js', ORIGIN),
    ).toBe('/pagefind/pagefind-worker.js')
    const absolute = `${ORIGIN}/pagefind/pagefind-worker.js`
    expect(restrictToPagefindWorker(absolute, ORIGIN)).toBe(absolute)
  })

  it('blocks other paths and other origins', () => {
    expect(() => restrictToPagefindWorker('/assets/evil.js', ORIGIN)).toThrow(
      TypeError,
    )
    expect(() =>
      restrictToPagefindWorker(
        'https://example.com/pagefind/pagefind-worker.js',
        ORIGIN,
      ),
    ).toThrow(TypeError)
    expect(() =>
      restrictToPagefindWorker('data:text/javascript,alert(1)', ORIGIN),
    ).toThrow(TypeError)
  })
})

describe('installSearchTrustedTypesPolicy', () => {
  it('registers the default policy with HTML and script URL callbacks only', () => {
    const createPolicy = vi.fn()
    installSearchTrustedTypesPolicy({ createPolicy }, ORIGIN)
    expect(createPolicy).toHaveBeenCalledOnce()
    const [name, rules] = createPolicy.mock.calls[0] ?? []
    expect(name).toBe('default')
    expect(Object.keys(rules).toSorted((a, b) => a.localeCompare(b))).toEqual([
      'createHTML',
      'createScriptURL',
    ])
  })

  it('does nothing without Trusted Types support', () => {
    expect(() =>
      installSearchTrustedTypesPolicy(undefined, ORIGIN),
    ).not.toThrow()
  })
})
