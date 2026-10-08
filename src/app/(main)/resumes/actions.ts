"use server";

import prisma from "@/lib/prisma";
import { getAuthUserId } from "@/lib/session";
import { del } from "@vercel/blob";
import { revalidatePath } from "next/cache";

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

  // check if the resume has an photo url and if so delete so wed dont have redundent images stored in vercel
  if (resume.photoUrl) {
    await del(resume.photoUrl);
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
