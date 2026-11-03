import { beforeEach, vi } from 'vitest'

/**
 * Gives every test file a `browser.permissions` where all optional
 * permissions are granted, because `fakeBrowser` leaves it unimplemented.
 * Tests that need a missing or denied permission overwrite it themselves.
 */
beforeEach(() => {
  browser.permissions = {
    contains: vi.fn(async () => true),
    request: vi.fn(async () => true),
    onAdded: { addListener: vi.fn(), removeListener: vi.fn() },
    onRemoved: { addListener: vi.fn(), removeListener: vi.fn() },
  } as unknown as typeof browser.permissions
})
