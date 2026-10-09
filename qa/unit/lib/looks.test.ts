import { describe, expect, it } from "vitest";
import {
  activeLookId,
  findLook,
  lookChanges,
  looks,
} from "@/lib/looks";
import { effectivePageBackground, fontPairs, pageBackgrounds } from "@/lib/page-style";
import { photoPositions, photoShapes, photoSizes } from "@/lib/photo-options";
import { skillStyles } from "@/lib/skill-options";
import type { ResumeValues } from "@/lib/validation";

const blank: ResumeValues = {};

describe("looks catalogue", () => {
  it("offers four named looks with a unique id, label and description", () => {
    expect(looks.map((look) => look.id)).toEqual([
      "professional",
      "creative",
      "classic",
      "bold",
    ]);
    expect(new Set(looks.map((look) => look.label)).size).toBe(looks.length);
    for (const look of looks) {
      expect(look.label.length).toBeGreaterThan(0);
      expect(look.description.length).toBeGreaterThan(0);
    }
  });

  it.each(looks.map((look) => [look.id, look] as const))(
    "%s only uses values the options allow",
    (_id, look) => {
      expect(photoShapes).toContain(look.values.photoShape);
      expect(photoPositions).toContain(look.values.photoPosition);
      expect(photoSizes).toContain(look.values.photoSize);
      expect(skillStyles).toContain(look.values.skillsStyle);
      expect(pageBackgrounds).toContain(look.values.pageBackground);
      expect(fontPairs).toContain(look.values.fontPair);
    },
  );

  it("never lets a look break the plain, photo-free Minimal template", () => {
    for (const look of looks) {
      expect(
        effectivePageBackground(look.values.pageBackground, "minimal"),
      ).toBe("plain");
    }
  });

  it("makes the first look the app default so a new resume already matches it", () => {
    expect(activeLookId(blank)).toBe("professional");
  });
});

describe("findLook", () => {
  it("finds a look by id and rejects anything else", () => {
    expect(findLook("bold")?.label).toBe("Bold");
    expect(findLook("neon")).toBeUndefined();
    expect(findLook("")).toBeUndefined();
  });
});

describe("lookChanges", () => {
  it("returns exactly the six look fields and nothing else", () => {
    const changes = lookChanges("creative");
    expect(Object.keys(changes ?? {}).sort()).toEqual([
      "fontPair",
      "pageBackground",
      "photoPosition",
      "photoShape",
      "photoSize",
      "skillsStyle",
    ]);
  });

  it("never touches the template, colour, border or skill levels", () => {
    for (const look of looks) {
      const changes = lookChanges(look.id) ?? {};
      expect(changes).not.toHaveProperty("template");
      expect(changes).not.toHaveProperty("colorHex");
      expect(changes).not.toHaveProperty("borderStyle");
      expect(changes).not.toHaveProperty("skillLevels");
    }
  });

  it("returns a copy so callers cannot change the catalogue", () => {
    const first = lookChanges("bold");
    if (first) first.photoSize = "small";
    expect(lookChanges("bold")?.photoSize).toBe(findLook("bold")?.values.photoSize);
  });

  it("returns nothing for an unknown id", () => {
    expect(lookChanges("neon")).toBeUndefined();
  });
});

describe("activeLookId", () => {
  it.each(looks.map((look) => look.id))("reports %s after it is applied", (id) => {
    expect(activeLookId({ ...blank, ...lookChanges(id) })).toBe(id);
  });

  it("reports no look once a single option is changed by hand", () => {
    const applied = { ...blank, ...lookChanges("bold") };
    const changed: ResumeValues = { ...applied, photoSize: "small" };
    if (changed.photoSize !== applied.photoSize) {
      expect(activeLookId(changed)).toBeUndefined();
    }
  });

  it("ignores the template, colour and skill levels", () => {
    const applied: ResumeValues = {
      ...blank,
      ...lookChanges("classic"),
      template: "elegant",
      colorHex: "#123456",
      skillLevels: { React: 80 },
    };
    expect(activeLookId(applied)).toBe("classic");
  });
});
