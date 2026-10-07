// @vitest-environment jsdom
import { act, createElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fakeBrowser } from 'wxt/testing/fake-browser'

import { createDomHarness } from '@/lib/testing/dom-harness'
import type { DomHarness } from '@/lib/testing/dom-harness'

import { ImportFileStep } from './import-file-step'
import type { ImportFileRow } from './import-file-step'

const mountedHarnesses: DomHarness[] = []

function bookmarkFile(name: string): File {
  return new File(['title,url\nA,https://a.example'], name, {
    type: 'text/csv',
  })
}

async function mountStep(rows: ImportFileRow[] = []) {
  const onFiles = vi.fn()
  const onRemove = vi.fn()
  const harness = createDomHarness()
  mountedHarnesses.push(harness)
  await harness.render(
    createElement(ImportFileStep, {
      rows,
      onFiles,
      onRemove,
      disabled: false,
    }),
  )
  return { harness, onFiles, onRemove }
}

async function dropOn(target: Element, files: File[]) {
  const event = new Event('drop', { bubbles: true, cancelable: true })
  Object.defineProperty(event, 'dataTransfer', { value: { files } })
  await act(async () => {
    target.dispatchEvent(event)
  })
}

beforeEach(() => {
  fakeBrowser.reset()
  fakeBrowser.i18n.getMessage = vi.fn(
    (key: string) => key,
  ) as typeof fakeBrowser.i18n.getMessage
})

afterEach(() => {
  for (const harness of mountedHarnesses.splice(0)) harness.unmount()
  vi.unstubAllGlobals()
})

describe('ImportFileStep', () => {
  it('passes every dropped file to onFiles', async () => {
    const { harness, onFiles } = await mountStep()
    const zone = harness.container.querySelector('label')
    if (!zone) throw new Error('drop zone missing')
    const dropped = [bookmarkFile('a.csv'), bookmarkFile('b.csv')]

    await dropOn(zone, dropped)

    expect(onFiles).toHaveBeenCalledExactlyOnceWith(dropped)
  })

  it('offers a multi-file picker and lists the rows', async () => {
    const { harness } = await mountStep([
      { id: '1', name: 'a.csv', description: 'CSV · 1', isInvalid: false },
    ])

    const input = harness.container.querySelector('input[type="file"]')
    expect(input?.hasAttribute('multiple')).toBe(true)
    expect(harness.container.textContent).toContain('a.csv')
  })

  it('shows the reason of an invalid row and removes it', async () => {
    const { harness, onRemove } = await mountStep([
      { id: 'x', name: 'bad.html', description: 'Nope', isInvalid: true },
    ])

    expect(harness.container.textContent).toContain('Nope')
    const rowCloseButton = [
      ...harness.container.querySelectorAll('button'),
    ].find((button) =>
      button.getAttribute('aria-label')?.includes('import_removeFile'),
    )
    if (!rowCloseButton) throw new Error('remove button missing')
    await act(async () => {
      rowCloseButton.click()
    })

    expect(onRemove).toHaveBeenCalledExactlyOnceWith('x')
  })
})
