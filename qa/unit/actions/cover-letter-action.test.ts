import { beforeEach, describe, expect, it, vi } from "vitest";
import { jobPost, makeMaster } from "../support/job-tailor-fixtures";

const prisma = vi.hoisted(() => ({
  resume: { findFirst: vi.fn() },
  coverLetter: { upsert: vi.fn() },
  coverLetterRun: { count: vi.fn(), create: vi.fn() },
}));
const session = vi.hoisted(() => ({ getAuthUserId: vi.fn() }));
const subscription = vi.hoisted(() => ({ getUserSubscriptionLevel: vi.fn() }));
const openai = vi.hoisted(() => ({
  default: { chat: { completions: { parse: vi.fn() } } },
}));

vi.mock("@/lib/prisma", () => ({ default: prisma }));
vi.mock("@/lib/session", () => session);
vi.mock("@/lib/subscription", () => subscription);
vi.mock("@/lib/openai", () => openai);

import {
  generateCoverLetter,
  saveCoverLetter,
} from "@/app/(main)/resumes/coverLetterActions";

const parse = openai.default.chat.completions.parse;

function tailoredCopy(overrides: Record<string, unknown> = {}) {
  return {
    ...makeMaster(),
    id: "t1",
    isMaster: false,
    isTailored: true,
    jobId: "j1",
    job: { id: "j1", title: "Engineer", company: "Acme", postText: jobPost },
    ...overrides,
  };
}

beforeEach(() => {
  vi.resetAllMocks();
  session.getAuthUserId.mockResolvedValue("u1");
  subscription.getUserSubscriptionLevel.mockResolvedValue("pro");
  prisma.resume.findFirst.mockResolvedValue(tailoredCopy());
  prisma.coverLetterRun.count.mockResolvedValue(0);
  prisma.coverLetter.upsert.mockResolvedValue({ id: "c1" });
  parse.mockResolvedValue({
    choices: [{ message: { parsed: { paragraphs: ["I would love to join Acme."] } } }],
  });
});

describe("generateCoverLetter refusals happen before the AI call", () => {
  it("refuses a signed-out user", async () => {
    session.getAuthUserId.mockResolvedValue(null);
    expect(await generateCoverLetter("t1")).toEqual({
      ok: false,
      code: "unauthorized",
    });
    expect(parse).not.toHaveBeenCalled();
  });

  it("refuses Free without recording a run", async () => {
    subscription.getUserSubscriptionLevel.mockResolvedValue("free");
    expect(await generateCoverLetter("t1")).toEqual({
      ok: false,
      code: "upgrade_required",
    });
    expect(prisma.coverLetterRun.create).not.toHaveBeenCalled();
    expect(parse).not.toHaveBeenCalled();
  });

  it("only looks at the signed-in user's own resume", async () => {
    prisma.resume.findFirst.mockResolvedValue(null);
    expect(await generateCoverLetter("someone-elses")).toEqual({
      ok: false,
      code: "not_found",
    });
    expect(prisma.resume.findFirst.mock.calls[0][0].where).toMatchObject({
      id: "someone-elses",
      userId: "u1",
    });
    expect(parse).not.toHaveBeenCalled();
  });

  it("needs a copy that was tailored to a job", async () => {
    prisma.resume.findFirst.mockResolvedValue(
      tailoredCopy({ jobId: null, job: null }),
    );
    expect(await generateCoverLetter("t1")).toEqual({
      ok: false,
      code: "no_job",
    });
    expect(parse).not.toHaveBeenCalled();
  });

  it("stops at the daily limit", async () => {
    prisma.coverLetterRun.count.mockResolvedValue(5);
    expect(await generateCoverLetter("t1")).toEqual({
      ok: false,
      code: "daily_limit",
    });
    expect(parse).not.toHaveBeenCalled();
  });
});

describe("generateCoverLetter", () => {
  it("returns an assembled letter and saves nothing", async () => {
    const result = await generateCoverLetter("t1");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.text).toContain("Dear Hiring Manager,");
      expect(result.text).toContain("I would love to join Acme.");
      expect(result.text).toContain("Jane Doe");
    }
    expect(prisma.coverLetter.upsert).not.toHaveBeenCalled();
  });

  it("sends the job post and CV wrapped in tags", async () => {
    await generateCoverLetter("t1");
    const user = parse.mock.calls[0][0].messages[1].content as string;
    expect(user).toContain("<job>");
    expect(user).toContain("<cv>");
    expect(user).toContain("Senior Frontend Engineer");
  });

  it("counts a failed AI call toward the limit", async () => {
    parse.mockRejectedValue(new Error("boom"));
    expect(await generateCoverLetter("t1")).toEqual({
      ok: false,
      code: "ai_failed",
    });
    expect(prisma.coverLetterRun.create).toHaveBeenCalledTimes(1);
  });

  it("rejects a reply with no usable paragraphs", async () => {
    parse.mockResolvedValue({
      choices: [{ message: { parsed: { paragraphs: ["  "] } } }],
    });
    expect(await generateCoverLetter("t1")).toEqual({
      ok: false,
      code: "ai_failed",
    });
  });

  it("rejects a malformed reply", async () => {
    parse.mockResolvedValue({ choices: [{ message: { parsed: { nope: 1 } } }] });
    expect(await generateCoverLetter("t1")).toEqual({
      ok: false,
      code: "ai_failed",
    });
  });
});

describe("saveCoverLetter", () => {
  it("refuses a signed-out user and Free", async () => {
    session.getAuthUserId.mockResolvedValue(null);
    expect(await saveCoverLetter("t1", "Hello")).toEqual({
      ok: false,
      code: "unauthorized",
    });
    session.getAuthUserId.mockResolvedValue("u1");
    subscription.getUserSubscriptionLevel.mockResolvedValue("free");
    expect(await saveCoverLetter("t1", "Hello")).toEqual({
      ok: false,
      code: "upgrade_required",
    });
    expect(prisma.coverLetter.upsert).not.toHaveBeenCalled();
  });

  it("rejects an empty or oversized letter", async () => {
    expect(await saveCoverLetter("t1", "   ")).toEqual({
      ok: false,
      code: "invalid_input",
    });
    expect(await saveCoverLetter("t1", "x".repeat(7000))).toEqual({
      ok: false,
      code: "invalid_input",
    });
    expect(prisma.coverLetter.upsert).not.toHaveBeenCalled();
  });

  it("refuses a resume that is not the user's or has no job", async () => {
    prisma.resume.findFirst.mockResolvedValue(null);
    expect(await saveCoverLetter("t1", "Hello")).toEqual({
      ok: false,
      code: "not_found",
    });
    prisma.resume.findFirst.mockResolvedValue({ jobId: null });
    expect(await saveCoverLetter("t1", "Hello")).toEqual({
      ok: false,
      code: "no_job",
    });
    expect(prisma.coverLetter.upsert).not.toHaveBeenCalled();
  });

  it("stores one letter per job, owned by the user", async () => {
    prisma.resume.findFirst.mockResolvedValue({ jobId: "j1" });
    expect(await saveCoverLetter("t1", "  Hello  ")).toEqual({ ok: true });
    const call = prisma.coverLetter.upsert.mock.calls[0][0];
    expect(call.where).toEqual({ jobId: "j1" });
    expect(call.create).toMatchObject({ userId: "u1", jobId: "j1", body: "Hello" });
    expect(call.update).toEqual({ body: "Hello" });
  });
});
