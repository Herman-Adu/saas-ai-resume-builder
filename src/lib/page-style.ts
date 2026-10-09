import type { CSSProperties } from "react";
import type { ResumeTemplate } from "./templates";

export const pageBackgrounds = ["plain", "tint", "sidebar", "pattern"] as const;
export const fontPairs = ["default", "display", "serif"] as const;

export type PageBackground = (typeof pageBackgrounds)[number];
export type FontPair = (typeof fontPairs)[number];

export const defaultPageBackground: PageBackground = "plain";
export const defaultFontPair: FontPair = "default";

export function isPageBackground(value: unknown): value is PageBackground {
  return pageBackgrounds.some((background) => background === value);
}

export function isFontPair(value: unknown): value is FontPair {
  return fontPairs.some((pair) => pair === value);
}

export function parsePageBackground(
  value: string | null | undefined,
): PageBackground {
  return isPageBackground(value) ? value : defaultPageBackground;
}

export function parseFontPair(value: string | null | undefined): FontPair {
  return isFontPair(value) ? value : defaultFontPair;
}

const fallbackTint = "#f3f4f6";

// A six digit hex colour plus a low alpha keeps dark text readable on every
// accent colour the user can pick.
export function tintOf(colorHex: string | undefined): string {
  return colorHex !== undefined && /^#[0-9a-f]{6}$/i.test(colorHex)
    ? `${colorHex}14`
    : fallbackTint;
}

const templatesWithSidebar: readonly ResumeTemplate[] = [
  "modern",
  "creative",
  "tech",
  "elegant",
];

// Minimal stays plain so it parses cleanly in applicant tracking systems.
export function effectivePageBackground(
  background: PageBackground,
  template: ResumeTemplate,
): PageBackground {
  if (template === "minimal") return defaultPageBackground;
  if (background === "sidebar" && !templatesWithSidebar.includes(template)) {
    return defaultPageBackground;
  }
  return background;
}

export function pageBackgroundStyle(
  background: PageBackground,
  colorHex: string | undefined,
): CSSProperties {
  if (background === "plain") return {};

  const tint = tintOf(colorHex);
  const printColours = {
    printColorAdjust: "exact",
    WebkitPrintColorAdjust: "exact",
  } as const;

  switch (background) {
    case "tint":
      return { backgroundColor: tint, ...printColours };
    case "sidebar":
      return {
        backgroundImage: `linear-gradient(to right, ${tint} calc(32% + 20px), transparent calc(32% + 20px))`,
        ...printColours,
      };
    case "pattern":
      return {
        backgroundImage: `radial-gradient(${tint} 1.5px, transparent 1.5px)`,
        backgroundSize: "16px 16px",
        ...printColours,
      };
  }
}

export function fontFamilyFor(pair: FontPair): string | undefined {
  switch (pair) {
    case "default":
      return undefined;
    case "display":
      return 'var(--font-display-face), Inter, sans-serif';
    case "serif":
      return 'Georgia, "Times New Roman", serif';
  }
}
