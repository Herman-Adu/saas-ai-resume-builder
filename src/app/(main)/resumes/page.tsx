import prisma from "@/lib/prisma";
import { resumeDataInclude } from "@/lib/types";
import { getAuthUserId } from "@/lib/session";
import { Metadata } from "next";
import ResumeItem from "./ResumeItem";
import CreateResumeButton from "./CreateResumeButton";
import ImportCvButton from "./ImportCvButton";
import TailorButton from "./TailorButton";
import { getUserSubscriptionLevel } from "@/lib/subscription";
import {
  canCreateResume,
  canCreateTailoredResume,
  canImportCv,
  canTailor,
} from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Your resumes",
};

export default async function Page() {
  const userId = await getAuthUserId();

  if (!userId) {
    return null;
  }

  const [resumes, totalCount, subscriptionLevel] = await Promise.all([
    prisma.resume.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: resumeDataInclude,
    }),
    prisma.resume.count({
      where: {
        userId,
      },
    }),
    getUserSubscriptionLevel(userId),
  ]);

  // Tailored copies have their own cap, so they don't use up base resumes.
  const baseCount = resumes.filter((resume) => !resume.isTailored).length;
  const tailoredCount = resumes.length - baseCount;

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-3 py-6">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <CreateResumeButton
          canCreate={canCreateResume(subscriptionLevel, baseCount)}
        />
        <ImportCvButton
          canImport={
            canImportCv(subscriptionLevel) &&
            canCreateResume(subscriptionLevel, baseCount)
          }
        />
        <TailorButton
          canTailor={
            canTailor(subscriptionLevel) &&
            canCreateTailoredResume(subscriptionLevel, tailoredCount)
          }
          hasMaster={resumes.some((resume) => resume.isMaster)}
        />
      </div>
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Your resumes</h1>
        <p>Total: {totalCount}</p>
      </div>
      <div className="flex w-full grid-cols-2 flex-col gap-3 sm:grid md:grid-cols-3 lg:grid-cols-4">
        {resumes.map((resume) => (
          <ResumeItem key={resume.id} resume={resume} />
        ))}
      </div>
    </main>
  );
}
