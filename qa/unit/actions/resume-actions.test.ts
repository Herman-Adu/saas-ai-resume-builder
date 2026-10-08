import { beforeEach, describe, expect, it, vi } from "vitest";

const prisma = vi.hoisted(() => ({
  resume: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
  },
  $transaction: vi.fn(),
}));
const session = vi.hoisted(() => ({ getAuthUserId: vi.fn() }));
const subscription = vi.hoisted(() => ({ getUserSubscriptionLevel: vi.fn() }));
const blob = vi.hoisted(() => ({ del: vi.fn(), put: vi.fn() }));

vi.mock("@/lib/prisma", () => ({ default: prisma }));
vi.mock("@/lib/session", () => session);
vi.mock("@/lib/subscription", () => subscription);
vi.mock("@vercel/blob", () => blob);
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import {
  deleteResume,
  setMasterResume,
  tailorResume,
} from "@/app/(main)/resumes/actions";

const now = new Date("2026-01-01T00:00:00.000Z");

const master = {
  id: "master-1",
  userId: "u1",
  title: "Master CV",
  description: null,
  photoUrl: "https://blob.example/photo.png",
  colorHex: "#000000",
  borderStyle: "squircle",
  summary: null,
  firstName: "Ada",
  lastName: null,
  jobTitle: null,
  city: null,
  country: null,
  phone: null,
  email: null,
  skills: [],
  isMaster: true,
  isTailored: false,
  hiddenSections: [],
  createdAt: now,
  updatedAt: now,
  workExperiences: [],
  educations: [],
  links: [],
  certifications: [],
  languages: [],
  projects: [],
};

beforeEach(() => {
  vi.resetAllMocks();
  session.getAuthUserId.mockResolvedValue("u1");
  subscription.getUserSubscriptionLevel.mockResolvedValue("pro");
  prisma.resume.findFirst.mockResolvedValue(master);
  prisma.resume.count.mockResolvedValue(0);
  prisma.resume.create.mockResolvedValue({ id: "copy-1" });
  prisma.$transaction.mockImplementation(async (operations: unknown[]) =>
    Promise.all(operations),
  );
});

describe("tailorResume", () => {
  it("rejects a signed-out visitor before touching the database", async () => {
    session.getAuthUserId.mockResolvedValue(null);

    await expect(tailorResume("Acme")).rejects.toThrow(/not authenticated/i);
    expect(prisma.resume.findFirst).not.toHaveBeenCalled();
    expect(prisma.resume.create).not.toHaveBeenCalled();
  });

  it("only ever reads the signed-in user's own master", async () => {
    await tailorResume("Acme");

    expect(prisma.resume.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: "u1", isMaster: true }),
      }),
    );
  });

  it("explains that a master must be marked first", async () => {
    prisma.resume.findFirst.mockResolvedValue(null);

    await expect(tailorResume("Acme")).rejects.toThrow(/master/i);
    expect(prisma.resume.create).not.toHaveBeenCalled();
  });

  it("is locked for the Free plan", async () => {
    subscription.getUserSubscriptionLevel.mockResolvedValue("free");

    await expect(tailorResume("Acme")).rejects.toThrow(/subscription/i);
    expect(prisma.resume.create).not.toHaveBeenCalled();
  });

  it("stops Pro at ten tailored resumes and counts only tailored ones", async () => {
    prisma.resume.count.mockResolvedValue(10);

    await expect(tailorResume("Acme")).rejects.toThrow(/maximum/i);
    expect(prisma.resume.count).toHaveBeenCalledWith({
      where: { userId: "u1", isTailored: true },
    });
    expect(prisma.resume.create).not.toHaveBeenCalled();
  });

  it("creates a labelled copy for the signed-in user", async () => {
    const result = await tailorResume("  Acme, Designer  ");

    expect(result).toEqual({ id: "copy-1" });
    expect(prisma.resume.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "u1",
        title: "Acme, Designer",
        isTailored: true,
        isMaster: false,
      }),
    });
  });

  it("requires a label", async () => {
    await expect(tailorResume("   ")).rejects.toThrow();
    expect(prisma.resume.create).not.toHaveBeenCalled();
  });
});

describe("setMasterResume", () => {
  it("rejects a signed-out visitor", async () => {
    session.getAuthUserId.mockResolvedValue(null);

    await expect(setMasterResume("r1")).rejects.toThrow(/not authenticated/i);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("will not mark someone else's resume", async () => {
    prisma.resume.findUnique.mockResolvedValue(null);

    await expect(setMasterResume("someone-elses")).rejects.toThrow(/not found/i);
    expect(prisma.resume.findUnique).toHaveBeenCalledWith({
      where: { id: "someone-elses", userId: "u1" },
    });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("will not make a tailored copy the master", async () => {
    prisma.resume.findUnique.mockResolvedValue({ ...master, isTailored: true });

    await expect(setMasterResume("master-1")).rejects.toThrow(/tailored/i);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("moves the flag from the old master to the new one in one transaction", async () => {
    prisma.resume.findUnique.mockResolvedValue({ ...master, isMaster: false });

    await setMasterResume("master-1");

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.resume.updateMany).toHaveBeenCalledWith({
      where: { userId: "u1", isMaster: true },
      data: { isMaster: false },
    });
    expect(prisma.resume.update).toHaveBeenCalledWith({
      where: { id: "master-1", userId: "u1" },
      data: { isMaster: true },
    });
  });
});

describe("deleteResume", () => {
  it("keeps the photo while another resume still uses it", async () => {
    prisma.resume.findUnique.mockResolvedValue(master);
    prisma.resume.count.mockResolvedValue(1);

    await deleteResume("master-1");

    expect(prisma.resume.count).toHaveBeenCalledWith({
      where: {
        photoUrl: "https://blob.example/photo.png",
        id: { not: "master-1" },
      },
    });
    expect(blob.del).not.toHaveBeenCalled();
    expect(prisma.resume.delete).toHaveBeenCalledWith({
      where: { id: "master-1" },
    });
  });

  it("removes the photo once nothing else uses it", async () => {
    prisma.resume.findUnique.mockResolvedValue(master);
    prisma.resume.count.mockResolvedValue(0);

    await deleteResume("master-1");

    expect(blob.del).toHaveBeenCalledWith("https://blob.example/photo.png");
  });
});
