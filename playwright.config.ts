import { defineConfig } from "@playwright/test";
import fs from "fs";
import path from "path";

// Load .env.local into process.env (CLERK_SECRET_KEY etc. for the tests'
// setup/cleanup helpers). No dotenv dependency needed.
const envPath = path.join(__dirname, ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
}

// Target: local dev server by default; set E2E_BASE_URL (e.g. the production
// URL) to run against a deployed environment instead — the webServer is
// skipped in that case. Note: local runs need SUPABASE_SERVICE_ROLE_KEY in
// .env.local (marked Sensitive in Vercel, so `vercel env pull` can't fetch it).
const baseURL = process.env.E2E_BASE_URL || "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  timeout: 90_000,
  workers: 1, // serial: shared Clerk dev instance + shared dev server
  reporter: [["list"]],
  use: {
    baseURL,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  ...(process.env.E2E_BASE_URL
    ? {}
    : {
        webServer: {
          command: "npm run dev",
          url: "http://localhost:3000",
          reuseExistingServer: true,
          timeout: 120_000,
        },
      }),
});
