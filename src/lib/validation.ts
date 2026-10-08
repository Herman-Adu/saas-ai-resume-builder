import { z } from "zod";
import { bulletSchema } from "./bullets";
import { resumeTemplates } from "./templates";

export const optionalString = z.string().trim().optional().or(z.literal(""));

function isHttpUrl(value: string) {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

// Only http(s) addresses are accepted so a saved link can never be a script URL.
export const optionalHttpUrl = z
  .string()
  .trim()
  .refine(isHttpUrl, "Must be a valid http(s) link")
  .optional()
  .or(z.literal(""));

const hiddenFlag = z.boolean().optional();

export const hideableSections = [
  "summary",
  "workExperiences",
  "educations",
  "links",
  "certifications",
  "languages",
  "projects",
  "skills",
] as const;

export type HideableSection = (typeof hideableSections)[number];

export const generalInfoSchema = z.object({
  title: optionalString,
  description: optionalString,
});

export type GeneralInfoValues = z.infer<typeof generalInfoSchema>;

export const personalInfoSchema = z.object({
  photo: z
    .custom<File | undefined>()
    .optional()
    .refine(
      (file) =>
        !file || (file instanceof File && file.type.startsWith("image/")),
      "Must be an image file",
    )
    .refine(
      (file) => !file || file.size <= 1024 * 1024 * 4,
      "File must be less then 4MB",
    ),
  firstName: optionalString,
  lastName: optionalString,
  jobTitle: optionalString,
  city: optionalString,
  country: optionalString,
  phone: optionalString,
  email: optionalString,
});

export type PersonalInfoValues = z.infer<typeof personalInfoSchema>;

export const workExperienceSchema = z.object({
  workExperiences: z
    .array(
      z.object({
        position: optionalString,
        company: optionalString,
        startDate: optionalString,
        endDate: optionalString,
        bullets: z.array(bulletSchema).optional(),
        hidden: hiddenFlag,
      }),
    )
    .optional(),
});

export type WorkExperienceValues = z.input<typeof workExperienceSchema>;

export type WorkExperience = NonNullable<
  z.input<typeof workExperienceSchema>["workExperiences"]
>[number];

export const educationSchema = z.object({
  educations: z
    .array(
      z.object({
        degree: optionalString,
        school: optionalString,
        startDate: optionalString,
        endDate: optionalString,
        hidden: hiddenFlag,
      }),
    )
    .optional(),
});

export type EducationValues = z.infer<typeof educationSchema>;

export const linksSchema = z.object({
  links: z
    .array(
      z.object({
        label: optionalString,
        url: optionalHttpUrl,
        hidden: hiddenFlag,
      }),
    )
    .optional(),
});

export type LinksValues = z.infer<typeof linksSchema>;

export const certificationsSchema = z.object({
  certifications: z
    .array(
      z.object({
        name: optionalString,
        issuer: optionalString,
        issuedDate: optionalString,
        url: optionalHttpUrl,
        hidden: hiddenFlag,
      }),
    )
    .optional(),
});

export type CertificationsValues = z.infer<typeof certificationsSchema>;

export const languagesSchema = z.object({
  languages: z
    .array(
      z.object({
        name: optionalString,
        level: optionalString,
        hidden: hiddenFlag,
      }),
    )
    .optional(),
});

export type LanguagesValues = z.infer<typeof languagesSchema>;

export const projectsSchema = z.object({
  projects: z
    .array(
      z.object({
        name: optionalString,
        url: optionalHttpUrl,
        startDate: optionalString,
        endDate: optionalString,
        bullets: z.array(bulletSchema).optional(),
        hidden: hiddenFlag,
      }),
    )
    .optional(),
});

export type ProjectsValues = z.infer<typeof projectsSchema>;

export const skillsSchema = z.object({
  skills: z.array(z.string().trim()).optional(),
});

export type SkillsValues = z.infer<typeof skillsSchema>;

export const summarySchema = z.object({
  summary: optionalString,
});

export type SummaryValues = z.infer<typeof summarySchema>;

export const resumeSchema = z.object({
  ...generalInfoSchema.shape,
  ...personalInfoSchema.shape,
  ...workExperienceSchema.shape,
  ...educationSchema.shape,
  ...linksSchema.shape,
  ...certificationsSchema.shape,
  ...languagesSchema.shape,
  ...projectsSchema.shape,
  ...skillsSchema.shape,
  ...summarySchema.shape,
  colorHex: optionalString,
  borderStyle: optionalString,
  template: z.enum(resumeTemplates).optional(),
  hiddenSections: z.array(z.enum(hideableSections)).optional(),
});

export type ResumeValues = Omit<z.infer<typeof resumeSchema>, "photo"> & {
  id?: string;
  photo?: File | string | null;
};

export const generateWorkExperienceSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Required")
    .min(20, "Must be at least 20 characters"),
});

export type GenerateWorkExperienceInput = z.infer<
  typeof generateWorkExperienceSchema
>;

export const generateSummarySchema = z.object({
  jobTitle: optionalString,
  ...workExperienceSchema.shape,
  ...educationSchema.shape,
  ...skillsSchema.shape,
});

export type GenerateSummaryInput = z.infer<typeof generateSummarySchema>;
