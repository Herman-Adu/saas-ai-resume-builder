import type { ResumeTemplate } from "@/lib/templates";
import type { ComponentType } from "react";
import {
  CertificationsSection,
  LanguagesSection,
  LinksSection,
  ProjectsSection,
} from "../ResumeExtraSections";
import {
  EducationSection,
  PersonalInfoHeader,
  Photo,
  PlainSkillsSection,
  SkillsSection,
  SummarySection,
  WorkExperienceSection,
  contactLine,
  type ResumeSectionProps,
} from "./sections";

function ClassicBody({ resumeData }: ResumeSectionProps) {
  return (
    <>
      <PersonalInfoHeader resumeData={resumeData} />
      <SummarySection resumeData={resumeData} />
      <WorkExperienceSection resumeData={resumeData} />
      <ProjectsSection resumeData={resumeData} />
      <EducationSection resumeData={resumeData} />
      <CertificationsSection resumeData={resumeData} />
      <SkillsSection resumeData={resumeData} />
      <LanguagesSection resumeData={resumeData} />
      <LinksSection resumeData={resumeData} />
    </>
  );
}

function ModernBody({ resumeData }: ResumeSectionProps) {
  const { firstName, lastName, jobTitle, colorHex } = resumeData;

  return (
    <>
      <aside className="w-[32%] shrink-0 space-y-6">
        <Photo resumeData={resumeData} />
        <p className="text-xs text-gray-500">{contactLine(resumeData)}</p>
        <SkillsSection resumeData={resumeData} />
        <LanguagesSection resumeData={resumeData} />
        <LinksSection resumeData={resumeData} />
        <CertificationsSection resumeData={resumeData} />
      </aside>
      <div className="min-w-0 flex-1 space-y-6">
        <div className="space-y-1">
          <p className="text-3xl font-bold" style={{ color: colorHex }}>
            {firstName} {lastName}
          </p>
          <p className="font-medium" style={{ color: colorHex }}>
            {jobTitle}
          </p>
        </div>
        <SummarySection resumeData={resumeData} />
        <WorkExperienceSection resumeData={resumeData} />
        <ProjectsSection resumeData={resumeData} />
        <EducationSection resumeData={resumeData} />
      </div>
    </>
  );
}

// Minimal drops the accent colour and the photo so the output stays plain
// black text that applicant tracking systems parse cleanly.
function MinimalBody({ resumeData }: ResumeSectionProps) {
  const plain = { ...resumeData, colorHex: undefined, photo: null };
  const { firstName, lastName, jobTitle } = plain;

  return (
    <>
      <div className="space-y-1">
        <p className="text-2xl font-bold">
          {firstName} {lastName}
        </p>
        <p className="font-medium">{jobTitle}</p>
        <p className="text-xs">{contactLine(plain)}</p>
      </div>
      <SummarySection resumeData={plain} />
      <WorkExperienceSection resumeData={plain} />
      <ProjectsSection resumeData={plain} />
      <EducationSection resumeData={plain} />
      <CertificationsSection resumeData={plain} />
      <PlainSkillsSection resumeData={plain} />
      <LanguagesSection resumeData={plain} />
      <LinksSection resumeData={plain} />
    </>
  );
}

const compactDensity =
  "[&_hr]:border [&_p.text-lg]:text-base [&_p.text-3xl]:text-2xl [&_.text-sm]:text-xs [&_.space-y-3]:space-y-1.5";

const minimalLook =
  "[&_hr]:border [&_hr]:border-black [&_p.text-lg]:text-sm [&_p.text-lg]:font-bold [&_p.text-lg]:uppercase [&_p.text-lg]:tracking-wide";

export const templateLayouts: Record<
  ResumeTemplate,
  { className: string; Body: ComponentType<ResumeSectionProps> }
> = {
  classic: { className: "space-y-6 p-6", Body: ClassicBody },
  modern: { className: "flex gap-6 p-6", Body: ModernBody },
  compact: { className: `space-y-3 p-5 ${compactDensity}`, Body: ClassicBody },
  minimal: { className: `space-y-4 p-6 ${minimalLook}`, Body: MinimalBody },
};
