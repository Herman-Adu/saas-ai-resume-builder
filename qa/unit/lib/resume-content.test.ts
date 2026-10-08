import { describe, expect, it } from "vitest";
import { mapToResumeValues } from "@/lib/utils";
import { resumeSchema } from "@/lib/validation";
import type { ResumeServerData } from "@/lib/types";

const now = new Date("2026-01-01T00:00:00.000Z");

function serverResume(overrides: Partial<ResumeServerData> = {}): ResumeServerData {
  return {
    id: "r1",
    userId: "u1",
    title: "My CV",
    description: null,
    photoUrl: null,
    colorHex: "#000000",
    borderStyle: "squircle",
    summary: null,
    firstName: "Ada",
    lastName: "Lovelace",
    jobTitle: null,
    city: null,
    country: null,
    phone: null,
    email: null,
    skills: [],
    isMaster: false,
    createdAt: now,
    updatedAt: now,
    workExperiences: [],
    educations: [],
    links: [],
    certifications: [],
    languages: [],
    projects: [],
    ...overrides,
  } as ResumeServerData;
}

describe("resumeSchema content sections", () => {
  it("accepts bullets, links, certifications, languages and projects", () => {
    const parsed = resumeSchema.parse({
      workExperiences: [
        {
          position: "Engineer",
          bullets: [{ text: "Built it", hidden: false }],
          hidden: false,
        },
      ],
      links: [{ label: "GitHub", url: "https://github.com/ada", hidden: false }],
      certifications: [{ name: "AWS SAA", issuer: "Amazon", hidden: false }],
      languages: [{ name: "French", level: "Fluent", hidden: false }],
      projects: [
        {
          name: "Engine",
          bullets: [{ text: "Analytical", hidden: true }],
          hidden: false,
        },
      ],
    });

    expect(parsed.workExperiences?.[0].bullets).toEqual([
      { text: "Built it", hidden: false },
    ]);
    expect(parsed.links?.[0].url).toBe("https://github.com/ada");
    expect(parsed.certifications?.[0].name).toBe("AWS SAA");
    expect(parsed.languages?.[0].level).toBe("Fluent");
    expect(parsed.projects?.[0].bullets?.[0].hidden).toBe(true);
  });

  it.each([
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "ftp://example.com/cv",
    "not a url",
  ])("rejects the unsafe link address %j", (url) => {
    const result = resumeSchema.safeParse({
      links: [{ label: "Site", url, hidden: false }],
    });

    expect(result.success).toBe(false);
  });

  it("allows a blank link row while the user is still typing", () => {
    const result = resumeSchema.safeParse({
      links: [{ label: "", url: "", hidden: false }],
    });

    expect(result.success).toBe(true);
  });

  it("rejects an unsafe project or certification address too", () => {
    expect(
      resumeSchema.safeParse({
        projects: [{ name: "P", url: "javascript:void(0)", hidden: false }],
      }).success,
    ).toBe(false);
    expect(
      resumeSchema.safeParse({
        certifications: [{ name: "C", url: "javascript:void(0)", hidden: false }],
      }).success,
    ).toBe(false);
  });
});

describe("mapToResumeValues", () => {
  it("maps stored bullets and the hidden flag onto work experience", () => {
    const values = mapToResumeValues(
      serverResume({
        workExperiences: [
          {
            id: "w1",
            position: "Engineer",
            company: "Acme",
            startDate: new Date("2020-03-01T00:00:00.000Z"),
            endDate: null,
            description: "legacy text",
            bullets: [
              { text: "Kept", hidden: false },
              { text: "Hidden one", hidden: true },
            ],
            hidden: true,
            sortOrder: 0,
            resumeId: "r1",
            createdAt: now,
            updatedAt: now,
          },
        ],
      } as Partial<ResumeServerData>),
    );

    expect(values.workExperiences?.[0].bullets).toEqual([
      { text: "Kept", hidden: false },
      { text: "Hidden one", hidden: true },
    ]);
    expect(values.workExperiences?.[0].hidden).toBe(true);
    expect(values.workExperiences?.[0].startDate).toBe("2020-03-01");
  });

  it("treats malformed stored bullets as none rather than crashing", () => {
    const values = mapToResumeValues(
      serverResume({
        workExperiences: [
          {
            id: "w1",
            position: "Engineer",
            company: null,
            startDate: null,
            endDate: null,
            description: null,
            bullets: "oops",
            hidden: false,
            sortOrder: 0,
            resumeId: "r1",
            createdAt: now,
            updatedAt: now,
          },
        ],
      } as Partial<ResumeServerData>),
    );

    expect(values.workExperiences?.[0].bullets).toEqual([]);
  });

  it("maps links, certifications, languages and projects", () => {
    const values = mapToResumeValues(
      serverResume({
        links: [
          { id: "l1", label: "GitHub", url: "https://github.com/ada", hidden: false, sortOrder: 0, resumeId: "r1", createdAt: now, updatedAt: now },
        ],
        certifications: [
          { id: "c1", name: "AWS SAA", issuer: "Amazon", issuedDate: new Date("2024-05-10T00:00:00.000Z"), url: null, hidden: false, sortOrder: 0, resumeId: "r1", createdAt: now, updatedAt: now },
        ],
        languages: [
          { id: "g1", name: "French", level: "Fluent", hidden: true, sortOrder: 0, resumeId: "r1", createdAt: now, updatedAt: now },
        ],
        projects: [
          { id: "p1", name: "Engine", url: null, startDate: null, endDate: null, bullets: [{ text: "Analytical", hidden: false }], hidden: false, sortOrder: 0, resumeId: "r1", createdAt: now, updatedAt: now },
        ],
      } as Partial<ResumeServerData>),
    );

    expect(values.links).toEqual([
      { label: "GitHub", url: "https://github.com/ada", hidden: false },
    ]);
    expect(values.certifications?.[0]).toMatchObject({
      name: "AWS SAA",
      issuer: "Amazon",
      issuedDate: "2024-05-10",
    });
    expect(values.languages?.[0]).toMatchObject({ name: "French", hidden: true });
    expect(values.projects?.[0].bullets).toEqual([
      { text: "Analytical", hidden: false },
    ]);
  });
});
