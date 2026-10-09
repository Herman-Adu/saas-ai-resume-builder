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
import type { ResumeValues } from "@/lib/validation";

function stored(overrides: Record<string, unknown> = {}) {
  return {
    id: "r1",
    userId: "u1",
    template: "modern",
    colorHex: "#000000",
    borderStyle: "squircle",
    photoShape: null,
    photoPosition: "left",
    photoSize: "medium",
    photoUrl: null,
    skillsStyle: "chips",
    skillLevels: {},
    ...overrides,
  };
}

beforeEach(() => {
  vi.resetAllMocks();
  session.getAuthUserId.mockResolvedValue("u1");
  subscription.getUserSubscriptionLevel.mockResolvedValue("pro_plus");
  prisma.resume.count.mockResolvedValue(0);
  prisma.resume.create.mockResolvedValue({ id: "new" });
  prisma.resume.update.mockResolvedValue({ id: "r1" });
  prisma.resume.findUnique.mockResolvedValue(stored());
});

describe("saveResume skill options", () => {
  it("saves a chosen style and levels for Pro Plus", async () => {
    await saveResume({
      id: "r1",
      skillsStyle: "bars",
      skillLevels: { TypeScript: 90 },
    });

    const data = prisma.resume.update.mock.calls[0][0].data;
    expect(data.skillsStyle).toBe("bars");
    expect(data.skillLevels).toEqual({ TypeScript: 90 });
  });

  it("stores levels only for skills that are still on the resume", async () => {
    await saveResume({
      id: "r1",
      skills: ["TypeScript"],
      skillLevels: { TypeScript: 90, Rea: 40 },
    });

    const data = prisma.resume.update.mock.calls[0][0].data;
    expect(data.skillLevels).toEqual({ TypeScript: 90 });
  });

  it.each<Partial<ResumeValues>>([
    { skillsStyle: "ring" },
    { skillLevels: { TypeScript: 90 } },
  ])("refuses %o for Pro and writes nothing", async (change) => {
    subscription.getUserSubscriptionLevel.mockResolvedValue("pro");

    await expect(saveResume({ id: "r1", ...change })).rejects.toThrow(
      /customizations/i,
    );
    expect(prisma.resume.update).not.toHaveBeenCalled();
  });

  it("lets a downgraded user save when the style and levels are unchanged", async () => {
    subscription.getUserSubscriptionLevel.mockResolvedValue("free");
    prisma.resume.findUnique.mockResolvedValue(
      stored({ skillsStyle: "bars", skillLevels: { TypeScript: 90, SQL: 60 } }),
    );

    await saveResume({
      id: "r1",
      skillsStyle: "bars",
      skillLevels: { SQL: 60, TypeScript: 90 },
      firstName: "Ada",
    });

    expect(prisma.resume.update).toHaveBeenCalledTimes(1);
  });

  it("does not count the defaults as a customization for a new Free resume", async () => {
    subscription.getUserSubscriptionLevel.mockResolvedValue("free");

    await saveResume({ skillsStyle: "chips", skillLevels: {} });

    expect(prisma.resume.create).toHaveBeenCalledTimes(1);
  });

  it("rejects a style that is not in the catalogue", async () => {
    // @ts-expect-error a value the type does not allow, as a hostile client could send
    await expect(saveResume({ id: "r1", skillsStyle: "pie" })).rejects.toThrow();
    expect(prisma.resume.update).not.toHaveBeenCalled();
  });

  it("rejects a level outside 0 to 100", async () => {
    await expect(
      saveResume({ id: "r1", skillLevels: { TypeScript: 140 } }),
    ).rejects.toThrow();
    expect(prisma.resume.update).not.toHaveBeenCalled();
  });
});
