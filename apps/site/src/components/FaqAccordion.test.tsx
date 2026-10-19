// @vitest-environment jsdom
import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import FaqAccordion from './FaqAccordion'

const ENTRIES = [
  { id: 'free', question: 'Is it free?', answer: 'Yes, always.' },
  { id: 'private', question: 'Is it private?', answer: 'Nothing leaves.' },
]

const mounted: { container?: HTMLElement; root?: Root } = {}

function currentContainer() {
  return mounted.container as HTMLElement
}

function triggers() {
  return [
    ...currentContainer().querySelectorAll<HTMLButtonElement>(
      '[data-slot="accordion-trigger"]',
    ),
  ]
}

async function click(element: HTMLElement) {
  await act(async () => {
    element.click()
  })
}

describe('FaqAccordion', () => {
  beforeEach(async () => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
    const container = document.createElement('div')
    document.body.append(container)
    const root = createRoot(container)
    mounted.container = container
    mounted.root = root
    await act(async () => {
      root.render(createElement(FaqAccordion, { entries: ENTRIES }))
    })
  })

  afterEach(() => {
    act(() => mounted.root?.unmount())
    mounted.container?.remove()
    vi.unstubAllGlobals()
  })

  it('renders one collapsed trigger per entry', () => {
    const buttons = triggers()
    expect(buttons.map((button) => button.textContent)).toEqual([
      'Is it free?',
      'Is it private?',
    ])
    for (const button of buttons) {
      expect(button.getAttribute('aria-expanded')).toBe('false')
    }
  })

  it('tags each trigger with its analytics event', () => {
    const [first] = triggers()
    expect(first?.dataset.umamiEvent).toBe('faq-open')
    expect(first?.dataset.umamiEventQuestion).toBe('free')
  })

  it('keeps every answer mounted, hidden until found', () => {
    const panels = [
      ...currentContainer().querySelectorAll('[data-slot="accordion-content"]'),
    ]
    expect(panels.map((panel) => panel.textContent)).toEqual([
      'Yes, always.',
      'Nothing leaves.',
    ])
    for (const panel of panels) {
      expect(panel.getAttribute('hidden')).toBe('until-found')
    }
  })

  it('expands on click and collapses on a second click', async () => {
    const [first] = triggers()
    await click(first as HTMLButtonElement)
    expect(first?.getAttribute('aria-expanded')).toBe('true')
    await click(first as HTMLButtonElement)
    expect(first?.getAttribute('aria-expanded')).toBe('false')
  })

  it('opens a single entry at a time', async () => {
    const [first, second] = triggers()
    await click(first as HTMLButtonElement)
    await click(second as HTMLButtonElement)
    expect(first?.getAttribute('aria-expanded')).toBe('false')
    expect(second?.getAttribute('aria-expanded')).toBe('true')
  })

  it('exposes native, tabbable buttons so Enter and Space work', () => {
    for (const button of triggers()) {
      expect(button.tagName).toBe('BUTTON')
      expect(button.getAttribute('type')).toBe('button')
      expect(button.tabIndex).toBe(0)
      button.focus()
      expect(document.activeElement).toBe(button)
    }
  })
})
