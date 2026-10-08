"use client";

import { BorderStyles } from "@/app/(main)/editor/BorderStyleButton";
import { Badge } from "@/components/ui/badge";
import { Bullet, visibleBullets } from "@/lib/bullets";
import { ResumeValues } from "@/lib/validation";
import { formatDate } from "date-fns";
import Image from "next/image";
import { useEffect, useMemo } from "react";

export interface ResumeSectionProps {
  resumeData: ResumeValues;
}

export function Photo({ resumeData }: ResumeSectionProps) {
  const { photo, borderStyle } = resumeData;

  // Derive the source from the prop; avoid setState-in-effect
  const photoSrc = useMemo(() => {
    if (photo instanceof File) return URL.createObjectURL(photo);
    if (photo === null) return "";
    return photo;
  }, [photo]);

  // Revoke blob URLs on cleanup to avoid memory leaks
  useEffect(() => {
    const url = photoSrc;
    if (!url || !url.startsWith("blob:")) return;
    return () => URL.revokeObjectURL(url);
  }, [photoSrc]);

  if (!photoSrc) return null;

  return (
    <Image
      src={photoSrc}
      width={100}
      height={100}
      alt="Author photo"
      className="aspect-square object-cover"
      style={{
        borderRadius:
          borderStyle === BorderStyles.SQUARE
            ? "0px"
            : borderStyle === BorderStyles.CIRCLE
              ? "9999px"
              : "10%",
      }}
    />
  );
}

export function contactLine({
  city,
  country,
  phone,
  email,
}: ResumeValues): string {
  const place = [city, country].filter(Boolean).join(", ");
  const reach = [phone, email].filter(Boolean).join(" • ");
  return [place, reach].filter(Boolean).join(" • ");
}

export function PersonalInfoHeader({ resumeData }: ResumeSectionProps) {
  const { firstName, lastName, jobTitle, colorHex } = resumeData;

  return (
    <div className="flex items-center gap-6">
      <Photo resumeData={resumeData} />
      <div className="space-y-2.5">
        <div className="space-y-1">
          <p className="text-3xl font-bold" style={{ color: colorHex }}>
            {firstName} {lastName}
          </p>
          <p className="font-medium" style={{ color: colorHex }}>
            {jobTitle}
          </p>
        </div>
        <p className="text-xs text-gray-500">{contactLine(resumeData)}</p>
      </div>
    </div>
  );
}

export function SummarySection({ resumeData }: ResumeSectionProps) {
  const { summary, colorHex } = resumeData;

  if (!summary) return null;

  return (
    <>
      <hr className="border-2" style={{ borderColor: colorHex }} />
      <div className="break-inside-avoid space-y-3">
        <p className="text-lg font-semibold" style={{ color: colorHex }}>
          Professional profile
        </p>
        <div className="whitespace-pre-line text-sm">{summary}</div>
      </div>
    </>
  );
}

function BulletList({ bullets }: { bullets: Bullet[] | undefined }) {
  const shown = visibleBullets(bullets);
  if (!shown.length) return null;

  return (
    <ul className="list-disc space-y-0.5 pl-4 text-xs">
      {shown.map((bullet, index) => (
        <li key={index}>{bullet.text}</li>
      ))}
    </ul>
  );
}

export function WorkExperienceSection({ resumeData }: ResumeSectionProps) {
  const { workExperiences, colorHex } = resumeData;

  const workExperiencesNotEmpty = workExperiences?.filter(
    (exp) =>
      !exp.hidden &&
      Boolean(
        exp.position ||
          exp.company ||
          exp.startDate ||
          exp.endDate ||
          visibleBullets(exp.bullets).length,
      ),
  );

  if (!workExperiencesNotEmpty?.length) return null;

  return (
    <>
      <hr className="border-2" style={{ borderColor: colorHex }} />
      <div className="space-y-3">
        <p className="text-lg font-semibold" style={{ color: colorHex }}>
          Work experience
        </p>
        {workExperiencesNotEmpty.map((exp, index) => (
          <div key={index} className="break-inside-avoid space-y-1">
            <div
              className="flex items-center justify-between text-sm font-semibold"
              style={{ color: colorHex }}
            >
              <span>{exp.position}</span>
              {exp.startDate && (
                <span>
                  {formatDate(exp.startDate, "MM/yyyy")} -{" "}
                  {exp.endDate ? formatDate(exp.endDate, "MM/yyyy") : "Present"}
                </span>
              )}
            </div>
            <p className="text-xs font-semibold">Company: {exp.company}</p>
            <BulletList bullets={exp.bullets} />
          </div>
        ))}
      </div>
    </>
  );
}

export function EducationSection({ resumeData }: ResumeSectionProps) {
  const { educations, colorHex } = resumeData;

  const educationsNotEmpty = educations?.filter(
    (edu) =>
      !edu.hidden &&
      Boolean(edu.degree || edu.school || edu.startDate || edu.endDate),
  );

  if (!educationsNotEmpty?.length) return null;

  return (
    <>
      <hr className="border-2" style={{ borderColor: colorHex }} />
      <div className="space-y-3">
        <p className="text-lg font-semibold" style={{ color: colorHex }}>
          Education
        </p>
        {educationsNotEmpty.map((edu, index) => (
          <div key={index} className="break-inside-avoid space-y-1">
            <div
              className="flex items-center justify-between text-sm font-semibold"
              style={{ color: colorHex }}
            >
              <span>{edu.degree}</span>
              {edu.startDate && (
                <span>
                  {`${formatDate(edu.startDate, "MM/yyyy")} ${edu.endDate ? `- ${formatDate(edu.endDate, "MM/yyyy")}` : ""}`}
                </span>
              )}
            </div>
            <p className="text-xs font-semibold">{edu.school}</p>
          </div>
        ))}
      </div>
    </>
  );
}

export function SkillsSection({ resumeData }: ResumeSectionProps) {
  const { skills, colorHex, borderStyle } = resumeData;

  if (!skills?.length) return null;

  return (
    <>
      <hr className="border-2" style={{ borderColor: colorHex }} />
      <div className="break-inside-avoid space-y-3">
        <p className="text-lg font-semibold" style={{ color: colorHex }}>
          Skills
        </p>
        <div className="flex break-inside-avoid flex-wrap gap-2">
          {skills.map((skill, index) => (
            <Badge
              key={index}
              className="rounded-md bg-black text-white hover:bg-black"
              style={{
                backgroundColor: colorHex,
                borderRadius:
                  borderStyle === BorderStyles.SQUARE
                    ? "0px"
                    : borderStyle === BorderStyles.CIRCLE
                      ? "9999px"
                      : "8px",
              }}
            >
              {skill}
            </Badge>
          ))}
        </div>
      </div>
    </>
  );
}

// ATS parsers read a plain list more reliably than separate badges.
export function PlainSkillsSection({ resumeData }: ResumeSectionProps) {
  const { skills } = resumeData;

  if (!skills?.length) return null;

  return (
    <>
      <hr className="border-2" />
      <div className="break-inside-avoid space-y-3">
        <p className="text-lg font-semibold">Skills</p>
        <p className="text-sm">{skills.join(", ")}</p>
      </div>
    </>
  );
}
