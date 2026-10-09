"use server";

import {
  acceptedChangesSchema,
  analysisSchema,
  applyJobSuggestions,
  describeResumeForJob,
  jobInputSchema,
  jobTailorSystemPrompt,
  sanitizeAnalysis,
  wrapCvDescription,
  wrapJobPost,
  type AcceptedChanges,
  type JobCopyResult,
  type JobInput,
  type JobTailorFailure,
  type JobTailorResult,
} from "@/lib/job-tailor";
import openai from "@/lib/openai";
import {
  canCreateTailoredResume,
  canTailorToJob,
  canTailorToJobToday,
  cvImportWindowStart,
} from "@/lib/permissions";
import prisma from "@/lib/prisma";
import { getAuthUserId } from "@/lib/session";
import { getUserSubscriptionLevel } from "@/lib/subscription";
import { buildTailoredCopy } from "@/lib/tailoring";
import { resumeDataInclude } from "@/lib/types";
import { zodResponseFormat } from "openai/helpers/zod";
import { revalidatePath } from "next/cache";

type Refusal = { ok: false; code: JobTailorFailure };

// Every check that does not need the AI, shared by both actions so a refusal
// never costs a model call or a write.
async function checkAccess(input: JobInput) {
  const userId = await getAuthUserId();
  if (!userId) return { ok: false, code: "unauthorized" } as Refusal;

  const subscriptionLevel = await getUserSubscriptionLevel(userId);
  if (!canTailorToJob(subscriptionLevel)) {
    return { ok: false, code: "upgrade_required" } as Refusal;
  }

  const job = jobInputSchema.safeParse(input);
  if (!job.success) return { ok: false, code: "invalid_input" } as Refusal;

  const [master, tailoredCount] = await Promise.all([
    prisma.resume.findFirst({
      where: { userId, isMaster: true },
      include: resumeDataInclude,
    }),
    prisma.resume.count({ where: { userId, isTailored: true } }),
  ]);
  if (!master) return { ok: false, code: "no_master" } as Refusal;
  if (!canCreateTailoredResume(subscriptionLevel, tailoredCount)) {
    return { ok: false, code: "tailored_limit" } as Refusal;
  }

  return { ok: true as const, userId, subscriptionLevel, job: job.data, master };
}

// The CV and job post are sent to the model and are not logged or stored here.
// Nothing is saved until the user accepts changes in createJobTailoredCopy.
export async function analyzeJob(input: JobInput): Promise<JobTailorResult> {
  const access = await checkAccess(input);
  if (!access.ok) return access;
  const { userId, subscriptionLevel, job, master } = access;

  const runsToday = await prisma.tailorRun.count({
    where: { userId, createdAt: { gte: cvImportWindowStart() } },
  });
  if (!canTailorToJobToday(subscriptionLevel, runsToday)) {
    return { ok: false, code: "daily_limit" };
  }

  // Recorded before the AI call so a failed call still counts toward the limit.
  await prisma.tailorRun.create({ data: { userId } });

  const jobText = [
    job.title && `Title: ${job.title}`,
    job.company && `Company: ${job.company}`,
    job.post,
  ]
    .filter(Boolean)
    .join("\n");

  let parsed: unknown;
  try {
    const completion = await openai.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: jobTailorSystemPrompt },
        {
          role: "user",
          content: `${wrapJobPost(jobText)}\n\n${wrapCvDescription(describeResumeForJob(master))}`,
        },
      ],
      response_format: zodResponseFormat(analysisSchema, "job_analysis"),
    });
    parsed = completion.choices[0]?.message.parsed;
  } catch {
    return { ok: false, code: "ai_failed" };
  }

  const analysis = analysisSchema.safeParse(parsed);
  if (!analysis.success) return { ok: false, code: "ai_failed" };

  return { ok: true, analysis: sanitizeAnalysis(analysis.data, master) };
}

function copyLabel(title?: string, company?: string) {
  const label = [title, company].filter(Boolean).join(" at ");
  return (label || "Tailored to a job").slice(0, 80);
}

export async function createJobTailoredCopy(
  input: JobInput & { accepted: AcceptedChanges },
): Promise<JobCopyResult> {
  const { accepted, ...jobInput } = input;
  const access = await checkAccess(jobInput);
  if (!access.ok) return access;
  const { userId, job, master } = access;

  const choices = acceptedChangesSchema.safeParse(accepted);
  if (!choices.success) return { ok: false, code: "invalid_input" };

  const saved = await prisma.job.create({
    data: {
      userId,
      title: job.title,
      company: job.company,
      postText: job.post,
    },
  });

  const copy = await prisma.resume.create({
    data: {
      ...buildTailoredCopy(
        applyJobSuggestions(master, choices.data),
        copyLabel(job.title, job.company),
      ),
      jobId: saved.id,
    },
  });

  revalidatePath("/resumes");
  return { ok: true, id: copy.id };
}
