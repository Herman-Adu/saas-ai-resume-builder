import { beforeEach, describe, expect, it, vi } from "vitest";

const prisma = vi.hoisted(() => ({
  resume: {
    findUnique: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));
const session = vi.hoisted(() => ({ getAuthUserId: vi.fn() }));
const subscription = vi.hoisted(() => ({ getUserSubscriptionLevel: vi.fn() }));
const blob = vi.hoisted(() => ({ del: vi.fn(), put: vi.fn() }));

vi.mock("@/lib/prisma", () => ({ default: prisma }));
vi.mock("@/lib/session", () => session);
vi.mock("@/lib/subscription", () => subscription);
vi.mock("@vercel/blob", () => blob);

import { saveResume } from "@/app/(main)/editor/actions";

function stored(template: string) {
  return {
    id: "r1",
    userId: "u1",
    template,
    colorHex: "#000000",
    borderStyle: "squircle",
    photoUrl: null,
  };
}

beforeEach(() => {
  vi.resetAllMocks();
  session.getAuthUserId.mockResolvedValue("u1");
  subscription.getUserSubscriptionLevel.mockResolvedValue("pro");
  prisma.resume.count.mockResolvedValue(0);
  prisma.resume.create.mockResolvedValue({ id: "new" });
  prisma.resume.update.mockResolvedValue({ id: "r1" });
});

describe("saveResume template gating", () => {
  it("creates a Free user's resume on Classic", async () => {
    subscription.getUserSubscriptionLevel.mockResolvedValue("free");

    await saveResume({ template: "classic" });

    expect(prisma.resume.create.mock.calls[0][0].data.template).toBe("classic");
  });

  it("refuses a new Free resume on a paid template, and writes nothing", async () => {
    subscription.getUserSubscriptionLevel.mockResolvedValue("free");

    await expect(saveResume({ template: "modern" })).rejects.toThrow(
      /template/i,
    );
    expect(prisma.resume.create).not.toHaveBeenCalled();
  });

  it("refuses a Free user switching an existing resume to a paid template", async () => {
    subscription.getUserSubscriptionLevel.mockResolvedValue("free");
    prisma.resume.findUnique.mockResolvedValue(stored("classic"));

    await expect(
      saveResume({ id: "r1", template: "compact" }),
    ).rejects.toThrow(/template/i);
    expect(prisma.resume.update).not.toHaveBeenCalled();
  });

  it("keeps a paid template after a downgrade: saving it unchanged is allowed", async () => {
    subscription.getUserSubscriptionLevel.mockResolvedValue("free");
    prisma.resume.findUnique.mockResolvedValue(stored("modern"));

    await saveResume({ id: "r1", template: "modern", firstName: "Ada" });

    expect(prisma.resume.update.mock.calls[0][0].data.template).toBe("modern");
  });

  it("lets a Free user move back to Classic", async () => {
    subscription.getUserSubscriptionLevel.mockResolvedValue("free");
    prisma.resume.findUnique.mockResolvedValue(stored("modern"));

    await saveResume({ id: "r1", template: "classic" });

    expect(prisma.resume.update.mock.calls[0][0].data.template).toBe("classic");
  });

  it("lets Pro switch to any template", async () => {
    prisma.resume.findUnique.mockResolvedValue(stored("classic"));

    await saveResume({ id: "r1", template: "minimal" });

    expect(prisma.resume.update.mock.calls[0][0].data.template).toBe("minimal");
  });

  it("does not touch the stored template when none is sent", async () => {
    prisma.resume.findUnique.mockResolvedValue(stored("modern"));

    await saveResume({ id: "r1", firstName: "Ada" });

    expect(prisma.resume.update.mock.calls[0][0].data).not.toHaveProperty(
      "template",
    );
  });

  it("rejects a template that is not in the catalogue", async () => {
    // @ts-expect-error a value the type does not allow, as a hostile client could send
    await expect(saveResume({ template: "retro" })).rejects.toThrow();
    expect(prisma.resume.create).not.toHaveBeenCalled();
  });
});
