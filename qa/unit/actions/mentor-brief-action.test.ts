import { beforeEach, describe, expect, it, vi } from "vitest";
import { jobPost, makeMaster } from "../support/job-tailor-fixtures";

const prisma = vi.hoisted(() => ({
  resume: { findFirst: vi.fn() },
  mentorBrief: { upsert: vi.fn() },
  mentorBriefRun: { count: vi.fn(), create: vi.fn() },
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

import { generateMentorBrief } from "@/app/(main)/resumes/mentorBriefActions";

const parse = openai.default.chat.completions.parse;

const modelBrief = {
  roleTests: ["Designing for scale"],
  cvGaps: ["No GraphQL on the CV"],
  brushUp: ["Revise caching"],
};

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
  subscription.getUserSubscriptionLevel.mockResolvedValue("pro_plus");
  prisma.resume.findFirst.mockResolvedValue(tailoredCopy());
  prisma.mentorBriefRun.count.mockResolvedValue(0);
  prisma.mentorBrief.upsert.mockResolvedValue({ id: "m1" });
  parse.mockResolvedValue({ choices: [{ message: { parsed: modelBrief } }] });
});

describe("generateMentorBrief refusals happen before the AI call", () => {
  it("refuses a signed-out user", async () => {
    session.getAuthUserId.mockResolvedValue(null);
    expect(await generateMentorBrief("t1")).toEqual({
      ok: false,
      code: "unauthorized",
    });
    expect(parse).not.toHaveBeenCalled();
  });

  it.each(["free", "pro"])("refuses %s without recording a run", async (level) => {
    subscription.getUserSubscriptionLevel.mockResolvedValue(level);
    expect(await generateMentorBrief("t1")).toEqual({
      ok: false,
      code: "upgrade_required",
    });
    expect(prisma.mentorBriefRun.create).not.toHaveBeenCalled();
    expect(parse).not.toHaveBeenCalled();
  });

  it("only looks at the signed-in user's own resume", async () => {
    prisma.resume.findFirst.mockResolvedValue(null);
    expect(await generateMentorBrief("someone-elses")).toEqual({
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
    expect(await generateMentorBrief("t1")).toEqual({
      ok: false,
      code: "no_job",
    });
    expect(parse).not.toHaveBeenCalled();
  });

  it("stops at the daily limit", async () => {
    prisma.mentorBriefRun.count.mockResolvedValue(10);
    expect(await generateMentorBrief("t1")).toEqual({
      ok: false,
      code: "daily_limit",
    });
    expect(prisma.mentorBriefRun.create).not.toHaveBeenCalled();
    expect(parse).not.toHaveBeenCalled();
  });
});

describe("generateMentorBrief", () => {
  it("stores the brief once per job, owned by the user, and returns it", async () => {
    expect(await generateMentorBrief("t1")).toEqual({
      ok: true,
      brief: modelBrief,
    });
    const call = prisma.mentorBrief.upsert.mock.calls[0][0];
    expect(call.where).toEqual({ jobId: "j1" });
    expect(call.create).toMatchObject({
      userId: "u1",
      jobId: "j1",
      content: modelBrief,
    });
    expect(call.update).toEqual({ content: modelBrief });
  });

  it("sends the job post and CV wrapped in tags", async () => {
    await generateMentorBrief("t1");
    const user = parse.mock.calls[0][0].messages[1].content as string;
    expect(user).toContain("<job>");
    expect(user).toContain("<cv>");
    expect(user).toContain("Senior Frontend Engineer");
  });

  it("does not write anything into the CV", async () => {
    await generateMentorBrief("t1");
    expect(Object.keys(prisma.resume)).toEqual(["findFirst"]);
  });

  it("counts a failed AI call toward the limit and stores nothing", async () => {
    parse.mockRejectedValue(new Error("boom"));
    expect(await generateMentorBrief("t1")).toEqual({
      ok: false,
      code: "ai_failed",
    });
    expect(prisma.mentorBriefRun.create).toHaveBeenCalledTimes(1);
    expect(prisma.mentorBrief.upsert).not.toHaveBeenCalled();
  });

  it("rejects a malformed reply and stores nothing", async () => {
    parse.mockResolvedValue({ choices: [{ message: { parsed: { nope: 1 } } }] });
    expect(await generateMentorBrief("t1")).toEqual({
      ok: false,
      code: "ai_failed",
    });
    expect(prisma.mentorBrief.upsert).not.toHaveBeenCalled();
  });

  it("rejects a reply with nothing to revise", async () => {
    parse.mockResolvedValue({
      choices: [
        { message: { parsed: { roleTests: ["a"], cvGaps: [], brushUp: [" "] } } },
      ],
    });
    expect(await generateMentorBrief("t1")).toEqual({
      ok: false,
      code: "ai_failed",
    });
    expect(prisma.mentorBrief.upsert).not.toHaveBeenCalled();
  });
});
