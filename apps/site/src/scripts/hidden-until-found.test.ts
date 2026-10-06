import { describe, expect, it } from 'vitest'

import { markCollapsedPanelsFindable } from './hidden-until-found'

const collapsedPanel =
  '<div data-orientation="vertical" data-closed="" hidden="" id="p1" role="region" data-slot="accordion-content" class="x">A</div>'

describe('markCollapsedPanelsFindable', () => {
  it('turns the hidden attribute of every collapsed accordion panel into until-found', () => {
    const html = `<main>${collapsedPanel}${collapsedPanel}</main>`
    const result = markCollapsedPanelsFindable(html)
    expect(result.match(/hidden="until-found"/g)).toHaveLength(2)
    expect(result).not.toContain('hidden=""')
  })

  it('leaves other hidden elements and open panels alone', () => {
    const html =
      '<div hidden="" id="other"></div><div data-open="" id="p2" role="region" data-slot="accordion-content"></div>'
    expect(markCollapsedPanelsFindable(html)).toBe(html)
  })
})
