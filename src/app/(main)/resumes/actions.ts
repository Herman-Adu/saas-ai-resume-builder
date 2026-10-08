"use server";

import {
  canCreateTailoredResume,
  canTailor,
} from "@/lib/permissions";
import prisma from "@/lib/prisma";
import { getAuthUserId } from "@/lib/session";
import { getUserSubscriptionLevel } from "@/lib/subscription";
import { buildTailoredCopy } from "@/lib/tailoring";
import { resumeDataInclude } from "@/lib/types";
import { del } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const tailorLabelSchema = z.string().trim().min(1, "Required").max(100);

export async function deleteResume(id: string) {
  const userId = await getAuthUserId();

  // check we got a userId
  if (!userId) {
    throw new Error("User not authenticated");
  }

  // find the resume you eant to delete
  const resume = await prisma.resume.findUnique({
    where: {
      id,
      userId,
    },
  });

  // check we got a resume
  if (!resume) {
    throw new Error("Resume not found");
  }

  // Tailored copies share the master's photo, so only delete the file once no
  // other resume points at it.
  if (resume.photoUrl) {
    const stillUsed = await prisma.resume.count({
      where: { photoUrl: resume.photoUrl, id: { not: id } },
    });

    if (stillUsed === 0) {
      await del(resume.photoUrl);
    }
  }

  // delete the resume
  await prisma.resume.delete({
    where: {
      id,
    },
  });

  // revalidate path after sserver action has completed
  revalidatePath("/resumes");
}

export async function setMasterResume(id: string) {
  const userId = await getAuthUserId();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const resume = await prisma.resume.findUnique({ where: { id, userId } });

  if (!resume) {
    throw new Error("Resume not found");
  }

  if (resume.isTailored) {
    throw new Error("A tailored resume cannot be the master resume");
  }

  // One transaction so the partial unique index never sees two masters.
  await prisma.$transaction([
    prisma.resume.updateMany({
      where: { userId, isMaster: true },
      data: { isMaster: false },
    }),
    prisma.resume.update({
      where: { id, userId },
      data: { isMaster: true },
    }),
  ]);

  revalidatePath("/resumes");
}

export async function tailorResume(label: string) {
  const userId = await getAuthUserId();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const title = tailorLabelSchema.parse(label);

  const [master, subscriptionLevel] = await Promise.all([
    prisma.resume.findFirst({
      where: { userId, isMaster: true },
      include: resumeDataInclude,
    }),
    getUserSubscriptionLevel(userId),
  ]);

  if (!canTailor(subscriptionLevel)) {
    throw new Error("Tailoring is not available for this subscription level");
  }

  if (!master) {
    throw new Error("Mark a master resume before tailoring");
  }

  const tailoredCount = await prisma.resume.count({
    where: { userId, isTailored: true },
  });

  if (!canCreateTailoredResume(subscriptionLevel, tailoredCount)) {
    throw new Error(
      "Maximum tailored resume count reached for this subscription level",
    );
  }

  const copy = await prisma.resume.create({
    data: buildTailoredCopy(master, title),
  });

  revalidatePath("/resumes");

  return { id: copy.id };
}
