import { describe, expect, it } from "vitest";
import { samplePeople, sampleResume } from "@/lib/template-samples";
import { resumeTemplates } from "@/lib/templates";
import { resumeSchema } from "@/lib/validation";

describe("template sample CVs", () => {
  it("has three fictional people with distinct ids", () => {
    expect(samplePeople).toHaveLength(3);
    expect(new Set(samplePeople.map((person) => person.id)).size).toBe(3);
  });

  describe.each(samplePeople)("$label", (person) => {
    it.each(resumeTemplates)("passes resume validation on %s", (template) => {
      const result = sampleResume(person.id, template);
      expect(resumeSchema.safeParse(result).success).toBe(true);
      expect(result.template).toBe(template);
    });

    it("uses only reserved example contact details and no photo", () => {
      const resume = sampleResume(person.id, "classic");
      expect(resume.email).toMatch(/@example\.com$/);
      expect(resume.phone).toMatch(/^(01632 960|07700 900)\d{3}$/);
      expect(resume.photo ?? null).toBeNull();
      for (const link of resume.links ?? []) {
        expect(link.url).toMatch(/^https:\/\/example\.com\//);
      }
    });

    it("fills the main sections so every template looks complete", () => {
      const resume = sampleResume(person.id, "classic");
      expect(resume.summary?.length).toBeGreaterThan(40);
      expect(resume.workExperiences?.length).toBeGreaterThanOrEqual(2);
      expect(resume.educations?.length).toBeGreaterThanOrEqual(1);
      expect(resume.skills?.length).toBeGreaterThanOrEqual(6);
    });
  });
});
