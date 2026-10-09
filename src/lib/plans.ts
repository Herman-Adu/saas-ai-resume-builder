import { canUseTemplate, tailoredResumeLimits } from "./permissions";
import { resumeTemplates } from "./templates";
import type { SubscriptionLevel } from "./subscription";

export interface Plan {
  id: SubscriptionLevel;
  name: string;
  blurb: string;
  resumeLimit: number;
  aiTools: boolean;
  customizations: boolean;
}

// Limits here must match src/lib/permissions.ts; qa/unit/plans.test.ts enforces it.
export const plans: readonly Plan[] = [
  {
    id: "free",
    name: "Free",
    blurb: "Build one resume and see how it feels.",
    resumeLimit: 1,
    aiTools: false,
    customizations: false,
  },
  {
    id: "pro",
    name: "Pro",
    blurb: "AI writing for the resumes you actually send.",
    resumeLimit: 3,
    aiTools: true,
    customizations: false,
  },
  {
    id: "pro_plus",
    name: "Pro Plus",
    blurb: "Unlimited resumes, styled your way.",
    resumeLimit: Infinity,
    aiTools: true,
    customizations: true,
  },
];

export function planFeatures(plan: Plan): string[] {
  const tailoredLimit = tailoredResumeLimits[plan.id];
  const resumes =
    plan.resumeLimit === 1
      ? "1 resume"
      : Number.isFinite(plan.resumeLimit)
        ? `Up to ${plan.resumeLimit} resumes`
        : "Unlimited resumes";

  return [
    resumes,
    "Live preview and autosave",
    "Print-ready PDF export",
    canUseTemplate(plan.id, "modern")
      ? `All ${resumeTemplates.length} templates, including an ATS-safe one`
      : "Classic template",
    ...(tailoredLimit > 0
      ? [
          Number.isFinite(tailoredLimit)
            ? `Tailor to each job, up to ${tailoredLimit} tailored resumes`
            : "Tailor to each job, unlimited tailored resumes",
        ]
      : []),
    ...(plan.aiTools
      ? [
          "AI-written summary and work experience",
          "Import your CV from a PDF",
          "Tailor to a pasted job post with AI suggestions you approve",
        ]
      : []),
    ...(plan.customizations ? ["Colour and border customisation"] : []),
  ];
}

export function formatPrice(amountInMinorUnits: number, currency: string) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountInMinorUnits / 100);
}
