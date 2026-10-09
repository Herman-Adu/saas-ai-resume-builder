"use client";

import { BorderStyles } from "@/app/(main)/editor/BorderStyleButton";
import { Badge } from "@/components/ui/badge";
import { Bullet, visibleBullets } from "@/lib/bullets";
import {
  parsePhotoPosition,
  parsePhotoShape,
  parsePhotoSize,
  photoPixels,
  photoRadius,
} from "@/lib/photo-options";
import {
  dotCount,
  effectiveSkillStyle,
  parseSkillLevels,
  parseSkillStyle,
  type SkillLevels,
} from "@/lib/skill-options";
import { defaultTemplate } from "@/lib/templates";
import { ResumeValues } from "@/lib/validation";
import { formatDate } from "date-fns";
import Image from "next/image";
import { useEffect, useMemo } from "react";

export interface ResumeSectionProps {
  resumeData: ResumeValues;
}

export function Photo({ resumeData }: ResumeSectionProps) {
  const { photo, borderStyle } = resumeData;
  const shape = parsePhotoShape(resumeData.photoShape, borderStyle);
  const position = parsePhotoPosition(resumeData.photoPosition);
  const pixels = photoPixels(parsePhotoSize(resumeData.photoSize));

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
      width={pixels}
      height={pixels}
      alt="Author photo"
      data-photo-shape={shape}
      data-photo-position={position}
      className="aspect-square max-w-full object-cover"
      style={{ borderRadius: photoRadius(shape) }}
    />
  );
}

