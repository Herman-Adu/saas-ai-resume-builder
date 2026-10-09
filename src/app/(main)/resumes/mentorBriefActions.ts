"use server";

import {
  describeResumeForJob,
  wrapCvDescription,
  wrapJobPost,
} from "@/lib/job-tailor";
import {
  mentorBriefOutputSchema,
  mentorBriefSystemPrompt,
  normalizeMentorBrief,
  type MentorBriefResult,
} from "@/lib/mentor-brief";
import openai from "@/lib/openai";
import {
  canWriteMentorBrief,
  canWriteMentorBriefToday,
  cvImportWindowStart,
} from "@/lib/permissions";
import prisma from "@/lib/prisma";
import { getAuthUserId } from "@/lib/session";
import { getUserSubscriptionLevel } from "@/lib/subscription";
import { resumeDataInclude } from "@/lib/types";
import { zodResponseFormat } from "openai/helpers/zod";

// The CV and job post are sent to the model and are not logged here. Only the
// generated brief is stored, against the job, and nothing is written to the CV.
export async function generateMentorBrief(
  resumeId: string,
): Promise<MentorBriefResult> {
  const userId = await getAuthUserId();
  if (!userId) return { ok: false, code: "unauthorized" };

  const subscriptionLevel = await getUserSubscriptionLevel(userId);
  if (!canWriteMentorBrief(subscriptionLevel)) {
    return { ok: false, code: "upgrade_required" };
  }

  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, userId },
    include: { ...resumeDataInclude, job: true },
  });
  if (!resume) return { ok: false, code: "not_found" };
  if (!resume.job) return { ok: false, code: "no_job" };

  const runsToday = await prisma.mentorBriefRun.count({
    where: { userId, createdAt: { gte: cvImportWindowStart() } },
  });
  if (!canWriteMentorBriefToday(subscriptionLevel, runsToday)) {
    return { ok: false, code: "daily_limit" };
  }

  // Recorded before the AI call so a failed call still counts toward the limit.
  await prisma.mentorBriefRun.create({ data: { userId } });

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
        { role: "system", content: mentorBriefSystemPrompt },
        {
          role: "user",
          content: `${wrapJobPost(jobText)}\n\n${wrapCvDescription(describeResumeForJob(resume))}`,
        },
      ],
      response_format: zodResponseFormat(
        mentorBriefOutputSchema,
        "mentor_brief",
      ),
    });
    parsed = completion.choices[0]?.message.parsed;
  } catch {
    return { ok: false, code: "ai_failed" };
  }

  const output = mentorBriefOutputSchema.safeParse(parsed);
  if (!output.success) return { ok: false, code: "ai_failed" };

  const brief = normalizeMentorBrief(output.data);
  if (!brief) return { ok: false, code: "ai_failed" };

  await prisma.mentorBrief.upsert({
    where: { jobId: resume.job.id },
    create: { userId, jobId: resume.job.id, content: brief },
    update: { content: brief },
  });

  return { ok: true, brief };
}
