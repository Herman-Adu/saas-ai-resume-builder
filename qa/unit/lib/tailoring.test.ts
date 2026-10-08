import { describe, expect, it } from "vitest";
import {
  canCreateResume,
  canCreateTailoredResume,
  canTailor,
} from "@/lib/permissions";
import { plans, planFeatures } from "@/lib/plans";
import { buildTailoredCopy, forOutput, resumeSections } from "@/lib/tailoring";
import { mapToResumeValues } from "@/lib/utils";
import { resumeSchema, type ResumeValues } from "@/lib/validation";
import type { ResumeServerData } from "@/lib/types";

const now = new Date("2026-01-01T00:00:00.000Z");

function serverResume(
  overrides: Partial<ResumeServerData> = {},
): ResumeServerData {
  return {
    id: "master-1",
    userId: "u1",
    title: "Master CV",
    description: "Everything I have done",
    photoUrl: "https://blob.example/photo.png",
    colorHex: "#112233",
    borderStyle: "circle",
    summary: "Engineer",
    firstName: "Ada",
    lastName: "Lovelace",
    jobTitle: "Engineer",
    city: "London",
    country: "UK",
    phone: "123",
    email: "ada@example.com",
    skills: ["TypeScript", "SQL"],
    isMaster: true,
    isTailored: false,
    hiddenSections: ["projects"],
    createdAt: now,
    updatedAt: now,
    workExperiences: [
      {
        id: "w1",
        position: "Engineer",
        company: "Acme",
        startDate: new Date("2020-03-01T00:00:00.000Z"),
        endDate: null,
        description: "legacy",
        bullets: [
          { text: "Built it", hidden: false },
          { text: "Secret sauce", hidden: true },
        ],
        hidden: false,
        sortOrder: 0,
        resumeId: "master-1",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "w2",
        position: "Intern",
        company: "Initech",
        startDate: null,
        endDate: null,
        description: null,
        bullets: [{ text: "Filed TPS reports", hidden: false }],
        hidden: true,
        sortOrder: 1,
        resumeId: "master-1",
        createdAt: now,
        updatedAt: now,
      },
    ],
    educations: [
      {
        id: "e1",
        degree: "BSc",
        school: "Uni",
        startDate: null,
        endDate: null,
        hidden: false,
        sortOrder: 0,
        resumeId: "master-1",
        createdAt: now,
        updatedAt: now,
      },
    ],
    links: [
      {
        id: "l1",
        label: "GitHub",
        url: "https://github.com/ada",
        hidden: false,
        sortOrder: 0,
        resumeId: "master-1",
        createdAt: now,
        updatedAt: now,
      },
    ],
    certifications: [
      {
        id: "c1",
        name: "AWS SAA",
        issuer: "Amazon",
        issuedDate: new Date("2024-05-10T00:00:00.000Z"),
        url: null,
        hidden: true,
        sortOrder: 0,
        resumeId: "master-1",
        createdAt: now,
        updatedAt: now,
      },
    ],
    languages: [
      {
        id: "g1",
        name: "French",
        level: "Fluent",
        hidden: false,
        sortOrder: 0,
        resumeId: "master-1",
        createdAt: now,
        updatedAt: now,
      },
    ],
    projects: [
      {
        id: "p1",
        name: "Engine",
        url: null,
        startDate: null,
        endDate: null,
        bullets: [{ text: "Analytical", hidden: false }],
        hidden: false,
        sortOrder: 0,
        resumeId: "master-1",
        createdAt: now,
        updatedAt: now,
      },
    ],
    ...overrides,
  } as ResumeServerData;
}

describe("tailoring permissions", () => {
  it("locks Free out of tailoring and lets Pro and Pro Plus in", () => {
    expect(canTailor("free")).toBe(false);
    expect(canTailor("pro")).toBe(true);
    expect(canTailor("pro_plus")).toBe(true);
  });

  it("allows Pro 10 tailored resumes and Pro Plus unlimited", () => {
    expect(canCreateTailoredResume("free", 0)).toBe(false);
    expect(canCreateTailoredResume("pro", 9)).toBe(true);
    expect(canCreateTailoredResume("pro", 10)).toBe(false);
    expect(canCreateTailoredResume("pro_plus", 10_000)).toBe(true);
  });

  it("keeps the base resume cap separate from the tailored cap", () => {
    expect(canCreateResume("pro", 3)).toBe(false);
    expect(canCreateTailoredResume("pro", 3)).toBe(true);
  });

  it("advertises tailoring only on the plans that have it", () => {
    const byId = Object.fromEntries(plans.map((plan) => [plan.id, plan]));

    expect(planFeatures(byId.free).join(" ")).not.toMatch(/tailor/i);
    expect(planFeatures(byId.pro).join(" ")).toMatch(/tailor/i);
    expect(planFeatures(byId.pro_plus).join(" ")).toMatch(/tailor/i);
    expect(planFeatures(byId.pro).join(" ")).toMatch(/10/);
    expect(planFeatures(byId.pro_plus).join(" ")).toMatch(/unlimited tailored/i);
  });
});