// Sidebar templates stack the photo above the contact line, so the chosen
// side aligns it inside the column instead of reordering the layout.
export function SidebarPhoto({ resumeData }: ResumeSectionProps) {
  const position = parsePhotoPosition(resumeData.photoPosition);

  return (
    <div className={position === "right" ? "flex justify-end" : "flex"}>
      <Photo resumeData={resumeData} />
    </div>
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
  const onRight = parsePhotoPosition(resumeData.photoPosition) === "right";

  return (
    <div
      className={
        onRight
          ? "flex flex-row-reverse items-center justify-between gap-6"
          : "flex items-center gap-6"
      }
    >
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

const exactColors = {
  printColorAdjust: "exact",
  WebkitPrintColorAdjust: "exact",
} as const;

function skillRadius(borderStyle: string | undefined) {
  return borderStyle === BorderStyles.SQUARE
    ? "0px"
    : borderStyle === BorderStyles.CIRCLE
      ? "9999px"
      : "8px";
}

function SkillChips({
  skills,
  resumeData,
}: ResumeSectionProps & { skills: string[] }) {
  const { colorHex, borderStyle } = resumeData;

  return (
    <div className="flex break-inside-avoid flex-wrap gap-2">
      {skills.map((skill, index) => (
        <Badge
          key={index}
          className="rounded-md bg-black text-white hover:bg-black"
          style={{
            backgroundColor: colorHex,
            borderRadius: skillRadius(borderStyle),
          }}
        >
          {skill}
        </Badge>
      ))}
    </div>
  );
}

function SkillBars({
  skills,
  levels,
  resumeData,
}: ResumeSectionProps & { skills: string[]; levels: SkillLevels }) {
  const { colorHex, borderStyle } = resumeData;
  const radius = skillRadius(borderStyle);

  return (
    <ul className="space-y-2">
      {skills.map((skill, index) => (
        <li
          key={index}
          data-skill-level={levels[skill]}
          className="break-inside-avoid space-y-1"
        >
          <div className="flex items-baseline justify-between text-xs">
            <span className="font-semibold">{skill}</span>
            <span className="text-gray-500">{`${levels[skill]}%`}</span>
          </div>
          <div
            role="meter"
            aria-label={skill}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={levels[skill]}
            className="h-1.5 w-full overflow-hidden bg-gray-200"
            style={{ borderRadius: radius, ...exactColors }}
          >
            <div
              className="h-full"
              style={{
                width: `${levels[skill]}%`,
                backgroundColor: colorHex,
                borderRadius: radius,
                ...exactColors,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

const dotSlots = [0, 1, 2, 3, 4];

function SkillDots({
  skills,
  levels,
  resumeData,
}: ResumeSectionProps & { skills: string[]; levels: SkillLevels }) {
  const { colorHex, borderStyle } = resumeData;
  const radius = borderStyle === BorderStyles.SQUARE ? "0px" : "9999px";

  return (
    <ul className="space-y-1.5">
      {skills.map((skill, index) => (
        <li
          key={index}
          data-skill-level={levels[skill]}
          className="flex break-inside-avoid items-center justify-between gap-2 text-xs"
        >
          <span className="font-semibold">{skill}</span>
          <span
            role="meter"
            aria-label={`${skill} ${levels[skill]}%`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={levels[skill]}
            className="flex shrink-0 gap-1"
          >
            {dotSlots.map((slot) => (
              <span
                key={slot}
                className="h-2 w-2 bg-gray-200"
                style={{
                  borderRadius: radius,
                  ...(slot < dotCount(levels[skill])
                    ? { backgroundColor: colorHex }
                    : {}),
                  ...exactColors,
                }}
              />
            ))}
          </span>
        </li>
      ))}
    </ul>
  );
}

// A circle of circumference 100 lets the stroke length equal the percentage.
const ringRadius = 15.9155;

function SkillRings({
  skills,
  levels,
  resumeData,
}: ResumeSectionProps & { skills: string[]; levels: SkillLevels }) {
  const { colorHex, borderStyle } = resumeData;
  const linecap = borderStyle === BorderStyles.SQUARE ? "butt" : "round";

  return (
    <ul className="flex flex-wrap gap-3">
      {skills.map((skill, index) => (
        <li
          key={index}
          data-skill-level={levels[skill]}
          role="meter"
          aria-label={skill}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={levels[skill]}
          className="flex w-16 break-inside-avoid flex-col items-center gap-1 text-center"
        >
          <svg
            viewBox="0 0 36 36"
            className="h-11 w-11 -rotate-90"
            aria-hidden="true"
            style={exactColors}
          >
            <circle
              cx="18"
              cy="18"
              r={ringRadius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="3.5"
            />
            <circle
              cx="18"
              cy="18"
              r={ringRadius}
              fill="none"
              stroke={colorHex}
              strokeWidth="3.5"
              strokeLinecap={linecap}
              strokeDasharray={`${levels[skill]} 100`}
            />
            <text
              x="18"
              y="18"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="9"
              fontWeight="600"
              fill="currentColor"
              className="rotate-90 origin-center"
            >
              {`${levels[skill]}%`}
            </text>
          </svg>
          <span className="text-xs font-semibold leading-tight">{skill}</span>
        </li>
      ))}
    </ul>
  );
}

export function SkillsSection({ resumeData }: ResumeSectionProps) {
  const { skills, colorHex } = resumeData;

  if (!skills?.length) return null;

  const style = effectiveSkillStyle(
    parseSkillStyle(resumeData.skillsStyle),
    resumeData.template ?? defaultTemplate,
  );
  const levels = parseSkillLevels(resumeData.skillLevels);
  const withLevel = skills.filter((skill) => levels[skill] !== undefined);
  const withoutLevel = skills.filter((skill) => levels[skill] === undefined);
  const isChart = style === "bars" || style === "dots" || style === "ring";
  const shown = isChart && withLevel.length > 0 ? style : style === "list" ? "list" : "chips";

  return (
    <>
      <hr className="border-2" style={{ borderColor: colorHex }} />
      <div
        data-skill-style={shown}
        className="break-inside-avoid space-y-3"
      >
        <p className="text-lg font-semibold" style={{ color: colorHex }}>
          Skills
        </p>
        {shown === "list" && (
          <ul className="list-disc space-y-0.5 pl-4 text-sm">
            {skills.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>
        )}
        {shown === "bars" && (
          <SkillBars skills={withLevel} levels={levels} resumeData={resumeData} />
        )}
        {shown === "dots" && (
          <SkillDots skills={withLevel} levels={levels} resumeData={resumeData} />
        )}
        {shown === "ring" && (
          <SkillRings skills={withLevel} levels={levels} resumeData={resumeData} />
        )}
        {shown === "chips" && (
          <SkillChips skills={skills} resumeData={resumeData} />
        )}
        {(shown === "bars" || shown === "dots" || shown === "ring") &&
          withoutLevel.length > 0 && (
            <SkillChips skills={withoutLevel} resumeData={resumeData} />
          )}
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
