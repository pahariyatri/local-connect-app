import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'desktop-chrome',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      // Real iPhone 13 viewport/UA/touch/scale metrics, run on the Chromium
      // engine rather than WebKit — this sandbox has no system deps for
      // WebKit (needs `sudo apt-get install libevent-2.1-7t64 libavif16`,
      // not available here) and Playwright's default `devices['iPhone 13']`
      // forces `defaultBrowserType: 'webkit'`. This still catches real
      // layout/overflow/responsive issues at the correct device size; it
      // will not catch genuine Safari-only rendering quirks. Swap to
      // `{ ...devices['iPhone 13'] }` once WebKit deps are installed.
      name: 'iphone-13',
      use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' },
    },
  ],
});