describe("hiddenSections", () => {
  it("lists the sections a user can hide", () => {
    expect(resumeSections).toEqual([
      "summary",
      "workExperiences",
      "educations",
      "links",
      "certifications",
      "languages",
      "projects",
      "skills",
    ]);
  });

  it("is accepted by the resume schema and rejects unknown sections", () => {
    expect(
      resumeSchema.safeParse({ hiddenSections: ["skills", "projects"] }).success,
    ).toBe(true);
    expect(resumeSchema.safeParse({ hiddenSections: ["nope"] }).success).toBe(
      false,
    );
  });

  it("is mapped from the stored resume", () => {
    expect(mapToResumeValues(serverResume()).hiddenSections).toEqual([
      "projects",
    ]);
  });
});

describe("forOutput", () => {
  const values: ResumeValues = {
    summary: "Engineer",
    skills: ["TypeScript"],
    hiddenSections: ["skills"],
    workExperiences: [
      {
        position: "Engineer",
        bullets: [
          { text: "Kept", hidden: false },
          { text: "Dropped", hidden: true },
        ],
        hidden: false,
      },
      { position: "Intern", bullets: [], hidden: true },
    ],
    educations: [
      { degree: "BSc", hidden: false },
      { degree: "Old", hidden: true },
    ],
  };

  it("removes hidden sections, entries and bullets", () => {
    const out = forOutput(values);

    expect(out.skills).toEqual([]);
    expect(out.workExperiences).toHaveLength(1);
    expect(out.workExperiences?.[0].bullets).toEqual([
      { text: "Kept", hidden: false },
    ]);
    expect(out.educations).toEqual([{ degree: "BSc", hidden: false }]);
    expect(out.summary).toBe("Engineer");
  });

  it("drops a whole section when it is hidden", () => {
    const out = forOutput({
      ...values,
      hiddenSections: ["summary", "workExperiences"],
    });

    expect(out.summary).toBeUndefined();
    expect(out.workExperiences).toEqual([]);
  });

  it("never mutates what the editor holds", () => {
    const snapshot = structuredClone(values);

    forOutput(values);

    expect(values).toEqual(snapshot);
  });
});

describe("buildTailoredCopy", () => {
  it("creates an independent, labelled, non-master copy owned by the same user", () => {
    const copy = buildTailoredCopy(serverResume(), "Acme, Product Designer");

    expect(copy).toMatchObject({
      userId: "u1",
      title: "Acme, Product Designer",
      isTailored: true,
      isMaster: false,
      firstName: "Ada",
      colorHex: "#112233",
      borderStyle: "circle",
      photoUrl: "https://blob.example/photo.png",
      summary: "Engineer",
      hiddenSections: ["projects"],
    });
    expect(copy).not.toHaveProperty("id");
    expect(copy).not.toHaveProperty("createdAt");
    expect(copy).not.toHaveProperty("updatedAt");
  });

  it("copies every section with bullets, hidden state and order", () => {
    const copy = buildTailoredCopy(serverResume(), "Label");
    const work = copy.workExperiences?.create as Array<Record<string, unknown>>;

    expect(work).toHaveLength(2);
    expect(work[0]).toMatchObject({
      position: "Engineer",
      company: "Acme",
      hidden: false,
      sortOrder: 0,
      bullets: [
        { text: "Built it", hidden: false },
        { text: "Secret sauce", hidden: true },
      ],
    });
    expect(work[1]).toMatchObject({ position: "Intern", hidden: true, sortOrder: 1 });
    expect(work[0]).not.toHaveProperty("id");
    expect(work[0]).not.toHaveProperty("resumeId");
    expect(copy.educations?.create).toHaveLength(1);
    expect(copy.links?.create).toHaveLength(1);
    expect(copy.certifications?.create).toMatchObject([{ hidden: true }]);
    expect(copy.languages?.create).toHaveLength(1);
    expect(copy.projects?.create).toHaveLength(1);
  });

  it("does not share mutable arrays with the master", () => {
    const source = serverResume();
    const copy = buildTailoredCopy(source, "Label");

    expect(copy.skills).toEqual(["TypeScript", "SQL"]);
    expect(copy.skills).not.toBe(source.skills);
  });
});
