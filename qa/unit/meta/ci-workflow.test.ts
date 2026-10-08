import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "../../..");
const read = (file: string) => readFileSync(path.join(root, file), "utf8");

const workflow = read(".github/workflows/ci.yml");
const appJob = workflow.slice(workflow.indexOf("\n  app:"));

// The browser tests run against the one shared Neon database (preview, dev and
// production use it too), so CI must never change its schema or delete real data.
describe("CI app job", () => {
  it("fails, never skips, when an app secret is missing", () => {
    expect(appJob).not.toMatch(/steps\.gate\.outputs/);
    expect(appJob).not.toMatch(/ready=false/);
    expect(appJob).toMatch(/exit 1/);
    for (const secret of [
      "BETTER_AUTH_SECRET",
      "POSTGRES_PRISMA_URL",
      "POSTGRES_URL_NON_POOLING",
    ]) {
      expect(appJob).toContain(`secrets.${secret}`);
    }
  });

  it("checks that the database has every migration before building", () => {
    const status = appJob.indexOf("prisma migrate status");
    expect(status).toBeGreaterThan(-1);
    expect(status).toBeLessThan(appJob.indexOf("npm run build"));
  });

  it("turns auth rate limiting off for the tests, and only there", () => {
    expect(appJob).toMatch(/E2E_DISABLE_RATE_LIMIT: "true"/);
    expect(workflow.match(/E2E_DISABLE_RATE_LIMIT/g)).toHaveLength(1);

    const auth = read("src/lib/auth.ts");
    expect(auth).toMatch(/E2E_DISABLE_RATE_LIMIT === "true"/);
    expect(auth).toMatch(/!process\.env\.VERCEL\b/);
    expect(auth).not.toMatch(/rateLimit:\s*\{\s*enabled:\s*true/);
  });

  it("trusts the test server origin only under the same Vercel-excluded flag", () => {
    const auth = read("src/lib/auth.ts");
    expect(auth).toMatch(/runsE2eTests\s*\?\s*optional\(process\.env\.NEXT_PUBLIC_BASE_URL\)/);
    expect(auth).toMatch(/const runsE2eTests =\s*process\.env\.E2E_DISABLE_RATE_LIMIT === "true" && !process\.env\.VERCEL/);
  });

  it("never changes the shared database schema", () => {
    expect(workflow).not.toMatch(/migrate (deploy|dev|reset)/);
    expect(workflow).not.toMatch(/db push/);
  });
});

describe("e2e database cleanup", () => {
  const db = read("qa/e2e/support/db.ts");

  it("deletes only accounts created by the e2e tests", () => {
    const calls = db.match(/await deleteUsersWhere\([\s\S]*?\);/g) ?? [];
    expect(calls).toHaveLength(2);
    for (const call of calls) {
      expect(call).toMatch(/email LIKE/);
      expect(call).toMatch(/e2e/i);
    }
  });
});
