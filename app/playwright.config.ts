import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname for ES module scope
const __filename = fileURLToPath(import.meta.url);
const customDirname = path.dirname(__filename);

// Use process.env.PORT by default and fallback to 3000 if not specified.
const PORT = process.env.PORT || 3000;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  // Timeout for each test
  timeout: 30 * 1000,
  // Test directory
  testDir: path.join(customDirname, 'e2e'), // Use customDirname
  // Output directory for artifacts like screenshots, videos, traces
  outputDir: path.join(customDirname, 'e2e/test-results'), // Use customDirname
  // Fully parallel mode for tests
  fullyParallel: true,
  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  // Opt out of parallel tests on CI.
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use. See https://playwright.dev/docs/test-reporters
  reporter: 'html',

  webServer: {
    // Command to start the Nuxt dev server with devtools disabled
    command: 'NUXT_DEVTOOLS_ENABLED=0 npm run dev',
    // URL to use to check if the server is ready
    url: baseURL,
    // Option to reuse an existing server if one is already running locally
    reuseExistingServer: !process.env.CI,
    // Directory from which to run the command, relative to playwright.config.ts
    cwd: customDirname, // Use customDirname (playwright.config.ts is in 'app' and 'npm run dev' should run from 'app')
    // Timeout for the server to start - Set to 380 seconds
    timeout: 380 * 1000,
    // Log server output to console
    stdout: 'pipe',
    stderr: 'pipe',
  },

  use: {
    // Base URL to use in actions like `await page.goto('/')`.
    baseURL: baseURL,

    // Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
});
