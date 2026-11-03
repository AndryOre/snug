import { beforeEach, describe, expect, it } from 'vitest'

import { resetFakeI18n } from '@/lib/testing/fake-i18n'
import en from '@/locales/en.json' with { type: 'json' }

import { getAutoExportErrorMessage } from './auto-export-error'

beforeEach(() => {
  resetFakeI18n()
})

describe('getAutoExportErrorMessage', () => {
  it('localizes the Downloads access code and never returns the raw code', () => {
    const message = getAutoExportErrorMessage(
      'downloads-access-needed',
      'downloads-access-needed',
    )

    expect(message).toBe(en.autoExportError_downloadsAccessNeeded.message)
    expect(message).not.toContain('downloads-access-needed')
  })

  it('keeps the fallback for unknown or missing codes', () => {
    expect(getAutoExportErrorMessage(undefined, 'Disk full')).toBe('Disk full')
    expect(getAutoExportErrorMessage('other', 'Disk full')).toBe('Disk full')
    expect(getAutoExportErrorMessage('toString', 'Disk full')).toBe('Disk full')
  })
})
