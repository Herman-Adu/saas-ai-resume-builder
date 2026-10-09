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

describe("photo options", () => {
  function renderWith(template: ResumeTemplate, extra: Partial<ResumeValues>) {
    return renderToStaticMarkup(
      createElement(ResumePreview, {
        resumeData: { ...resume(template), ...extra },
      }),
    );
  }

  const photoTemplates = resumeTemplates.filter(
    (id) => id !== "minimal" && id !== "academic",
  );

  it("takes the photo shape from the old border style when none is chosen", () => {
    const html = renderWith("classic", { borderStyle: "circle" });
    expect(html).toContain('data-photo-shape="circle"');
    expect(html).toContain("border-radius:9999px");
  });

  it("lets the photo shape differ from the skill chip shape", () => {
    const html = renderWith("classic", {
      borderStyle: "circle",
      photoShape: "square",
    });
    expect(html).toContain('data-photo-shape="square"');
    expect(html).toContain("border-radius:0px");
  });

  it("sizes the photo from the chosen size", () => {
    expect(renderWith("classic", { photoSize: "large" })).toContain('width="132"');
    expect(renderWith("classic", { photoSize: "small" })).toContain('width="72"');
    expect(renderWith("classic", {})).toContain('width="100"');
  });

  it.each(photoTemplates)("marks the photo side on %s", (template) => {
    expect(renderWith(template, { photoPosition: "right" })).toContain(
      'data-photo-position="right"',
    );
    expect(renderWith(template, {})).toContain('data-photo-position="left"');
  });

  it("puts the header photo on the right with a reversed row", () => {
    expect(renderWith("classic", { photoPosition: "right" })).toContain(
      "flex-row-reverse",
    );
    expect(renderWith("classic", {})).not.toContain("flex-row-reverse");
  });

  it("still leaves the photo out of Minimal and Academic whatever is chosen", () => {
    for (const template of ["minimal", "academic"] as const) {
      expect(
        renderWith(template, { photoPosition: "right", photoSize: "large" }),
      ).not.toContain("<img");
    }
  });
});

describe("template differences", () => {
  it("applies the accent colour to every template except Minimal", () => {
    for (const template of resumeTemplates.filter((id) => id !== "minimal")) {
      expect(render(template), template).toContain("#ff0000");
    }
  });

  it("keeps Minimal plain: no colour and no photo", () => {
    const html = render("minimal");
    expect(html).not.toContain("#ff0000");
    expect(html).not.toContain("<img");
  });

  it("leaves the photo out of Academic as well, by convention", () => {
    expect(render("academic")).not.toContain("<img");
  });

  it("shows the photo in every other template", () => {
    const withoutPhoto = ["minimal", "academic"];
    for (const template of resumeTemplates.filter(
      (id) => !withoutPhoto.includes(id),
    )) {
      expect(render(template), template).toContain("<img");
    }
  });

  it("puts Education before Work experience for Graduate and Academic", () => {
    for (const template of ["graduate", "academic"] as const) {
      const html = render(template);
      expect(html.indexOf("Education"), template).toBeGreaterThan(-1);
      expect(html.indexOf("Education"), template).toBeLessThan(
        html.indexOf("Work experience"),
      );
    }
  });

  it("puts Skills before Work experience for Tech", () => {
    const html = render("tech");
    expect(html.indexOf("Skills")).toBeGreaterThan(-1);
    expect(html.indexOf("Skills")).toBeLessThan(html.indexOf("Work experience"));
  });

  it("keeps Classic order: Work experience before Education", () => {
    const html = render("classic");
    expect(html.indexOf("Work experience")).toBeLessThan(html.indexOf("Education"));
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

describe("skill styles", () => {
  const levels = { TypeScript: 90 };

  function renderSkills(
    template: ResumeTemplate,
    overrides: Partial<ResumeValues>,
  ) {
    return renderToStaticMarkup(
      createElement(ResumePreview, {
        resumeData: { ...resume(template), ...overrides },
      }),
    );
  }

  it("keeps the chips and no levels when nothing is chosen", () => {
    const html = renderSkills("modern", {});
    expect(html).toContain('data-skill-style="chips"');
    expect(html).not.toContain("data-skill-level");
  });

  it.each(["bars", "dots", "ring"] as const)(
    "draws %s on a template that shows charts, with the name as real text",
    (skillsStyle) => {
      const html = renderSkills("modern", { skillsStyle, skillLevels: levels });
      expect(html).toContain(`data-skill-style="${skillsStyle}"`);
      expect(html).toContain('data-skill-level="90"');
      expect(html).toContain("TypeScript");
      expect(html).toContain("90%");
    },
  );

  it("still lists a skill that has no level", () => {
    const html = renderSkills("modern", {
      skillsStyle: "bars",
      skillLevels: levels,
    });
    expect(html).toContain("SQL");
    expect(html).not.toContain('data-skill-level="undefined"');
  });

  it("falls back to chips for a chart style on a template without charts", () => {
    const html = renderSkills("classic", {
      skillsStyle: "bars",
      skillLevels: levels,
    });
    expect(html).toContain('data-skill-style="chips"');
    expect(html).not.toContain("data-skill-level");
  });

  it("renders the plain list as a list with every skill", () => {
    const html = renderSkills("classic", { skillsStyle: "list" });
    expect(html).toContain('data-skill-style="list"');
    expect(html).toContain("<li");
    expect(html).toContain("TypeScript");
    expect(html).toContain("SQL");
  });

  it.each(["minimal", "academic"] as const)(
    "leaves %s as plain text whatever style is chosen",
    (template) => {
      const html = renderSkills(template, {
        skillsStyle: "ring",
        skillLevels: levels,
      });
      expect(html).not.toContain("data-skill-style");
      expect(html).not.toContain("data-skill-level");
    },
  );

  it("hides the skills when the skills section is hidden", () => {
    const html = renderSkills("modern", {
      skillsStyle: "bars",
      skillLevels: levels,
      skills: [],
    });
    expect(html).not.toContain("data-skill-style");
  });
});
