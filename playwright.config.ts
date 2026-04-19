import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: true,
  reporter: process.env.CI ? "list" : [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    // Pixel 7 is chromium-based, so a single browser install covers both projects.
    {
      name: "chromium-mobile",
      use: { ...devices["Pixel 7"] },
    },
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // Use the production build for tests — `next start` serves prebuilt
    // pages instantly; `next dev` recompiles per-route on cold starts and
    // can stall on slow disks. CI runs `next build` before this.
    command: `next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
