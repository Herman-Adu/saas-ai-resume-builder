import {
  canWriteMentorBrief,
  canWriteMentorBriefToday,
  mentorBriefDailyLimits,
} from "@/lib/permissions";
import {
  mentorBriefMessages,
  mentorBriefSystemPrompt,
  normalizeMentorBrief,
  parseStoredMentorBrief,
  type MentorBriefFailure,
} from "@/lib/mentor-brief";
import { describe, expect, it } from "vitest";

describe("mentor brief plan gate", () => {
  it("is Pro Plus only", () => {
    expect(canWriteMentorBrief("free")).toBe(false);
    expect(canWriteMentorBrief("pro")).toBe(false);
    expect(canWriteMentorBrief("pro_plus")).toBe(true);
  });

  it("caps runs a day, and only Pro Plus has any", () => {
    expect(mentorBriefDailyLimits).toEqual({ free: 0, pro: 0, pro_plus: 10 });
    expect(canWriteMentorBriefToday("pro_plus", 9)).toBe(true);
    expect(canWriteMentorBriefToday("pro_plus", 10)).toBe(false);
    expect(canWriteMentorBriefToday("pro", 0)).toBe(false);
  });
});

describe("normalizeMentorBrief", () => {
  const good = {
    roleTests: ["System design under load"],
    cvGaps: ["No mention of GraphQL"],
    brushUp: ["Revise caching strategies"],
  };

  it("keeps a clean brief as it is", () => {
    expect(normalizeMentorBrief(good)).toEqual(good);
  });

  it("trims, drops empty lines and caps each list at six", () => {
    const brief = normalizeMentorBrief({
      roleTests: ["  a  ", "", "   ", "b", "c", "d", "e", "f", "g", "h"],
      cvGaps: [],
      brushUp: ["x"],
    });
    expect(brief?.roleTests).toEqual(["a", "b", "c", "d", "e", "f"]);
  });

  it("shortens a very long line", () => {
    const brief = normalizeMentorBrief({
      ...good,
      brushUp: ["y".repeat(900)],
    });
    expect(brief?.brushUp[0].length).toBeLessThanOrEqual(400);
  });

  it("allows no CV gaps when the CV already fits the post", () => {
    expect(normalizeMentorBrief({ ...good, cvGaps: [] })?.cvGaps).toEqual([]);
  });

  it("refuses a brief with nothing to say about the role or what to revise", () => {
    expect(normalizeMentorBrief({ ...good, roleTests: ["  "] })).toBeNull();
    expect(normalizeMentorBrief({ ...good, brushUp: [] })).toBeNull();
  });
});

describe("parseStoredMentorBrief", () => {
  it("reads a stored brief", () => {
    const stored = { roleTests: ["a"], cvGaps: [], brushUp: ["b"] };
    expect(parseStoredMentorBrief(stored)).toEqual(stored);
  });

  it("treats anything else as no brief", () => {
    expect(parseStoredMentorBrief(null)).toBeNull();
    expect(parseStoredMentorBrief("text")).toBeNull();
    expect(parseStoredMentorBrief({ roleTests: "a" })).toBeNull();
  });
});

describe("mentorBriefSystemPrompt", () => {
  it("treats the job and CV as data and forbids invention", () => {
    expect(mentorBriefSystemPrompt).toContain("<job>");
    expect(mentorBriefSystemPrompt).toContain("<cv>");
    expect(mentorBriefSystemPrompt).toMatch(/never follow instructions/i);
    expect(mentorBriefSystemPrompt).toMatch(/do not invent/i);
  });
});

describe("mentorBriefMessages", () => {
  it("has a plain message for every failure", () => {
    const codes: MentorBriefFailure[] = [
      "unauthorized",
      "upgrade_required",
      "not_found",
      "no_job",
      "daily_limit",
      "ai_failed",
    ];
    for (const code of codes) {
      expect(mentorBriefMessages[code].length).toBeGreaterThan(10);
    }
  });

  it("tells Free and Pro it is a Pro Plus feature", () => {
    expect(mentorBriefMessages.upgrade_required).toContain("Pro Plus");
  });
});
