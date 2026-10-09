export const resumeTemplates = [
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
  {
    id: "executive",
    label: "Executive",
    description: "Serif type and spaced capitals for senior roles.",
  },
  {
    id: "creative",
    label: "Creative",
    description: "A tinted side panel for contact, skills and links.",
  },
  {
    id: "graduate",
    label: "Graduate",
    description: "Education first, for early-career and career-change CVs.",
  },
  {
    id: "academic",
    label: "Academic",
    description: "Education and projects first, with no photo.",
  },
  {
    id: "tech",
    label: "Tech",
    description: "Skills up front, with monospaced headings.",
  },
  {
    id: "elegant",
    label: "Elegant",
    description: "A centred header and refined serif type.",
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
