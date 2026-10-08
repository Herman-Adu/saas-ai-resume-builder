import { describe, expect, it } from "vitest";
import {
  canCreateResume,
  canUseAITools,
  canUseCustomizations,
} from "@/lib/permissions";

describe("canCreateResume", () => {
  it("lets free users create exactly one resume", () => {
    expect(canCreateResume("free", 0)).toBe(true);
    expect(canCreateResume("free", 1)).toBe(false);
  });

  it("lets pro users create up to three resumes", () => {
    expect(canCreateResume("pro", 2)).toBe(true);
    expect(canCreateResume("pro", 3)).toBe(false);
  });

  it("never limits pro plus users", () => {
    expect(canCreateResume("pro_plus", 10_000)).toBe(true);
  });
});

describe("canUseAITools", () => {
  it.each([
    ["free", false],
    ["pro", true],
    ["pro_plus", true],
  ] as const)("%s -> %s", (level, expected) => {
    expect(canUseAITools(level)).toBe(expected);
  });
});

describe("canUseCustomizations", () => {
  it.each([
    ["free", false],
    ["pro", false],
    ["pro_plus", true],
  ] as const)("%s -> %s", (level, expected) => {
    expect(canUseCustomizations(level)).toBe(expected);
  });
});
