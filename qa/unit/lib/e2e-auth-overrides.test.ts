import { describe, expect, it } from "vitest";
import { e2eAuthOverrides } from "@/lib/e2e-auth-overrides";

const baseUrl = "http://localhost:3100";
const noOverrides = { trustedOrigins: [], rateLimit: undefined };

describe("e2eAuthOverrides", () => {
  it("turns rate limiting off and trusts the test server when the flag is set off Vercel", () => {
    expect(
      e2eAuthOverrides({
        E2E_DISABLE_RATE_LIMIT: "true",
        NEXT_PUBLIC_BASE_URL: baseUrl,
      }),
    ).toEqual({ trustedOrigins: [baseUrl], rateLimit: { enabled: false } });
  });

  it("changes nothing on Vercel, even when the flag is set", () => {
    expect(
      e2eAuthOverrides({
        E2E_DISABLE_RATE_LIMIT: "true",
        VERCEL: "1",
        NEXT_PUBLIC_BASE_URL: baseUrl,
      }),
    ).toEqual(noOverrides);
  });

  it("changes nothing when the flag is missing", () => {
    expect(e2eAuthOverrides({ NEXT_PUBLIC_BASE_URL: baseUrl })).toEqual(noOverrides);
  });

  it.each(["false", "1", "TRUE", "yes", ""])(
    "changes nothing when the flag is %j rather than exactly \"true\"",
    (flag) => {
      expect(
        e2eAuthOverrides({
          E2E_DISABLE_RATE_LIMIT: flag,
          NEXT_PUBLIC_BASE_URL: baseUrl,
        }),
      ).toEqual(noOverrides);
    },
  );

  it("turns rate limiting off but trusts no extra origin when no base URL is set", () => {
    expect(e2eAuthOverrides({ E2E_DISABLE_RATE_LIMIT: "true" })).toEqual({
      trustedOrigins: [],
      rateLimit: { enabled: false },
    });
  });

  it("treats an empty VERCEL value as not on Vercel", () => {
    expect(
      e2eAuthOverrides({ E2E_DISABLE_RATE_LIMIT: "true", VERCEL: "" }).rateLimit,
    ).toEqual({ enabled: false });
  });
});
