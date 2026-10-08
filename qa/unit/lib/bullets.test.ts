import { describe, expect, it } from "vitest";
import {
  bulletsToText,
  descriptionToBullets,
  parseStoredBullets,
  splitBulletLines,
  visibleBullets,
} from "@/lib/bullets";

describe("descriptionToBullets", () => {
  it.each([null, undefined, "", "   ", "\n\t "])(
    "returns no bullets for %j",
    (input) => {
      expect(descriptionToBullets(input)).toEqual([]);
    },
  );

  it("turns a description into one visible bullet", () => {
    expect(descriptionToBullets("Led a team of five")).toEqual([
      { text: "Led a team of five", hidden: false },
    ]);
  });

  it("keeps a multi-line description whole so no text is lost", () => {
    const description = "- Built the API\n- Cut load time by 40%\n- Mentored two juniors";
    const [bullet, ...rest] = descriptionToBullets(description);

    expect(rest).toHaveLength(0);
    expect(bullet.text).toBe(description);
    expect(bullet.hidden).toBe(false);
  });
});

describe("splitBulletLines", () => {
  it("splits AI output into lines and strips list markers", () => {
    const text = "- Built the API\n• Cut load time\n* Mentored juniors\n1. Shipped v2\n2) Reviewed PRs";

    expect(splitBulletLines(text)).toEqual([
      "Built the API",
      "Cut load time",
      "Mentored juniors",
      "Shipped v2",
      "Reviewed PRs",
    ]);
  });

  it("drops blank lines and returns an empty list for empty input", () => {
    expect(splitBulletLines("\n\n  \n")).toEqual([]);
    expect(splitBulletLines("")).toEqual([]);
  });

  it("does not strip hyphens inside a sentence", () => {
    expect(splitBulletLines("Reduced build-time by half")).toEqual([
      "Reduced build-time by half",
    ]);
  });
});

describe("visibleBullets", () => {
  it("leaves out hidden and blank bullets and keeps the order", () => {
    expect(
      visibleBullets([
        { text: "First", hidden: false },
        { text: "Secret", hidden: true },
        { text: "   ", hidden: false },
        { text: "Last", hidden: false },
      ]),
    ).toEqual([
      { text: "First", hidden: false },
      { text: "Last", hidden: false },
    ]);
  });

  it("copes with no bullets at all", () => {
    expect(visibleBullets(undefined)).toEqual([]);
  });
});

describe("bulletsToText", () => {
  it("joins only the visible bullets, one per line", () => {
    expect(
      bulletsToText([
        { text: "First", hidden: false },
        { text: "Secret", hidden: true },
        { text: "Last", hidden: false },
      ]),
    ).toBe("- First\n- Last");
  });
});

describe("parseStoredBullets", () => {
  it("accepts well-formed stored JSON", () => {
    expect(
      parseStoredBullets([{ text: "One", hidden: true }, { text: "Two", hidden: false }]),
    ).toEqual([
      { text: "One", hidden: true },
      { text: "Two", hidden: false },
    ]);
  });

  it("fills a missing hidden flag with false", () => {
    expect(parseStoredBullets([{ text: "One" }])).toEqual([
      { text: "One", hidden: false },
    ]);
  });

  it.each([null, undefined, "text", 5, { text: "x" }, [{ nope: 1 }], [1, 2]])(
    "returns an empty list for malformed value %j",
    (input) => {
      expect(parseStoredBullets(input)).toEqual([]);
    },
  );
});
