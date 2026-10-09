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
  SidebarPhoto,
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
        <SidebarPhoto resumeData={resumeData} />
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

function CreativeBody({ resumeData }: ResumeSectionProps) {
  const { firstName, lastName, jobTitle, colorHex } = resumeData;

  return (
    <>
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
      <aside
        className="w-[32%] shrink-0 space-y-6 rounded-lg p-4"
        style={{ backgroundColor: colorHex ? `${colorHex}1f` : undefined }}
      >
        <SidebarPhoto resumeData={resumeData} />
        <p className="text-xs text-gray-700">{contactLine(resumeData)}</p>
        <SkillsSection resumeData={resumeData} />
        <LanguagesSection resumeData={resumeData} />
        <LinksSection resumeData={resumeData} />
        <CertificationsSection resumeData={resumeData} />
      </aside>
    </>
  );
}

function GraduateBody({ resumeData }: ResumeSectionProps) {
  return (
    <>
      <PersonalInfoHeader resumeData={resumeData} />
      <SummarySection resumeData={resumeData} />
      <EducationSection resumeData={resumeData} />
      <WorkExperienceSection resumeData={resumeData} />
      <ProjectsSection resumeData={resumeData} />
      <SkillsSection resumeData={resumeData} />
      <CertificationsSection resumeData={resumeData} />
      <LanguagesSection resumeData={resumeData} />
      <LinksSection resumeData={resumeData} />
    </>
  );
}

// Academic CVs conventionally carry no photo.
function AcademicBody({ resumeData }: ResumeSectionProps) {
  const noPhoto = { ...resumeData, photo: null };

  return (
    <>
      <PersonalInfoHeader resumeData={noPhoto} />
      <SummarySection resumeData={noPhoto} />
      <EducationSection resumeData={noPhoto} />
      <ProjectsSection resumeData={noPhoto} />
      <WorkExperienceSection resumeData={noPhoto} />
      <CertificationsSection resumeData={noPhoto} />
      <PlainSkillsSection resumeData={noPhoto} />
      <LanguagesSection resumeData={noPhoto} />
      <LinksSection resumeData={noPhoto} />
    </>
  );
}

function TechBody({ resumeData }: ResumeSectionProps) {
  return (
    <>
      <PersonalInfoHeader resumeData={resumeData} />
      <SummarySection resumeData={resumeData} />
      <SkillsSection resumeData={resumeData} />
      <WorkExperienceSection resumeData={resumeData} />
      <ProjectsSection resumeData={resumeData} />
      <EducationSection resumeData={resumeData} />
      <CertificationsSection resumeData={resumeData} />
      <LanguagesSection resumeData={resumeData} />
      <LinksSection resumeData={resumeData} />
    </>
  );
}

function ElegantBody({ resumeData }: ResumeSectionProps) {
  const { firstName, lastName, jobTitle, colorHex } = resumeData;

  return (
    <>
      <div className="flex flex-col items-center gap-2 text-center">
        <Photo resumeData={resumeData} />
        <p className="text-3xl font-semibold tracking-wide" style={{ color: colorHex }}>
          {firstName} {lastName}
        </p>
        <p className="font-medium" style={{ color: colorHex }}>
          {jobTitle}
        </p>
        <p className="text-xs text-gray-500">{contactLine(resumeData)}</p>
      </div>
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
  executive: {
    className:
      "space-y-6 p-8 font-serif [&_hr]:border [&_p.text-3xl]:uppercase [&_p.text-3xl]:tracking-widest [&_p.text-lg]:uppercase [&_p.text-lg]:tracking-wider",
    Body: ClassicBody,
  },
  creative: { className: "flex gap-6 p-6", Body: CreativeBody },
  graduate: { className: "space-y-6 p-6", Body: GraduateBody },
  academic: {
    className: "space-y-5 p-6 font-serif [&_hr]:border",
    Body: AcademicBody,
  },
  tech: {
    className:
      "space-y-5 p-6 [&_p.text-lg]:font-mono [&_p.text-lg]:text-base [&_hr]:border",
    Body: TechBody,
  },
  elegant: {
    className:
      "space-y-6 p-8 font-serif [&_hr]:border [&_p.text-lg]:text-center [&_p.text-lg]:uppercase [&_p.text-lg]:tracking-[0.2em]",
    Body: ElegantBody,
  },
};
