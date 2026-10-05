import { defineConfig, devices } from '@playwright/test'

const LAYOUT_SPECS =
  /(responsive|accessibility|hero-trust|closing|theme|theme-menu|layout-matrix)\.spec\.ts$/

export default defineConfig({
  testDir: './e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['html', { open: 'never' }]] : 'list',
  use: { baseURL: 'http://localhost:4399' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'iphone-se',
      testMatch: LAYOUT_SPECS,
      use: { ...devices['iPhone SE'], browserName: 'chromium' },
    },
    {
      name: 'narrow-320',
      testMatch: LAYOUT_SPECS,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 320, height: 640 },
      },
    },
    {
      name: 'pixel-7',
      testMatch: LAYOUT_SPECS,
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'ipad-mini',
      testMatch: LAYOUT_SPECS,
      use: { ...devices['iPad Mini'], browserName: 'chromium' },
    },
    {
      name: 'landscape-phone',
      testMatch: LAYOUT_SPECS,
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 844, height: 390 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: 'bun run preview --port 4399 --ignore-lock',
    url: 'http://localhost:4399',
    reuseExistingServer: !process.env.CI,
  },
})
