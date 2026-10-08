import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeBlankPdf, makeTextPdf, sampleCvLines } from "../support/make-pdf";

const prisma = vi.hoisted(() => ({
  resume: { count: vi.fn(), create: vi.fn() },
  cvImport: { count: vi.fn(), create: vi.fn() },
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
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { importCv } from "@/app/(main)/resumes/importCvAction";
import { MAX_CV_PDF_BYTES, cvImportSystemPrompt } from "@/lib/cv-import";

const parse = openai.default.chat.completions.parse;

const marker = "ZEBRA-MARKER-7731";

const parsedCv = {
  firstName: "Jane",
  lastName: "Doe",
  jobTitle: "Engineer",
  email: null,
  phone: null,
  city: null,
  country: null,
  summary: null,
  workExperiences: [],
  educations: [],
  skills: ["React"],
  links: [],
  certifications: [],
  languages: [],
  projects: [],
};

function formWith(bytes: Uint8Array | undefined, name = "cv.pdf") {
  const form = new FormData();
  if (bytes) {
    form.set("file", new File([bytes as BlobPart], name, { type: "application/pdf" }));
  }
  return form;
}

const textPdf = () => makeTextPdf([...sampleCvLines, marker]);

beforeEach(() => {
  vi.resetAllMocks();
  session.getAuthUserId.mockResolvedValue("u1");
  subscription.getUserSubscriptionLevel.mockResolvedValue("pro");
  prisma.resume.count.mockResolvedValue(0);
  prisma.cvImport.count.mockResolvedValue(0);
  prisma.cvImport.create.mockResolvedValue({ id: "imp-1" });
  prisma.resume.create.mockResolvedValue({ id: "resume-1" });
  parse.mockResolvedValue({ choices: [{ message: { parsed: parsedCv } }] });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("importCv: who may import", () => {
  it("rejects a signed-out user before doing anything", async () => {
    session.getAuthUserId.mockResolvedValue(null);

    expect(await importCv(formWith(textPdf()))).toEqual({
      ok: false,
      code: "unauthorized",
    });
    expect(parse).not.toHaveBeenCalled();
    expect(prisma.resume.create).not.toHaveBeenCalled();
  });

  it("locks import for free users", async () => {
    subscription.getUserSubscriptionLevel.mockResolvedValue("free");

    expect(await importCv(formWith(textPdf()))).toEqual({
      ok: false,
      code: "upgrade_required",
    });
    expect(parse).not.toHaveBeenCalled();
  });
});

describe("importCv: rejects before any AI call", () => {
  it("rejects a missing file", async () => {
    expect(await importCv(formWith(undefined))).toEqual({ ok: false, code: "empty" });
    expect(parse).not.toHaveBeenCalled();
  });

  it("rejects a file that is not a PDF", async () => {
    const notPdf = new TextEncoder().encode("plain text pretending to be a CV");

    expect(await importCv(formWith(notPdf))).toEqual({ ok: false, code: "not_pdf" });
    expect(parse).not.toHaveBeenCalled();
  });

  it("rejects a file over the size cap", async () => {
    const big = new Uint8Array(MAX_CV_PDF_BYTES + 1);
    big.set(new TextEncoder().encode("%PDF-1.7\n"));

    expect(await importCv(formWith(big))).toEqual({ ok: false, code: "too_large" });
    expect(parse).not.toHaveBeenCalled();
  });

  it("stops at the base resume cap and counts only base resumes", async () => {
    prisma.resume.count.mockResolvedValue(3);

    expect(await importCv(formWith(textPdf()))).toEqual({
      ok: false,
      code: "base_limit",
    });
    expect(prisma.resume.count).toHaveBeenCalledWith({
      where: { userId: "u1", isTailored: false },
    });
    expect(parse).not.toHaveBeenCalled();
  });

  it("does not limit base resumes for pro plus", async () => {
    subscription.getUserSubscriptionLevel.mockResolvedValue("pro_plus");
    prisma.resume.count.mockResolvedValue(500);

    expect(await importCv(formWith(textPdf()))).toEqual({ ok: true, id: "resume-1" });
  });

  it("stops at ten imports in the last day for this user only", async () => {
    prisma.cvImport.count.mockResolvedValue(10);

    expect(await importCv(formWith(textPdf()))).toEqual({
      ok: false,
      code: "daily_limit",
    });
    const where = prisma.cvImport.count.mock.calls[0][0].where;
    expect(where.userId).toBe("u1");
    expect(where.createdAt.gte).toBeInstanceOf(Date);
    expect(parse).not.toHaveBeenCalled();
  });

  it("rejects a PDF it cannot read", async () => {
    const broken = new TextEncoder().encode("%PDF-1.4 this is not a real file");

    expect(await importCv(formWith(broken))).toEqual({ ok: false, code: "unreadable" });
    expect(parse).not.toHaveBeenCalled();
  });

  it("rejects a scanned PDF and does not use up one of the daily imports", async () => {
    expect(await importCv(formWith(makeBlankPdf()))).toEqual({
      ok: false,
      code: "scanned",
    });
    expect(prisma.cvImport.create).not.toHaveBeenCalled();
    expect(parse).not.toHaveBeenCalled();
  });
});

describe("importCv: the import itself", () => {
  it("creates a base resume for the signed-in user", async () => {
    expect(await importCv(formWith(textPdf()))).toEqual({ ok: true, id: "resume-1" });

    const data = prisma.resume.create.mock.calls[0][0].data;
    expect(data.userId).toBe("u1");
    expect(data.isMaster).toBe(false);
    expect(data.isTailored).toBe(false);
    expect(data.firstName).toBe("Jane");
  });

  it("sends the CV text, wrapped as data, with the safety prompt", async () => {
    await importCv(formWith(textPdf()));

    const call = parse.mock.calls[0][0];
    expect(call.model).toBe("gpt-4o-mini");
    expect(call.messages[0]).toEqual({ role: "system", content: cvImportSystemPrompt });
    expect(call.messages[1].role).toBe("user");
    expect(call.messages[1].content).toMatch(/<cv>[\s\S]*Jane Doe[\s\S]*<\/cv>/);
    expect(call.response_format).toBeDefined();
  });

  it("records the import before calling the AI so a failed call still counts", async () => {
    await importCv(formWith(textPdf()));

    const recorded = prisma.cvImport.create.mock.invocationCallOrder[0];
    const called = parse.mock.invocationCallOrder[0];
    expect(prisma.cvImport.create).toHaveBeenCalledWith({ data: { userId: "u1" } });
    expect(recorded).toBeLessThan(called);
  });

  it("fails cleanly when the AI returns nothing usable, and creates no resume", async () => {
    parse.mockResolvedValue({ choices: [{ message: { parsed: null } }] });

    expect(await importCv(formWith(textPdf()))).toEqual({ ok: false, code: "ai_failed" });
    expect(prisma.resume.create).not.toHaveBeenCalled();
    expect(prisma.cvImport.create).toHaveBeenCalled();
  });

  it("fails cleanly when the AI call throws", async () => {
    parse.mockRejectedValue(new Error("rate limited"));

    expect(await importCv(formWith(textPdf()))).toEqual({ ok: false, code: "ai_failed" });
    expect(prisma.resume.create).not.toHaveBeenCalled();
  });
});

describe("importCv: privacy", () => {
  it("never writes the CV text to the logs", async () => {
    const logs = [
      vi.spyOn(console, "log").mockImplementation(() => {}),
      vi.spyOn(console, "info").mockImplementation(() => {}),
      vi.spyOn(console, "warn").mockImplementation(() => {}),
      vi.spyOn(console, "error").mockImplementation(() => {}),
    ];

    await importCv(formWith(textPdf()));
    parse.mockRejectedValue(new Error(`provider echoed ${marker}`));
    await importCv(formWith(textPdf()));

    const printed = logs.flatMap((spy) => spy.mock.calls.flat()).join(" ");
    expect(printed).not.toContain(marker);
    expect(printed).not.toContain("Jane Doe");
  });
});
