import { describe, expect, it } from 'vitest'

import type { PlanNode } from './import-plan'
import { toPreviewNodes } from './import-preview-tree'

const PLAN_TREE: PlanNode[] = [
  {
    kind: 'folder',
    id: 'f0/0',
    title: 'Bookmarks bar',
    children: [
      {
        kind: 'bookmark',
        id: 'f0/0/0',
        title: 'New',
        url: 'https://new.example',
        state: { status: 'new' },
      },
      {
        kind: 'bookmark',
        id: 'f0/0/1',
        title: 'Seen',
        url: 'https://seen.example',
        state: { status: 'duplicate', reason: 'existing' },
      },
    ],
  },
]

describe('toPreviewNodes', () => {
  it('keeps the folder structure and ids, and disables duplicates', () => {
    expect(toPreviewNodes(PLAN_TREE, true)).toEqual([
      {
        id: 'f0/0',
        title: 'Bookmarks bar',
        children: [
          { id: 'f0/0/0', title: 'New', url: 'https://new.example' },
          {
            id: 'f0/0/1',
            title: 'Seen',
            url: 'https://seen.example',
            isDisabled: true,
          },
        ],
      },
    ])
  })

  it('leaves every node enabled when duplicates are not marked', () => {
    const [folder] = toPreviewNodes(PLAN_TREE, false)
    expect(folder?.children?.some((child) => child.isDisabled)).toBe(false)
  })
})
