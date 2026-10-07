// @vitest-environment jsdom
import { act, createElement, createRef } from 'react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fakeBrowser } from 'wxt/testing/fake-browser'

import { createDomHarness } from '@/lib/testing/dom-harness'
import type { DomHarness } from '@/lib/testing/dom-harness'
import type { BookmarkNode, BookmarkTreeViewHandle } from '@/lib/types'

import { BookmarkTreeView } from './bookmark-tree-view'

const mountedHarnesses: DomHarness[] = []

function noop() {}

const NODES: BookmarkNode[] = [
  {
    id: 'folder',
    title: 'Work',
    children: [
      { id: 'a', title: 'Alpha', url: 'https://example.com/a' },
      {
        id: 'dup',
        title: 'Duplicate',
        url: 'https://example.com/dup',
        isDisabled: true,
      },
    ],
  },
  { id: 'b', title: 'Beta', url: 'https://example.com/b' },
]

interface MountOptions {
  isSelectable?: boolean
  renderBadge?: (node: BookmarkNode) => ReactNode
}

async function mountView({ isSelectable, renderBadge }: MountOptions = {}) {
  const harness = createDomHarness()
  mountedHarnesses.push(harness)
  const reference = createRef<BookmarkTreeViewHandle>()
  let selectedCount = 0
  await harness.render(
    createElement(BookmarkTreeView, {
      ref: reference,
      nodes: NODES,
      searchTerm: '',
      ariaLabel: 'Import preview',
      isSelectable,
      renderBadge,
      autoExpandToken: 0,
      onSelectionChange: (count: number) => {
        selectedCount = count
      },
      onTotalChange: noop,
    }),
  )
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10))
  })
  return { harness, reference, getSelectedCount: () => selectedCount }
}

function row(container: HTMLElement, title: string) {
  return container.querySelector<HTMLElement>(
    `[aria-label="${CSS.escape(title)}"]`,
  )
}

describe('BookmarkTreeView', () => {
  beforeEach(() => {
    fakeBrowser.reset()
    fakeBrowser.i18n.getMessage = vi.fn(
      (key: string) => key,
    ) as typeof fakeBrowser.i18n.getMessage
    for (const property of ['offsetHeight', 'offsetWidth']) {
      Object.defineProperty(HTMLElement.prototype, property, {
        configurable: true,
        value: 600,
      })
    }
  })

  afterEach(() => {
    for (const harness of mountedHarnesses.splice(0)) harness.unmount()
    vi.restoreAllMocks()
  })

  it('renders a static node array with the given aria-label', async () => {
    const { harness } = await mountView({ isSelectable: true })

    expect(
      harness.container
        .querySelector('[role="tree"]')
        ?.getAttribute('aria-label'),
    ).toBe('Import preview')
    expect(row(harness.container, 'Alpha')).not.toBeNull()
    expect(row(harness.container, 'Beta')).not.toBeNull()
  })

  it('renders read-only rows without checkboxes or aria-checked', async () => {
    const { harness, reference } = await mountView({ isSelectable: false })

    expect(harness.container.querySelector('[data-checked]')).toBeNull()
    expect(row(harness.container, 'Alpha')?.hasAttribute('aria-checked')).toBe(
      false,
    )

    await act(async () => reference.current?.selectAll())
    expect(reference.current?.getCheckedIds()).toEqual([])
  })

  it('skips disabled nodes in select-all and the checked ids', async () => {
    const { harness, reference, getSelectedCount } = await mountView({
      isSelectable: true,
    })

    await act(async () => reference.current?.selectAll())

    expect(
      reference.current?.getCheckedIds().toSorted((a, b) => a.localeCompare(b)),
    ).toEqual(['a', 'b'])
    expect(getSelectedCount()).toBe(2)
    expect(reference.current?.areAllVisibleSelected()).toBe(true)
    expect(row(harness.container, 'Work')?.getAttribute('aria-checked')).toBe(
      'true',
    )
    expect(
      row(harness.container, 'Duplicate')?.getAttribute('aria-disabled'),
    ).toBe('true')
  })

  it('does not toggle a disabled row on click', async () => {
    const { harness, reference } = await mountView({ isSelectable: true })

    await act(async () => row(harness.container, 'Duplicate')?.click())

    expect(reference.current?.getCheckedIds()).toEqual([])
  })

  it('renders the badge slot for a node', async () => {
    const { harness } = await mountView({
      isSelectable: false,
      renderBadge: (node) =>
        node.isDisabled
          ? createElement('span', { 'data-testid': 'badge' }, 'Skipped')
          : undefined,
    })

    const badges = harness.container.querySelectorAll('[data-testid="badge"]')
    expect(badges).toHaveLength(1)
    expect(
      row(harness.container, 'Duplicate')?.contains(badges[0] ?? null),
    ).toBe(true)
  })
})
