import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from 'vitest'
import { fakeBrowser } from 'wxt/testing/fake-browser'

import { autoExportConfigStore } from '@/lib/storage'

import { buildUninstallUrl, registerUninstallUrl } from './uninstall-url'

const BARE_URL = 'https://snug.andryore.dev/goodbye/'

describe('buildUninstallUrl', () => {
  it.each([
    ['en', 'en'],
    ['es-419', 'es'],
    ['de', 'de'],
    ['fr', 'fr'],
    ['it', 'it'],
    ['ja', 'ja'],
    ['ko', 'ko'],
    ['pt-BR', 'pt_BR'],
    ['ru', 'ru'],
    ['zh-CN', 'zh_CN'],
    ['xx-YY', 'en'],
  ])('maps %s to lang=%s', (uiLanguage, lang) => {
    const url = buildUninstallUrl({
      uiLanguage,
      version: '2.2.0',
      isAutoExportEnabled: true,
    })
    expect(url).toBe(`${BARE_URL}?lang=${lang}&v=2.2.0&ae=1`)
  })

  it('sets ae=0 when Auto-export is off', () => {
    const url = buildUninstallUrl({
      uiLanguage: 'en',
      version: '2.2.0',
      isAutoExportEnabled: false,
    })
    expect(url).toBe(`${BARE_URL}?lang=en&v=2.2.0&ae=0`)
    expect(url.length).toBeLessThan(1023)
  })
})

describe('registerUninstallUrl', () => {
  let uninstallUrlSpy: MockInstance<typeof fakeBrowser.runtime.setUninstallURL>

  beforeEach(async () => {
    fakeBrowser.reset()
    vi.stubEnv('DEV', false)
    vi.spyOn(fakeBrowser.i18n, 'getUILanguage').mockReturnValue('pt-BR')
    uninstallUrlSpy = vi
      .spyOn(fakeBrowser.runtime, 'setUninstallURL')
      .mockResolvedValue(undefined)
    vi.spyOn(fakeBrowser.runtime, 'getManifest').mockReturnValue({
      version: '2.2.0',
    } as ReturnType<typeof fakeBrowser.runtime.getManifest>)
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('registers the URL with the stored Auto-export state', async () => {
    const config = await autoExportConfigStore.getValue()
    await autoExportConfigStore.setValue({ ...config, enabled: true })
    await registerUninstallUrl()
    expect(uninstallUrlSpy).toHaveBeenCalledWith(
      `${BARE_URL}?lang=pt_BR&v=2.2.0&ae=1`,
    )
  })

  it('updates to ae=0 when Auto-export is disabled', async () => {
    const config = await autoExportConfigStore.getValue()
    await autoExportConfigStore.setValue({ ...config, enabled: false })
    await registerUninstallUrl()
    expect(uninstallUrlSpy.mock.calls[0]?.[0]).toMatch(/&ae=0$/)
  })

  it('falls back to the bare URL when the browser rejects', async () => {
    uninstallUrlSpy.mockRejectedValueOnce(new Error('too long'))
    await registerUninstallUrl()
    expect(uninstallUrlSpy).toHaveBeenLastCalledWith(BARE_URL)
    expect(console.error).toHaveBeenCalled()
  })

  it('falls back to the bare URL when the built URL is at or over the length limit', async () => {
    vi.spyOn(fakeBrowser.runtime, 'getManifest').mockReturnValue({
      version: '1'.repeat(1100),
    } as ReturnType<typeof fakeBrowser.runtime.getManifest>)
    await registerUninstallUrl()
    expect(uninstallUrlSpy).toHaveBeenCalledTimes(1)
    expect(uninstallUrlSpy).toHaveBeenCalledWith(BARE_URL)
  })

  it('registers an empty string in dev builds', async () => {
    vi.stubEnv('DEV', true)
    await registerUninstallUrl()
    expect(uninstallUrlSpy).toHaveBeenCalledWith('')
  })
})
