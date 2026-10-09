import { canWriteCoverLetter } from "@/lib/permissions";
import prisma from "@/lib/prisma";
import { getAuthUserId } from "@/lib/session";
import { getUserSubscriptionLevel } from "@/lib/subscription";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CoverLetterEditor from "./CoverLetterEditor";

export const metadata: Metadata = {
  title: "Cover letter",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const userId = await getAuthUserId();
  if (!userId) notFound();

  const resume = await prisma.resume.findFirst({
    where: { id, userId },
    select: {
      id: true,
      title: true,
      job: {
        select: {
          title: true,
          company: true,
          coverLetter: { select: { body: true } },
        },
      },
    },
  });
  if (!resume?.job) notFound();

  const subscriptionLevel = await getUserSubscriptionLevel(userId);
  const jobLabel = [resume.job.title, resume.job.company]
    .filter(Boolean)
    .join(" at ");

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-3 py-6 print:p-0">
      <div className="space-y-2 print:hidden">
        <Link
          href="/resumes"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Your resumes
        </Link>
        <h1 className="text-3xl font-bold">Cover letter</h1>
        <p className="text-muted-foreground">
          {jobLabel || resume.title || "Tailored resume"}
        </p>
      </div>
      <CoverLetterEditor
        resumeId={resume.id}
        documentTitle={`Cover letter - ${jobLabel || "job"}`}
        initialBody={resume.job.coverLetter?.body ?? ""}
        canWrite={canWriteCoverLetter(subscriptionLevel)}
      />
    </main>
  );
}
