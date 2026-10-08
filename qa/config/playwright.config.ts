import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

// Playwright compiles its config as CommonJS, so `import.meta` (used by repo-root.ts) is unavailable here.
const REPO_ROOT = `${path.resolve(__dirname, "../..")}/`;

const PORT = Number(process.env.PORT ?? 3000);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

/**
 * Browser layers: `qa/e2e/{smoke,seo,axe}`. Locally this reuses the dev server
 * that is already running, so a busy port never spawns a second `next dev`.
 */
export default defineConfig({
  testDir: `${REPO_ROOT}qa/e2e`,
  outputDir: "/tmp/playwright/results",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        cwd: REPO_ROOT,
        url: baseURL,
        reuseExistingServer: true,
        timeout: 180_000,
      },
});
