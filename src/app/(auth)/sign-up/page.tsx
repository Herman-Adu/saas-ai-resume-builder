import { getAuthUserId } from "@/lib/session";
import { isResumeTemplate, templateOptions } from "@/lib/templates";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AuthCard from "../AuthCard";
import SignUpForm from "./SignUpForm";

export const metadata: Metadata = {
  title: "Create account",
  robots: { index: false, follow: true },
};

interface PageProps {
  searchParams: Promise<{ template?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { template: requested } = await searchParams;
  const template = isResumeTemplate(requested) ? requested : undefined;

  if (await getAuthUserId()) {
    redirect(template ? `/editor?template=${template}` : "/resumes");
  }

  const label = templateOptions.find((option) => option.id === template)?.label;

  return (
    <AuthCard
      title="Create your account"
      description="Build your first resume in minutes."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-foreground underline">
            Sign in
          </Link>
        </>
      }
    >
      {label ? (
        <p
          data-testid="signup-template"
          className="mb-4 text-sm text-muted-foreground"
        >
          Starting with the {label} template.
        </p>
      ) : null}
      <SignUpForm template={template} />
    </AuthCard>
  );
}
