import { describe, expect, it } from "vitest";
import {
  defaultFontPair,
  defaultPageBackground,
  effectivePageBackground,
  fontFamilyFor,
  fontPairs,
  pageBackgroundStyle,
  pageBackgrounds,
  parseFontPair,
  parsePageBackground,
  tintOf,
} from "@/lib/page-style";
import { resumeTemplates } from "@/lib/templates";

describe("page style options", () => {
  it("offers a plain page and a plain font as the defaults", () => {
    expect(defaultPageBackground).toBe("plain");
    expect(defaultFontPair).toBe("default");
    expect(pageBackgrounds).toEqual(["plain", "tint", "sidebar", "pattern"]);
    expect(fontPairs).toEqual(["default", "display", "serif"]);
  });

  it.each([
    [undefined, "plain"],
    [null, "plain"],
    ["", "plain"],
    ["neon", "plain"],
    ["tint", "tint"],
    ["pattern", "pattern"],
  ])("reads the background %j as %s", (value, expected) => {
    expect(parsePageBackground(value)).toBe(expected);
  });

  it.each([
    [undefined, "default"],
    [null, "default"],
    ["comic", "default"],
    ["display", "display"],
    ["serif", "serif"],
  ])("reads the font pair %j as %s", (value, expected) => {
    expect(parseFontPair(value)).toBe(expected);
  });
});

describe("tintOf", () => {
  it("lightens a six digit colour with a low alpha so text stays readable", () => {
    expect(tintOf("#ff0000")).toBe("#ff000014");
    expect(tintOf("#0A84FF")).toBe("#0A84FF14");
  });

  it("falls back to a light grey for anything that is not a hex colour", () => {
    expect(tintOf(undefined)).toBe("#f3f4f6");
    expect(tintOf("red")).toBe("#f3f4f6");
    expect(tintOf("#fff")).toBe("#f3f4f6");
  });
});

describe("effectivePageBackground", () => {
  it("keeps the sidebar band only where there is a sidebar", () => {
    expect(effectivePageBackground("sidebar", "modern")).toBe("sidebar");
    expect(effectivePageBackground("sidebar", "classic")).toBe("plain");
    expect(effectivePageBackground("sidebar", "minimal")).toBe("plain");
  });

  it("keeps the ATS safe Minimal template plain for every background", () => {
    for (const background of pageBackgrounds) {
      expect(effectivePageBackground(background, "minimal")).toBe("plain");
    }
  });

  it("leaves tint and pattern alone on the other templates", () => {
    for (const template of resumeTemplates.filter((t) => t !== "minimal")) {
      expect(effectivePageBackground("tint", template)).toBe("tint");
      expect(effectivePageBackground("pattern", template)).toBe("pattern");
    }
  });
});

describe("pageBackgroundStyle", () => {
  it("adds nothing for a plain page", () => {
    expect(pageBackgroundStyle("plain", "#ff0000")).toEqual({});
  });

  it("paints the whole page with the tint", () => {
    expect(pageBackgroundStyle("tint", "#ff0000")).toMatchObject({
      backgroundColor: "#ff000014",
    });
  });

  it("paints a band behind the sidebar column", () => {
    const style = pageBackgroundStyle("sidebar", "#ff0000");
    expect(style.backgroundImage).toContain("linear-gradient");
    expect(style.backgroundImage).toContain("#ff000014");
  });

  it("draws a faint dot pattern", () => {
    const style = pageBackgroundStyle("pattern", "#ff0000");
    expect(style.backgroundImage).toContain("radial-gradient");
    expect(style.backgroundSize).toBeDefined();
  });

  it("asks the browser to print the colours", () => {
    for (const background of ["tint", "sidebar", "pattern"] as const) {
      const style = pageBackgroundStyle(background, "#ff0000");
      expect(style.printColorAdjust).toBe("exact");
      expect(style.WebkitPrintColorAdjust).toBe("exact");
    }
  });
});

describe("fontFamilyFor", () => {
  it("leaves the default font to the stylesheet", () => {
    expect(fontFamilyFor("default")).toBeUndefined();
  });

  it("uses the display face for headings and a print safe serif", () => {
    expect(fontFamilyFor("display")).toContain("--font-display-face");
    expect(fontFamilyFor("serif")).toContain("Georgia");
  });
});
