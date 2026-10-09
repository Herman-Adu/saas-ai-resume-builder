import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { parseStoredBullets } from "./bullets";
import {
  isPhotoShape,
  parsePhotoPosition,
  parsePhotoSize,
} from "./photo-options";
import { parseTemplate } from "./templates";
import { ResumeServerData } from "./types";
import {
  hideableSections,
  type HideableSection,
  type ResumeValues,
} from "./validation";

function toDateInput(date: Date | null) {
  return date?.toISOString().split("T")[0];
}

function parseHiddenSections(stored: string[] | null): HideableSection[] {
  return (stored ?? []).filter((section): section is HideableSection =>
    (hideableSections as readonly string[]).includes(section),
  );
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fileReplacer(key: unknown, value: unknown) {
  return value instanceof File
    ? {
        name: value.name,
        size: value.size,
        type: value.type,
        lastModified: value.lastModified,
      }
    : value;
}

export function mapToResumeValues(data: ResumeServerData): ResumeValues {
  return {
    id: data.id,
    title: data.title || undefined,
    description: data.description || undefined,
    photo: data.photoUrl || undefined,
    firstName: data.firstName || undefined,
    lastName: data.lastName || undefined,
    jobTitle: data.jobTitle || undefined,
    city: data.city || undefined,
    country: data.country || undefined,
    phone: data.phone || undefined,
    email: data.email || undefined,
    workExperiences: data.workExperiences.map((exp) => ({
      position: exp.position || undefined,
      company: exp.company || undefined,
      startDate: toDateInput(exp.startDate),
      endDate: toDateInput(exp.endDate),
      bullets: parseStoredBullets(exp.bullets),
      hidden: exp.hidden,
    })),
    educations: data.educations.map((edu) => ({
      degree: edu.degree || undefined,
      school: edu.school || undefined,
      startDate: toDateInput(edu.startDate),
      endDate: toDateInput(edu.endDate),
      hidden: edu.hidden,
    })),
    links: data.links.map((link) => ({
      label: link.label || undefined,
      url: link.url || undefined,
      hidden: link.hidden,
    })),
    certifications: data.certifications.map((cert) => ({
      name: cert.name || undefined,
      issuer: cert.issuer || undefined,
      issuedDate: toDateInput(cert.issuedDate),
      url: cert.url || undefined,
      hidden: cert.hidden,
    })),
    languages: data.languages.map((language) => ({
      name: language.name || undefined,
      level: language.level || undefined,
      hidden: language.hidden,
    })),
    projects: data.projects.map((project) => ({
      name: project.name || undefined,
      url: project.url || undefined,
      startDate: toDateInput(project.startDate),
      endDate: toDateInput(project.endDate),
      bullets: parseStoredBullets(project.bullets),
      hidden: project.hidden,
    })),
    skills: data.skills,
    borderStyle: data.borderStyle,
    photoShape: isPhotoShape(data.photoShape) ? data.photoShape : undefined,
    photoPosition: parsePhotoPosition(data.photoPosition),
    photoSize: parsePhotoSize(data.photoSize),
    colorHex: data.colorHex,
    template: parseTemplate(data.template),
    summary: data.summary || undefined,
    hiddenSections: parseHiddenSections(data.hiddenSections),
  };
}
