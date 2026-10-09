import { describe, expect, it } from "vitest";
import {
  defaultSkillStyle,
  dotCount,
  effectiveSkillStyle,
  parseSkillLevel,
  parseSkillLevels,
  parseSkillStyle,
  pruneSkillLevels,
  sameSkillLevels,
  skillStyles,
  templateShowsSkillCharts,
} from "@/lib/skill-options";
import { resumeTemplates } from "@/lib/templates";

describe("parseSkillStyle", () => {
  it.each(skillStyles)("keeps the valid style %s", (style) => {
    expect(parseSkillStyle(style)).toBe(style);
  });

  it.each([undefined, null, "", "pie", "BARS"])(
    "falls back to chips for %s",
    (value) => {
      expect(parseSkillStyle(value)).toBe(defaultSkillStyle);
      expect(defaultSkillStyle).toBe("chips");
    },
  );
});

describe("parseSkillLevel", () => {
  it.each([
    [85, 85],
    [85.6, 86],
    [0, 0],
    [100, 100],
    [-5, 0],
    [140, 100],
    ["70", 70],
    [" 40 ", 40],
  ])("turns %s into %s", (input, expected) => {
    expect(parseSkillLevel(input)).toBe(expected);
  });

  it.each([undefined, null, "", "abc", Number.NaN, Infinity, {}, []])(
    "has no level for %s",
    (input) => {
      expect(parseSkillLevel(input)).toBeUndefined();
    },
  );
});

describe("parseSkillLevels", () => {
  it("reads a stored object and clamps each level", () => {
    expect(parseSkillLevels({ TypeScript: 90, SQL: 150, Go: -3 })).toEqual({
      TypeScript: 90,
      SQL: 100,
      Go: 0,
    });
  });

  it("drops entries that are not a usable number", () => {
    expect(parseSkillLevels({ A: "x", B: null, C: 40, "": 50 })).toEqual({
      C: 40,
    });
  });

  it.each([null, undefined, "x", 5, ["a"]])(
    "gives an empty map for %s",
    (value) => {
      expect(parseSkillLevels(value)).toEqual({});
    },
  );
});

describe("pruneSkillLevels", () => {
  it("drops the level of a skill that was removed", () => {
    expect(
      pruneSkillLevels({ TypeScript: 90, SQL: 60 }, ["TypeScript"]),
    ).toEqual({ TypeScript: 90 });
  });

  it("does not change the input", () => {
    const levels = { TypeScript: 90, SQL: 60 };
    pruneSkillLevels(levels, ["SQL"]);
    expect(levels).toEqual({ TypeScript: 90, SQL: 60 });
  });
});

describe("sameSkillLevels", () => {
  it("ignores key order", () => {
    expect(sameSkillLevels({ A: 1, B: 2 }, { B: 2, A: 1 })).toBe(true);
  });

  it("sees a different level or a different set of skills", () => {
    expect(sameSkillLevels({ A: 1 }, { A: 2 })).toBe(false);
    expect(sameSkillLevels({ A: 1 }, { A: 1, B: 2 })).toBe(false);
  });

  it("treats two empty maps as the same", () => {
    expect(sameSkillLevels({}, {})).toBe(true);
  });
});

describe("charts per template", () => {
  const withCharts = ["modern", "creative", "tech", "elegant"];

  it.each(resumeTemplates)("%s knows whether it shows charts", (template) => {
    expect(templateShowsSkillCharts(template)).toBe(
      withCharts.includes(template),
    );
  });

  it("uses a chart style on a template that shows charts", () => {
    expect(effectiveSkillStyle("bars", "modern")).toBe("bars");
    expect(effectiveSkillStyle("ring", "tech")).toBe("ring");
    expect(effectiveSkillStyle("dots", "elegant")).toBe("dots");
  });

  it("falls back to chips for a chart style on any other template", () => {
    expect(effectiveSkillStyle("bars", "classic")).toBe("chips");
    expect(effectiveSkillStyle("ring", "executive")).toBe("chips");
  });

  it("keeps chips and the plain list on every template", () => {
    for (const template of resumeTemplates) {
      expect(effectiveSkillStyle("chips", template)).toBe("chips");
      expect(effectiveSkillStyle("list", template)).toBe("list");
    }
  });
});

describe("dotCount", () => {
  it.each([
    [0, 0],
    [20, 1],
    [50, 3],
    [90, 5],
    [100, 5],
  ])("shows %s%% as %s of 5 dots", (level, dots) => {
    expect(dotCount(level)).toBe(dots);
  });
});
