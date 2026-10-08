import type { Prisma } from "../../generated/client";
import { parseStoredBullets, visibleBullets } from "./bullets";
import type { ResumeServerData } from "./types";
import { hideableSections, type ResumeValues } from "./validation";

export const resumeSections = hideableSections;

type Hideable = { hidden?: boolean };

function withoutHidden<T extends Hideable>(entries: T[] | undefined) {
  return entries?.filter((entry) => !entry.hidden);
}

// What the preview and PDF show: hidden sections, entries and bullets are
// dropped. The editor keeps holding the full data, so nothing is lost.
export function forOutput(values: ResumeValues): ResumeValues {
  const hiddenSections = new Set(values.hiddenSections ?? []);
  const showing = (section: (typeof resumeSections)[number]) =>
    !hiddenSections.has(section);

  return {
    ...values,
    summary: showing("summary") ? values.summary : undefined,
    workExperiences: showing("workExperiences")
      ? withoutHidden(values.workExperiences)?.map((experience) => ({
          ...experience,
          bullets: visibleBullets(experience.bullets),
        }))
      : [],
    educations: showing("educations") ? withoutHidden(values.educations) : [],
    links: showing("links") ? withoutHidden(values.links) : [],
    certifications: showing("certifications")
      ? withoutHidden(values.certifications)
      : [],
    languages: showing("languages") ? withoutHidden(values.languages) : [],
    projects: showing("projects")
      ? withoutHidden(values.projects)?.map((project) => ({
          ...project,
          bullets: visibleBullets(project.bullets),
        }))
      : [],
    skills: showing("skills") ? values.skills : [],
  };
}

// The create data for a tailored copy. It carries no id or timestamps and no
// link back to the master, so the copy stays independent of it (ADR 0001).
export function buildTailoredCopy(
  source: ResumeServerData,
  label: string,
): Prisma.ResumeUncheckedCreateInput {
  return {
    userId: source.userId,
    title: label,
    description: source.description,
    photoUrl: source.photoUrl,
    colorHex: source.colorHex,
    borderStyle: source.borderStyle,
    template: source.template,
    summary: source.summary,
    firstName: source.firstName,
    lastName: source.lastName,
    jobTitle: source.jobTitle,
    city: source.city,
    country: source.country,
    phone: source.phone,
    email: source.email,
    skills: [...source.skills],
    hiddenSections: [...source.hiddenSections],
    isMaster: false,
    isTailored: true,
    workExperiences: {
      create: source.workExperiences.map((experience) => ({
        position: experience.position,
        company: experience.company,
        startDate: experience.startDate,
        endDate: experience.endDate,
        bullets: parseStoredBullets(experience.bullets),
        hidden: experience.hidden,
        sortOrder: experience.sortOrder,
      })),
    },
    educations: {
      create: source.educations.map((education) => ({
        degree: education.degree,
        school: education.school,
        startDate: education.startDate,
        endDate: education.endDate,
        hidden: education.hidden,
        sortOrder: education.sortOrder,
      })),
    },
    links: {
      create: source.links.map((link) => ({
        label: link.label,
        url: link.url,
        hidden: link.hidden,
        sortOrder: link.sortOrder,
      })),
    },
    certifications: {
      create: source.certifications.map((certification) => ({
        name: certification.name,
        issuer: certification.issuer,
        issuedDate: certification.issuedDate,
        url: certification.url,
        hidden: certification.hidden,
        sortOrder: certification.sortOrder,
      })),
    },
    languages: {
      create: source.languages.map((language) => ({
        name: language.name,
        level: language.level,
        hidden: language.hidden,
        sortOrder: language.sortOrder,
      })),
    },
    projects: {
      create: source.projects.map((project) => ({
        name: project.name,
        url: project.url,
        startDate: project.startDate,
        endDate: project.endDate,
        bullets: parseStoredBullets(project.bullets),
        hidden: project.hidden,
        sortOrder: project.sortOrder,
      })),
    },
  };
}
