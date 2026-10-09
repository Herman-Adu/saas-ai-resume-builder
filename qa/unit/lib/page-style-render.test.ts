import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ResumePreview from "@/components/ResumePreview";
import type { ResumeTemplate } from "@/lib/templates";
import type { ResumeValues } from "@/lib/validation";

function renderWith(
  template: ResumeTemplate,
  overrides: Partial<ResumeValues> = {},
) {
  return renderToStaticMarkup(
    createElement(ResumePreview, {
      resumeData: {
        template,
        colorHex: "#ff0000",
        borderStyle: "squircle",
        firstName: "Ada",
        lastName: "Lovelace",
        jobTitle: "Engineer",
        skills: ["TypeScript"],
        ...overrides,
      },
    }),
  );
}

describe("page background", () => {
  it("looks exactly as before when nothing is chosen", () => {
    const html = renderWith("modern");
    expect(html).toContain('data-page-background="plain"');
    expect(html).toContain('data-font-pair="default"');
    const pageTag = html.match(/<div[^>]*id="resumePreviewContent"[^>]*>/)?.[0];
    expect(pageTag).toBeDefined();
    const style = pageTag?.match(/style="([^"]*)"/)?.[1] ?? "";
    expect(style).not.toContain("background");
    expect(style).not.toContain("font-family");
    expect(style).not.toContain("print-color-adjust");
  });

  it("paints a tint behind the page and asks the browser to print it", () => {
    const html = renderWith("classic", { pageBackground: "tint" });
    expect(html).toContain('data-page-background="tint"');
    expect(html).toContain("background-color:#ff000014");
    expect(html).toContain("print-color-adjust:exact");
  });

  it("paints a sidebar band on a two column template", () => {
    const html = renderWith("modern", { pageBackground: "sidebar" });
    expect(html).toContain('data-page-background="sidebar"');
    expect(html).toContain("linear-gradient");
  });

  it("falls back to a plain page when the template has no sidebar", () => {
    const html = renderWith("classic", { pageBackground: "sidebar" });
    expect(html).toContain('data-page-background="plain"');
    expect(html).not.toContain("linear-gradient");
  });

  it("draws the dot pattern", () => {
    const html = renderWith("creative", { pageBackground: "pattern" });
    expect(html).toContain('data-page-background="pattern"');
    expect(html).toContain("radial-gradient");
  });

  it("keeps the ATS safe Minimal template plain", () => {
    const html = renderWith("minimal", { pageBackground: "tint" });
    expect(html).toContain('data-page-background="plain"');
    expect(html).not.toContain("background-color");
  });

  it("does not stretch to a full page when printing, so no blank page follows", () => {
    const html = renderWith("classic", { pageBackground: "tint" });
    expect(html).toContain("print:min-h-0");
  });

  it("treats an unknown saved value as plain", () => {
    const html = renderWith("classic", {
      pageBackground: "neon" as ResumeValues["pageBackground"],
    });
    expect(html).toContain('data-page-background="plain"');
  });
});

describe("font pair", () => {
  it("sets the serif stack on the page", () => {
    const html = renderWith("classic", { fontPair: "serif" });
    expect(html).toContain('data-font-pair="serif"');
    expect(html).toContain("Georgia");
  });

  it("sets the display face", () => {
    const html = renderWith("modern", { fontPair: "display" });
    expect(html).toContain('data-font-pair="display"');
    expect(html).toContain("--font-display-face");
  });

  it("keeps the content as real text", () => {
    const html = renderWith("modern", { fontPair: "display", pageBackground: "tint" });
    expect(html).toContain("Ada");
    expect(html).toContain("TypeScript");
  });
});
