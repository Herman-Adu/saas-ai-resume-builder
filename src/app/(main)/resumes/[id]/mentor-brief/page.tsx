import { parseStoredMentorBrief } from "@/lib/mentor-brief";
import { canWriteMentorBrief } from "@/lib/permissions";
import prisma from "@/lib/prisma";
import { getAuthUserId } from "@/lib/session";
import { getUserSubscriptionLevel } from "@/lib/subscription";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import MentorBriefView from "./MentorBriefView";

export const metadata: Metadata = {
  title: "Company mentor brief",
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
          mentorBrief: { select: { content: true } },
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
    <main className="mx-auto w-full max-w-3xl space-y-6 px-3 py-6">
      <div className="space-y-2">
        <Link
          href="/resumes"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Your resumes
        </Link>
        <h1 className="text-3xl font-bold">Company mentor brief</h1>
        <p className="text-muted-foreground">
          {jobLabel || resume.title || "Tailored resume"}
        </p>
      </div>
      <MentorBriefView
        resumeId={resume.id}
        initialBrief={parseStoredMentorBrief(resume.job.mentorBrief?.content)}
        canWrite={canWriteMentorBrief(subscriptionLevel)}
      />
    </main>
  );
}
