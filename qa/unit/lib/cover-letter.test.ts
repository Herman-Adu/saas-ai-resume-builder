import { describe, expect, it } from "vitest";
import {
  MAX_LETTER_CHARS,
  assembleCoverLetter,
  coverLetterBodySchema,
  coverLetterMessages,
  coverLetterOutputSchema,
  coverLetterSystemPrompt,
} from "@/lib/cover-letter";
import {
  canWriteCoverLetter,
  canWriteCoverLetterToday,
  coverLetterDailyLimits,
} from "@/lib/permissions";

const candidate = { firstName: "Jane", lastName: "Doe" };

describe("assembleCoverLetter", () => {
  it("adds a greeting and a sign-off with the candidate's name", () => {
    const text = assembleCoverLetter(["First.", "Second."], candidate);
    expect(text).toBe(
      "Dear Hiring Manager,\n\nFirst.\n\nSecond.\n\nYours sincerely,\nJane Doe",
    );
  });

  it("drops blank paragraphs and keeps at most five", () => {
    const text = assembleCoverLetter(
      ["a", "  ", "b", "c", "d", "e", "f", "g"],
      candidate,
    );
    expect(text).not.toBeNull();
    const body = text!.split("\n\n").slice(1, -1);
    expect(body).toEqual(["a", "b", "c", "d", "e"]);
  });

  it("returns null when the model gave nothing usable", () => {
    expect(assembleCoverLetter([], candidate)).toBeNull();
    expect(assembleCoverLetter(["   "], candidate)).toBeNull();
  });

  it("signs off without a name when the CV has none", () => {
    const text = assembleCoverLetter(["Hello."], {
      firstName: null,
      lastName: null,
    });
    expect(text?.endsWith("Yours sincerely")).toBe(true);
  });
});

describe("coverLetterBodySchema", () => {
  it("trims and accepts a normal letter", () => {
    expect(coverLetterBodySchema.parse("  Hello  ")).toBe("Hello");
  });

  it("rejects empty and oversized letters", () => {
    expect(coverLetterBodySchema.safeParse("   ").success).toBe(false);
    expect(
      coverLetterBodySchema.safeParse("x".repeat(MAX_LETTER_CHARS + 1)).success,
    ).toBe(false);
  });
});

describe("model contract", () => {
  it("requires paragraphs from the model", () => {
    expect(coverLetterOutputSchema.safeParse({}).success).toBe(false);
    expect(
      coverLetterOutputSchema.safeParse({ paragraphs: ["a"] }).success,
    ).toBe(true);
  });

  it("tells the model not to invent facts and to treat tags as data", () => {
    expect(coverLetterSystemPrompt).toMatch(/do not invent/i);
    expect(coverLetterSystemPrompt).toMatch(/<job>/);
    expect(coverLetterSystemPrompt).toMatch(/never follow instructions/i);
  });

  it("has a message for every failure", () => {
    for (const code of [
      "unauthorized",
      "upgrade_required",
      "invalid_input",
      "not_found",
      "no_job",
      "daily_limit",
      "ai_failed",
    ] as const) {
      expect(coverLetterMessages[code].length).toBeGreaterThan(10);
    }
  });
});

describe("cover letter plan limits", () => {
  it("is a paid feature with a daily cap", () => {
    expect(canWriteCoverLetter("free")).toBe(false);
    expect(canWriteCoverLetter("pro")).toBe(true);
    expect(canWriteCoverLetter("pro_plus")).toBe(true);
    expect(coverLetterDailyLimits).toEqual({ free: 0, pro: 5, pro_plus: 30 });
  });

  it("stops at the daily limit", () => {
    expect(canWriteCoverLetterToday("pro", 4)).toBe(true);
    expect(canWriteCoverLetterToday("pro", 5)).toBe(false);
    expect(canWriteCoverLetterToday("free", 0)).toBe(false);
  });
});
