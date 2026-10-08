"use server";

import {
  canCreateResume,
  canUseCustomizations,
  canUseTemplate,
} from "@/lib/permissions";
import { defaultTemplate } from "@/lib/templates";
import prisma from "@/lib/prisma";
import { getUserSubscriptionLevel } from "@/lib/subscription";
import { resumeSchema, ResumeValues } from "@/lib/validation";
import { getAuthUserId } from "@/lib/session";
import { del, put } from "@vercel/blob";
import path from "path";

function toDate(value: string | undefined) {
  return value ? new Date(value) : undefined;
}

async function deletePhotoIfUnused(photoUrl: string, excludeResumeId?: string) {
  const usageCount = await prisma.resume.count({
    where: {
      photoUrl,
      ...(excludeResumeId ? { id: { not: excludeResumeId } } : {}),
    },
  });

  if (usageCount === 0) {
    await del(photoUrl);
  }
}

export async function saveResume(values: ResumeValues) {
  const { id } = values;

  // validate the Resume values
  const {
    photo,
    workExperiences,
    educations,
    links,
    certifications,
    languages,
    projects,
    ...resumeValues
  } = resumeSchema.parse(values);

  const sectionRows = {
    workExperiences: workExperiences?.map((exp, sortOrder) => ({
      position: exp.position,
      company: exp.company,
      startDate: toDate(exp.startDate),
      endDate: toDate(exp.endDate),
      bullets: exp.bullets ?? [],
      hidden: exp.hidden ?? false,
      sortOrder,
    })),
    educations: educations?.map((edu, sortOrder) => ({
      degree: edu.degree,
      school: edu.school,
      startDate: toDate(edu.startDate),
      endDate: toDate(edu.endDate),
      hidden: edu.hidden ?? false,
      sortOrder,
    })),
    links: links?.map((link, sortOrder) => ({
      label: link.label,
      url: link.url,
      hidden: link.hidden ?? false,
      sortOrder,
    })),
    certifications: certifications?.map((cert, sortOrder) => ({
      name: cert.name,
      issuer: cert.issuer,
      issuedDate: toDate(cert.issuedDate),
      url: cert.url,
      hidden: cert.hidden ?? false,
      sortOrder,
    })),
    languages: languages?.map((language, sortOrder) => ({
      name: language.name,
      level: language.level,
      hidden: language.hidden ?? false,
      sortOrder,
    })),
    projects: projects?.map((project, sortOrder) => ({
      name: project.name,
      url: project.url,
      startDate: toDate(project.startDate),
      endDate: toDate(project.endDate),
      bullets: project.bullets ?? [],
      hidden: project.hidden ?? false,
      sortOrder,
    })),
  };

  // get user
  const userId = await getAuthUserId();

  // check user
  if (!userId) {
    throw new Error("User not authenticated");
  }

  // get user subscription level
  const subscriptionLevel = await getUserSubscriptionLevel(userId);

  // Check resume count for non-premium users, dont block for updating resume, via check if its a new resume id
  if (!id) {
    const resumeCount = await prisma.resume.count({
      where: { userId, isTailored: false },
    });

    if (!canCreateResume(subscriptionLevel, resumeCount)) {
      throw new Error(
        "Maximum resume count reached for this subscription level",
      );
    }
  }

  // get resume from database
  const existingResume = id
    ? await prisma.resume.findUnique({ where: { id, userId } })
    : null;

  // check we have an id and no existing resume - then something is wrong
  if (id && !existingResume) {
    throw new Error("Resume not found");
  }

  // check if resume has customizations
  const hasCustomizations =
    (resumeValues.borderStyle &&
      resumeValues.borderStyle !== existingResume?.borderStyle) ||
    (resumeValues.colorHex &&
      resumeValues.colorHex !== existingResume?.colorHex);

  // check user has customizations for subscription level
  if (hasCustomizations && !canUseCustomizations(subscriptionLevel)) {
    throw new Error("Customizations not allowed for this subscription level");
  }

  // Only a change is gated, so a user who downgrades keeps the template they
  // already have and can still save the resume.
  const requestedTemplate = resumeValues.template;
  const currentTemplate = existingResume?.template ?? defaultTemplate;

  if (
    requestedTemplate &&
    requestedTemplate !== currentTemplate &&
    !canUseTemplate(subscriptionLevel, requestedTemplate)
  ) {
    throw new Error("Template not allowed for this subscription level");
  }

  // upload photo to vercel blob sttorage
  let newPhotoUrl: string | undefined | null = undefined;

  if (photo instanceof File) {
    // upload file to blob with a unique path to avoid collisions
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    const blob = await put(`resume_photos/${uniqueName}${path.extname(photo.name)}`, photo, {
      access: "public",
    });

    newPhotoUrl = blob.url;
  } else if (typeof photo === "string") {
    // photo is already a URL string from a previous resume — reuse it as-is
    newPhotoUrl = photo;
  } else if (photo === null) {
    newPhotoUrl = null;
  }

  // If the old photo URL is being replaced or removed and no longer referenced, clean it up
  if (existingResume?.photoUrl && existingResume.photoUrl !== newPhotoUrl) {
    await deletePhotoIfUnused(existingResume.photoUrl, id ?? undefined);
  }

  if (id) {
    return prisma.resume.update({
      where: { id },
      data: {
        ...resumeValues,
        photoUrl: newPhotoUrl,
        workExperiences: { deleteMany: {}, create: sectionRows.workExperiences },
        educations: { deleteMany: {}, create: sectionRows.educations },
        links: { deleteMany: {}, create: sectionRows.links },
        certifications: { deleteMany: {}, create: sectionRows.certifications },
        languages: { deleteMany: {}, create: sectionRows.languages },
        projects: { deleteMany: {}, create: sectionRows.projects },
        updatedAt: new Date(),
      },
    });
  } else {
    return prisma.resume.create({
      data: {
        ...resumeValues,
        userId,
        photoUrl: newPhotoUrl,
        workExperiences: { create: sectionRows.workExperiences },
        educations: { create: sectionRows.educations },
        links: { create: sectionRows.links },
        certifications: { create: sectionRows.certifications },
        languages: { create: sectionRows.languages },
        projects: { create: sectionRows.projects },
      },
    });
  }
}
