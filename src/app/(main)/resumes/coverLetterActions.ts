"use server";

import {
  assembleCoverLetter,
  coverLetterBodySchema,
  coverLetterOutputSchema,
  coverLetterSystemPrompt,
  type CoverLetterResult,
  type SaveLetterResult,
} from "@/lib/cover-letter";
import {
  describeResumeForJob,
  wrapCvDescription,
  wrapJobPost,
} from "@/lib/job-tailor";
import openai from "@/lib/openai";
import {
  canWriteCoverLetter,
  canWriteCoverLetterToday,
  cvImportWindowStart,
} from "@/lib/permissions";
import prisma from "@/lib/prisma";
import { getAuthUserId } from "@/lib/session";
import { getUserSubscriptionLevel } from "@/lib/subscription";
import { resumeDataInclude } from "@/lib/types";
import { zodResponseFormat } from "openai/helpers/zod";

// The CV and job post are sent to the model and are not logged or stored here.
// Nothing is saved until the user saves in saveCoverLetter.
export async function generateCoverLetter(
  resumeId: string,
): Promise<CoverLetterResult> {
  const userId = await getAuthUserId();
  if (!userId) return { ok: false, code: "unauthorized" };

  const subscriptionLevel = await getUserSubscriptionLevel(userId);
  if (!canWriteCoverLetter(subscriptionLevel)) {
    return { ok: false, code: "upgrade_required" };
  }

  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, userId },
    include: { ...resumeDataInclude, job: true },
  });
  if (!resume) return { ok: false, code: "not_found" };
  if (!resume.job) return { ok: false, code: "no_job" };

  const runsToday = await prisma.coverLetterRun.count({
    where: { userId, createdAt: { gte: cvImportWindowStart() } },
  });
  if (!canWriteCoverLetterToday(subscriptionLevel, runsToday)) {
    return { ok: false, code: "daily_limit" };
  }

  // Recorded before the AI call so a failed call still counts toward the limit.
  await prisma.coverLetterRun.create({ data: { userId } });

  const jobText = [
    resume.job.title && `Title: ${resume.job.title}`,
    resume.job.company && `Company: ${resume.job.company}`,
    resume.job.postText,
  ]
    .filter(Boolean)
    .join("\n");

  let parsed: unknown;
  try {
    const completion = await openai.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: coverLetterSystemPrompt },
        {
          role: "user",
          content: `${wrapJobPost(jobText)}\n\n${wrapCvDescription(describeResumeForJob(resume))}`,
        },
      ],
      response_format: zodResponseFormat(
        coverLetterOutputSchema,
        "cover_letter",
      ),
    });
    parsed = completion.choices[0]?.message.parsed;
  } catch {
    return { ok: false, code: "ai_failed" };
  }

  const output = coverLetterOutputSchema.safeParse(parsed);
  if (!output.success) return { ok: false, code: "ai_failed" };

  const text = assembleCoverLetter(output.data.paragraphs, resume);
  if (!text) return { ok: false, code: "ai_failed" };

  return { ok: true, text };
}

export async function saveCoverLetter(
  resumeId: string,
  body: string,
): Promise<SaveLetterResult> {
  const userId = await getAuthUserId();
  if (!userId) return { ok: false, code: "unauthorized" };

  const subscriptionLevel = await getUserSubscriptionLevel(userId);
  if (!canWriteCoverLetter(subscriptionLevel)) {
    return { ok: false, code: "upgrade_required" };
  }

  const letter = coverLetterBodySchema.safeParse(body);
  if (!letter.success) return { ok: false, code: "invalid_input" };

  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, userId },
    select: { jobId: true },
  });
  if (!resume) return { ok: false, code: "not_found" };
  if (!resume.jobId) return { ok: false, code: "no_job" };

  await prisma.coverLetter.upsert({
    where: { jobId: resume.jobId },
    create: { userId, jobId: resume.jobId, body: letter.data },
    update: { body: letter.data },
  });

  return { ok: true };
}
