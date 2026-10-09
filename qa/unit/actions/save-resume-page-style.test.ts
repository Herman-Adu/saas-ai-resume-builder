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
    pageBackground: "plain",
    fontPair: "default",
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

describe("saveResume page style", () => {
  it("saves a chosen background and font pair for Pro Plus", async () => {
    await saveResume({ id: "r1", pageBackground: "tint", fontPair: "serif" });

    const data = prisma.resume.update.mock.calls[0][0].data;
    expect(data.pageBackground).toBe("tint");
    expect(data.fontPair).toBe("serif");
  });

  it.each<Partial<ResumeValues>>([
    { pageBackground: "pattern" },
    { fontPair: "display" },
  ])("refuses %o for Pro and writes nothing", async (change) => {
    subscription.getUserSubscriptionLevel.mockResolvedValue("pro");

    await expect(saveResume({ id: "r1", ...change })).rejects.toThrow(
      /customizations/i,
    );
    expect(prisma.resume.update).not.toHaveBeenCalled();
  });

  it("lets a downgraded user save when the page style is unchanged", async () => {
    subscription.getUserSubscriptionLevel.mockResolvedValue("free");
    prisma.resume.findUnique.mockResolvedValue(
      stored({ pageBackground: "tint", fontPair: "serif" }),
    );

    await saveResume({
      id: "r1",
      pageBackground: "tint",
      fontPair: "serif",
      firstName: "Ada",
    });

    expect(prisma.resume.update).toHaveBeenCalledTimes(1);
  });

  it("lets a free user save the default page style", async () => {
    subscription.getUserSubscriptionLevel.mockResolvedValue("free");

    await saveResume({
      id: "r1",
      pageBackground: "plain",
      fontPair: "default",
      firstName: "Ada",
    });

    expect(prisma.resume.update).toHaveBeenCalledTimes(1);
  });
});
