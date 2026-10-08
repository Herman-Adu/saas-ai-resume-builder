import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/openai", () => ({ default: {} }));
vi.mock("@/lib/subscription", () => ({ getUserSubscriptionLevel: vi.fn() }));

import ResumePreview from "@/components/ResumePreview";
import { steps } from "@/app/(main)/editor/steps";
import type { ResumeServerData } from "@/lib/types";
import { mapToResumeValues } from "@/lib/utils";
import { resumeSchema, type ResumeValues } from "@/lib/validation";

const now = new Date("2026-01-01T00:00:00.000Z");

function render(values: ResumeValues) {
  return renderToStaticMarkup(
    createElement(ResumePreview, { resumeData: values }),
  );
}

const withSections: ResumeValues = {
  firstName: "Ada",
  colorHex: "#000000",
  borderStyle: "squircle",
  links: [
    { label: "GitHub", url: "https://github.com/ada", hidden: false },
    { label: "Secret blog", url: "https://secret.example", hidden: true },
  ],
  certifications: [
    {
      name: "AWS Solutions Architect",
      issuer: "Amazon",
      issuedDate: "2024-05-10",
      url: "https://aws.example/cert",
      hidden: false,
    },
    { name: "Hidden cert", issuer: "Nobody", hidden: true },
  ],
  languages: [
    { name: "French", level: "Fluent", hidden: false },
    { name: "Klingon", level: "Basic", hidden: true },
  ],
  projects: [
    {
      name: "Analytical Engine",
      url: "https://engine.example",
      startDate: "2023-01-01",
      endDate: "2024-02-01",
      bullets: [
        { text: "Shipped the first release", hidden: false },
        { text: "Private bullet", hidden: true },
      ],
      hidden: false,
    },
    { name: "Hidden project", bullets: [], hidden: true },
  ],
};

describe("resume preview: links, certifications, languages and projects", () => {
  it("shows the visible entries of all four sections", () => {
    const html = render(withSections);

    for (const heading of ["Links", "Certifications", "Languages", "Projects"]) {
      expect(html).toContain(heading);
    }
    expect(html).toContain("GitHub");
    expect(html).toContain("https://github.com/ada");
    expect(html).toContain("AWS Solutions Architect");
    expect(html).toContain("Amazon");
    expect(html).toContain("05/2024");
    expect(html).toContain("French");
    expect(html).toContain("Fluent");
    expect(html).toContain("Analytical Engine");
    expect(html).toContain("Shipped the first release");
  });

  it("leaves out hidden entries and hidden bullets", () => {
    const html = render(withSections);

    for (const text of [
      "Secret blog",
      "Hidden cert",
      "Klingon",
      "Hidden project",
      "Private bullet",
    ]) {
      expect(html).not.toContain(text);
    }
  });

  it("leaves out a whole hidden section, heading included", () => {
    const html = render({
      ...withSections,
      hiddenSections: ["languages", "projects"],
    });

    expect(html).not.toContain("Languages");
    expect(html).not.toContain("French");
    expect(html).not.toContain("Projects");
    expect(html).not.toContain("Analytical Engine");
    expect(html).toContain("Certifications");
  });

  it("shows no heading for a section with only empty entries", () => {
    const html = render({
      firstName: "Ada",
      links: [{ label: "", url: "", hidden: false }],
      languages: [{ name: "", level: "", hidden: false }],
      certifications: [],
      projects: [],
    });

    for (const heading of ["Links", "Certifications", "Languages", "Projects"]) {
      expect(html).not.toContain(heading);
    }
  });

  it("renders a link label as plain text when it has no address", () => {
    const html = render({
      firstName: "Ada",
      links: [{ label: "Portfolio", url: "", hidden: false }],
    });

    expect(html).toContain("Portfolio");
    expect(html).not.toContain("href=\"\"");
  });
});

describe("editor steps", () => {
  it("has one step that edits the four extra sections", () => {
    const keys = steps.map((step) => step.key);

    expect(keys).toContain("more-sections");
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("loading then saving keeps the four extra sections", () => {
  it("round-trips through the editor values and the save schema", () => {
    const server = {
      id: "r1",
      userId: "u1",
      colorHex: "#000000",
      borderStyle: "squircle",
      skills: [],
      hiddenSections: ["languages"],
      workExperiences: [],
      educations: [],
      links: [
        { id: "l1", label: "GitHub", url: "https://github.com/ada", hidden: false, sortOrder: 0, resumeId: "r1", createdAt: now, updatedAt: now },
      ],
      certifications: [
        { id: "c1", name: "AWS", issuer: "Amazon", issuedDate: new Date("2024-05-10T00:00:00.000Z"), url: null, hidden: true, sortOrder: 0, resumeId: "r1", createdAt: now, updatedAt: now },
      ],
      languages: [
        { id: "g1", name: "French", level: "Fluent", hidden: false, sortOrder: 0, resumeId: "r1", createdAt: now, updatedAt: now },
      ],
      projects: [
        { id: "p1", name: "Engine", url: null, startDate: null, endDate: null, bullets: [{ text: "Built it", hidden: true }], hidden: false, sortOrder: 0, resumeId: "r1", createdAt: now, updatedAt: now },
      ],
    } as unknown as ResumeServerData;

    const saved = resumeSchema.parse(mapToResumeValues(server));

    expect(saved.links).toEqual([
      { label: "GitHub", url: "https://github.com/ada", hidden: false },
    ]);
    expect(saved.certifications?.[0]).toMatchObject({
      name: "AWS",
      issuedDate: "2024-05-10",
      hidden: true,
    });
    expect(saved.languages?.[0]).toMatchObject({ name: "French", level: "Fluent" });
    expect(saved.projects?.[0].bullets).toEqual([
      { text: "Built it", hidden: true },
    ]);
    expect(saved.hiddenSections).toEqual(["languages"]);
  });
});
