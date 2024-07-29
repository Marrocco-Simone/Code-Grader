const { defineConfig, devices } = require("@playwright/test");

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  timeout: 10000,
  retries: 0,
  testDir: "./tests",
  reporter: "list",
  use: {
    baseURL: "http://localhost:7800",
    headless: true,
    ignoreHTTPSErrors: true,
  },

  projects: [
    {
      name: "e2e-headless-chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
