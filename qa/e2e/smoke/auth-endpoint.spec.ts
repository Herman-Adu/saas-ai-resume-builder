import { expect, test } from "@playwright/test";

test.describe("Better Auth server", () => {
  test("health endpoint answers at /api/auth", async ({ request }) => {
    const response = await request.get("/api/auth/ok", { maxRedirects: 0 });
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
  });

  test("dashboard validate endpoint is reachable and rejects unsigned calls", async ({
    request,
  }) => {
    const response = await request.get("/api/auth/dash/validate", {
      maxRedirects: 0,
    });
    expect(response.status()).toBe(401);
  });
});
