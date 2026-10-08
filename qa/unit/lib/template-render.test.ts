import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ResumePreview from "@/components/ResumePreview";
import { resumeTemplates, type ResumeTemplate } from "@/lib/templates";
import type { ResumeValues } from "@/lib/validation";

function resume(template: ResumeTemplate): ResumeValues {
  return {
    template,
    colorHex: "#ff0000",
    borderStyle: "squircle",
    photo: "/photo.png",
    firstName: "Ada",
    lastName: "Lovelace",
    jobTitle: "Engineer",
    email: "ada@example.com",
    summary: "Wrote the first program.",
    skills: ["TypeScript", "SQL"],
    hiddenSections: ["projects"],
    workExperiences: [
      {
        position: "Lead",
        company: "Acme",
        startDate: "2020-03-01",
        bullets: [
          { text: "Built the engine", hidden: false },
          { text: "Secret sauce", hidden: true },
        ],
      },
      {
        position: "Intern",
        company: "Hidden Co",
        bullets: [{ text: "Filed papers", hidden: false }],
        hidden: true,
      },
    ],
    educations: [{ degree: "Mathematics", school: "Cambridge" }],
    projects: [{ name: "Analytical Engine", bullets: [] }],
    languages: [{ name: "French", level: "Fluent" }],
    links: [{ label: "Portfolio", url: "https://example.com/ada" }],
    certifications: [{ name: "Chartered Engineer", issuer: "IET" }],
  };
}

function render(template: ResumeTemplate) {
  return renderToStaticMarkup(
    createElement(ResumePreview, { resumeData: resume(template) }),
  );
}

describe.each(resumeTemplates)("%s template", (template) => {
  const html = render(template);

  it("renders the content as real text", () => {
    for (const text of [
      "Ada",
      "Lovelace",
      "Wrote the first program.",
      "Work experience",
      "Lead",
      "Acme",
      "Built the engine",
      "Mathematics",
      "TypeScript",
      "French",
      "Portfolio",
      "Chartered Engineer",
    ]) {
      expect(html, `${template} should show "${text}"`).toContain(text);
    }
    expect(html).not.toContain("<canvas");
  });

  it("leaves out everything the user hid", () => {
    expect(html).not.toContain("Secret sauce");
    expect(html).not.toContain("Hidden Co");
    expect(html).not.toContain("Filed papers");
    expect(html).not.toContain("Analytical Engine");
  });
});

describe("template differences", () => {
  it("applies the accent colour to Classic, Modern and Compact", () => {
    for (const template of ["classic", "modern", "compact"] as const) {
      expect(render(template)).toContain("#ff0000");
    }
  });

  it("keeps Minimal plain: no colour and no photo", () => {
    const html = render("minimal");
    expect(html).not.toContain("#ff0000");
    expect(html).not.toContain("<img");
  });

  it("shows the photo in the other three", () => {
    for (const template of ["classic", "modern", "compact"] as const) {
      expect(render(template)).toContain("<img");
    }
  });

  it("marks the template on the page so tests and print styles can find it", () => {
    for (const template of resumeTemplates) {
      expect(render(template)).toContain(`data-template="${template}"`);
    }
  });

  it("renders an unknown or missing template as Classic", () => {
    const missing = { ...resume("classic"), template: undefined };
    const html = renderToStaticMarkup(
      createElement(ResumePreview, { resumeData: missing }),
    );
    expect(html).toContain('data-template="classic"');
  });
});
