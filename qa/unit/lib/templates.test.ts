import { describe, expect, it } from "vitest";
import { canUseTemplate } from "@/lib/permissions";
import {
  defaultTemplate,
  parseTemplate,
  resumeTemplates,
  templateOptions,
} from "@/lib/templates";
import { resumeSchema } from "@/lib/validation";

describe("template catalogue", () => {
  it("has the ten templates, Classic first and as the default", () => {
    expect(resumeTemplates).toEqual([
      "classic",
      "modern",
      "compact",
      "minimal",
      "executive",
      "creative",
      "graduate",
      "academic",
      "tech",
      "elegant",
    ]);
    expect(defaultTemplate).toBe("classic");
  });

  it("describes every template for the picker", () => {
    expect(templateOptions.map((option) => option.id)).toEqual([
      ...resumeTemplates,
    ]);
    for (const option of templateOptions) {
      expect(option.label.length).toBeGreaterThan(0);
      expect(option.description.length).toBeGreaterThan(0);
    }
  });

  it("falls back to Classic for anything it does not know", () => {
    expect(parseTemplate("modern")).toBe("modern");
    expect(parseTemplate("retro")).toBe("classic");
    expect(parseTemplate(undefined)).toBe("classic");
    expect(parseTemplate(null)).toBe("classic");
    expect(parseTemplate(3)).toBe("classic");
  });
});

describe("canUseTemplate", () => {
  it("lets every plan use Classic", () => {
    expect(canUseTemplate("free", "classic")).toBe(true);
    expect(canUseTemplate("pro", "classic")).toBe(true);
    expect(canUseTemplate("pro_plus", "classic")).toBe(true);
  });

  it("keeps every other template for Pro and Pro Plus", () => {
    for (const template of resumeTemplates.filter((id) => id !== "classic")) {
      expect(canUseTemplate("free", template)).toBe(false);
      expect(canUseTemplate("pro", template)).toBe(true);
      expect(canUseTemplate("pro_plus", template)).toBe(true);
    }
  });
});

describe("resumeSchema template", () => {
  it("accepts a known template and leaves it out when not sent", () => {
    expect(resumeSchema.parse({ template: "minimal" }).template).toBe("minimal");
    expect(resumeSchema.parse({}).template).toBeUndefined();
  });

  it("rejects an unknown template", () => {
    expect(() => resumeSchema.parse({ template: "retro" })).toThrow();
  });
});
