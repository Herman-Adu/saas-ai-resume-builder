import { describe, expect, it } from "vitest";
import {
  assertSafeTarget,
  e2eEmail,
  e2eEmailPattern,
  isE2eEmail,
} from "../e2e/support/target";

describe("assertSafeTarget", () => {
  it("allows local servers", () => {
    expect(() => assertSafeTarget("http://localhost:3000")).not.toThrow();
    expect(() => assertSafeTarget("http://127.0.0.1:3000")).not.toThrow();
  });

  it("refuses the production site", () => {
    expect(() =>
      assertSafeTarget("https://saas-ai-resume-builder-seven.vercel.app"),
    ).toThrow(/production/i);
  });

  it("refuses any extra production host passed in", () => {
    expect(() =>
      assertSafeTarget("https://cv.example.com", ["cv.example.com"]),
    ).toThrow(/production/i);
  });

  it("refuses a value that is not a URL", () => {
    expect(() => assertSafeTarget("not a url")).toThrow();
  });
});

describe("e2e account names", () => {
  it("builds a reserved, run-scoped email", () => {
    expect(e2eEmail("run1a2b", "pro")).toBe("e2e-run1a2b-pro@e2e.invalid");
  });

  it("recognises only e2e emails", () => {
    expect(isE2eEmail("e2e-run1a2b-pro@e2e.invalid")).toBe(true);
    expect(isE2eEmail("someone@example.com")).toBe(false);
  });

  it("builds a cleanup pattern scoped to one run", () => {
    expect(e2eEmailPattern("run1a2b")).toBe("e2e-run1a2b-%@e2e.invalid");
  });

  it("rejects run ids that could widen a LIKE pattern", () => {
    expect(() => e2eEmail("a%b", "pro")).toThrow();
    expect(() => e2eEmailPattern("a_b")).toThrow();
    expect(() => e2eEmailPattern("")).toThrow();
  });
});
