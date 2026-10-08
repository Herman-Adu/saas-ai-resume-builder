"use server";

import {
  MAX_CV_PDF_BYTES,
  buildImportedResume,
  checkCvFile,
  cvImportSystemPrompt,
  importedCvSchema,
  looksScanned,
  prepareCvText,
  wrapCvText,
  type ImportCvResult,
} from "@/lib/cv-import";
import openai from "@/lib/openai";
import { extractPdfText } from "@/lib/pdf-text";
import {
  canCreateResume,
  canImportCv,
  canImportCvToday,
  cvImportWindowStart,
} from "@/lib/permissions";
import prisma from "@/lib/prisma";
import { getAuthUserId } from "@/lib/session";
import { getUserSubscriptionLevel } from "@/lib/subscription";
import { zodResponseFormat } from "openai/helpers/zod";
import { revalidatePath } from "next/cache";

// Every rejection happens before the AI call, so a refused upload costs nothing.
// Nothing from the upload is logged or stored: only the resume it produces.
export async function importCv(formData: FormData): Promise<ImportCvResult> {
  const userId = await getAuthUserId();
  if (!userId) return { ok: false, code: "unauthorized" };

  const subscriptionLevel = await getUserSubscriptionLevel(userId);
  if (!canImportCv(subscriptionLevel)) {
    return { ok: false, code: "upgrade_required" };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, code: "empty" };
  if (file.size > MAX_CV_PDF_BYTES) return { ok: false, code: "too_large" };

  const bytes = new Uint8Array(await file.arrayBuffer());
  const problem = checkCvFile(bytes);
  if (problem) return { ok: false, code: problem };

  const [baseCount, importsToday] = await Promise.all([
    prisma.resume.count({ where: { userId, isTailored: false } }),
    prisma.cvImport.count({
      where: { userId, createdAt: { gte: cvImportWindowStart() } },
    }),
  ]);
  if (!canCreateResume(subscriptionLevel, baseCount)) {
    return { ok: false, code: "base_limit" };
  }
  if (!canImportCvToday(importsToday)) {
    return { ok: false, code: "daily_limit" };
  }

  let cvText: string;
  try {
    cvText = prepareCvText(await extractPdfText(bytes));
  } catch {
    return { ok: false, code: "unreadable" };
  }
  if (looksScanned(cvText)) return { ok: false, code: "scanned" };

  // Recorded before the AI call so a failed call still counts toward the limit.
  await prisma.cvImport.create({ data: { userId } });

  let parsed: unknown;
  try {
    const completion = await openai.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: cvImportSystemPrompt },
        { role: "user", content: wrapCvText(cvText) },
      ],
      response_format: zodResponseFormat(importedCvSchema, "imported_cv"),
    });
    parsed = completion.choices[0]?.message.parsed;
  } catch {
    return { ok: false, code: "ai_failed" };
  }

  const cv = importedCvSchema.safeParse(parsed);
  if (!cv.success) return { ok: false, code: "ai_failed" };

  const resume = await prisma.resume.create({
    data: buildImportedResume(userId, cv.data),
  });

  revalidatePath("/resumes");
  return { ok: true, id: resume.id };
}
