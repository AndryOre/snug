import { defineConfig, devices } from '@playwright/test'

const RESPONSIVE_SPEC = /responsive\.spec\.ts$/

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
      testMatch: RESPONSIVE_SPEC,
      use: { ...devices['iPhone SE'], browserName: 'chromium' },
    },
    {
      name: 'narrow-320',
      testMatch: RESPONSIVE_SPEC,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 320, height: 640 },
      },
    },
    {
      name: 'pixel-7',
      testMatch: RESPONSIVE_SPEC,
      use: { ...devices['Pixel 7'] },
    },
  ],
  webServer: {
    command: 'bun run preview --port 4399 --ignore-lock',
    url: 'http://localhost:4399',
    reuseExistingServer: !process.env.CI,
  },
})
