"use server";

import { canCreateResume, canUseCustomizations } from "@/lib/permissions";
import prisma from "@/lib/prisma";
import { getUserSubscriptionLevel } from "@/lib/subscription";
import { resumeSchema, ResumeValues } from "@/lib/validation";
import { auth } from "@clerk/nextjs/server";
import { del, put } from "@vercel/blob";
import path from "path";

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

  console.log("received values", values);

  // validate the Resume values
  const { photo, workExperiences, educations, ...resumeValues } =
    resumeSchema.parse(values);

  // get user
  const { userId } = await auth();

  // check user
  if (!userId) {
    throw new Error("User not authenticated");
  }

  // get user subscription level
  const subscriptionLevel = await getUserSubscriptionLevel(userId);

  // Check resume count for non-premium users, dont block for updating resume, via check if its a new resume id
  if (!id) {
    const resumeCount = await prisma.resume.count({ where: { userId } });

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
        workExperiences: {
          deleteMany: {},
          create: workExperiences?.map((exp) => ({
            ...exp,
            startDate: exp.startDate ? new Date(exp.startDate) : undefined,
            endDate: exp.endDate ? new Date(exp.endDate) : undefined,
          })),
        },
        educations: {
          deleteMany: {},
          create: educations?.map((edu) => ({
            ...edu,
            startDate: edu.startDate ? new Date(edu.startDate) : undefined,
            endDate: edu.endDate ? new Date(edu.endDate) : undefined,
          })),
        },
        updatedAt: new Date(),
      },
    });
  } else {
    return prisma.resume.create({
      data: {
        ...resumeValues,
        userId,
        photoUrl: newPhotoUrl,
        workExperiences: {
          create: workExperiences?.map((exp) => ({
            ...exp,
            startDate: exp.startDate ? new Date(exp.startDate) : undefined,
            endDate: exp.endDate ? new Date(exp.endDate) : undefined,
          })),
        },
        educations: {
          create: educations?.map((edu) => ({
            ...edu,
            startDate: edu.startDate ? new Date(edu.startDate) : undefined,
            endDate: edu.endDate ? new Date(edu.endDate) : undefined,
          })),
        },
      },
    });
  }
}
