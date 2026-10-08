import { getAuthUserId } from "@/lib/session";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AuthCard from "../AuthCard";
import SignUpForm from "./SignUpForm";

export const metadata: Metadata = {
  title: "Create account",
};

export default async function Page() {
  if (await getAuthUserId()) {
    redirect("/resumes");
  }

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
      <SignUpForm />
    </AuthCard>
  );
}
