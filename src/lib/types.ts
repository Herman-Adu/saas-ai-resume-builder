import { Prisma } from "../../generated/client";
import { ResumeValues } from "./validation";

export interface EditorFormProps {
  resumeData: ResumeValues;
  setResumeData: (data: ResumeValues) => void;
}

const inSavedOrder = {
  orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
} satisfies { orderBy: Prisma.WorkExperienceOrderByWithRelationInput[] };

export const resumeDataInclude = {
  workExperiences: inSavedOrder,
  educations: inSavedOrder,
  links: inSavedOrder,
  certifications: inSavedOrder,
  languages: inSavedOrder,
  projects: inSavedOrder,
} satisfies Prisma.ResumeInclude;

export type ResumeServerData = Prisma.ResumeGetPayload<{
  include: typeof resumeDataInclude;
}>;
