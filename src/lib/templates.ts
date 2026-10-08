export const resumeTemplates = [
  "classic",
  "modern",
  "compact",
  "minimal",
] as const;

export type ResumeTemplate = (typeof resumeTemplates)[number];

export const defaultTemplate: ResumeTemplate = "classic";

export const templateOptions: {
  id: ResumeTemplate;
  label: string;
  description: string;
}[] = [
  {
    id: "classic",
    label: "Classic",
    description: "Single column with coloured headings and rules.",
  },
  {
    id: "modern",
    label: "Modern",
    description: "Two columns: contact and skills beside your experience.",
  },
  {
    id: "compact",
    label: "Compact",
    description: "Smaller type and tighter spacing to fit more on one page.",
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Plain black text with no photo, built for applicant tracking systems.",
  },
];

export function isResumeTemplate(value: unknown): value is ResumeTemplate {
  return resumeTemplates.some((template) => template === value);
}

// A stored value can be one this build does not know (for example after a
// rollback), so anything unknown renders as the default.
export function parseTemplate(value: unknown): ResumeTemplate {
  return isResumeTemplate(value) ? value : defaultTemplate;
}
