import { expect, it } from 'vitest'

import localPlugin from './index.mjs'
import rule from './no-non-doc-comments.mjs'

it('the local plugin registers the no-non-doc-comments rule', () => {
  expect(localPlugin.rules['no-non-doc-comments']).toBe(rule)
})
