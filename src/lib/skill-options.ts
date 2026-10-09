import type { ResumeTemplate } from "./templates";

export const skillStyles = ["chips", "bars", "dots", "ring", "list"] as const;

export type SkillStyle = (typeof skillStyles)[number];

export const defaultSkillStyle: SkillStyle = "chips";

export type SkillLevels = Record<string, number>;

export function isSkillStyle(value: unknown): value is SkillStyle {
  return skillStyles.some((style) => style === value);
}

export function parseSkillStyle(value: string | null | undefined): SkillStyle {
  return isSkillStyle(value) ? value : defaultSkillStyle;
}

// Accepts a number or a numeric string from a form field. Anything that is
// not a finite number has no level, so the skill shows without a chart.
export function parseSkillLevel(value: unknown): number | undefined {
  const number =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim() !== ""
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(number)) return undefined;
  return Math.min(100, Math.max(0, Math.round(number)));
}

export function parseSkillLevels(value: unknown): SkillLevels {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([skill, level]) => {
      const parsed = parseSkillLevel(level);
      return skill !== "" && parsed !== undefined ? [[skill, parsed]] : [];
    }),
  );
}

export function pruneSkillLevels(
  levels: SkillLevels,
  skills: readonly string[],
): SkillLevels {
  return Object.fromEntries(
    Object.entries(levels).filter(([skill]) => skills.includes(skill)),
  );
}

export function sameSkillLevels(a: SkillLevels, b: SkillLevels): boolean {
  const keys = Object.keys(a);
  return (
    keys.length === Object.keys(b).length &&
    keys.every((skill) => a[skill] === b[skill])
  );
}

// Charts sit in the two-column templates, where the skills have room beside
// the experience. Single-column templates keep chips so they stay compact.
const templatesWithCharts: readonly ResumeTemplate[] = [
  "modern",
  "creative",
  "tech",
  "elegant",
];

export function templateShowsSkillCharts(template: ResumeTemplate): boolean {
  return templatesWithCharts.includes(template);
}

const chartStyles: readonly SkillStyle[] = ["bars", "dots", "ring"];

export function effectiveSkillStyle(
  style: SkillStyle,
  template: ResumeTemplate,
): SkillStyle {
  return chartStyles.includes(style) && !templateShowsSkillCharts(template)
    ? defaultSkillStyle
    : style;
}

export function dotCount(level: number): number {
  return Math.round(level / 20);
}
