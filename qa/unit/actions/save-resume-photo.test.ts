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
    template: "classic",
    colorHex: "#000000",
    borderStyle: "squircle",
    photoShape: null,
    photoPosition: "left",
    photoSize: "medium",
    photoUrl: null,
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

describe("saveResume photo options", () => {
  it("saves a changed shape, side and size for Pro Plus", async () => {
    await saveResume({
      id: "r1",
      photoShape: "circle",
      photoPosition: "right",
      photoSize: "large",
    });

    const data = prisma.resume.update.mock.calls[0][0].data;
    expect(data.photoShape).toBe("circle");
    expect(data.photoPosition).toBe("right");
    expect(data.photoSize).toBe("large");
  });

  it.each<Partial<ResumeValues>>([
    { photoShape: "circle" },
    { photoPosition: "right" },
    { photoSize: "small" },
  ])("refuses %o for Pro and writes nothing", async (change) => {
    subscription.getUserSubscriptionLevel.mockResolvedValue("pro");

    await expect(saveResume({ id: "r1", ...change })).rejects.toThrow(
      /customizations/i,
    );
    expect(prisma.resume.update).not.toHaveBeenCalled();
  });

  it("lets a downgraded user save a resume whose photo options are unchanged", async () => {
    subscription.getUserSubscriptionLevel.mockResolvedValue("free");
    prisma.resume.findUnique.mockResolvedValue(
      stored({ photoShape: "circle", photoPosition: "right", photoSize: "large" }),
    );

    await saveResume({
      id: "r1",
      photoShape: "circle",
      photoPosition: "right",
      photoSize: "large",
      firstName: "Ada",
    });

    expect(prisma.resume.update).toHaveBeenCalledTimes(1);
  });

  it("does not count the default values as a customization for a new Free resume", async () => {
    subscription.getUserSubscriptionLevel.mockResolvedValue("free");

    await saveResume({ photoPosition: "left", photoSize: "medium" });

    expect(prisma.resume.create).toHaveBeenCalledTimes(1);
  });

  it("rejects a value that is not in the catalogue", async () => {
    // @ts-expect-error a value the type does not allow, as a hostile client could send
    await expect(saveResume({ id: "r1", photoShape: "hexagon" })).rejects.toThrow();
    expect(prisma.resume.update).not.toHaveBeenCalled();
  });
});
