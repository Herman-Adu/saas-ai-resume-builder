import { getAuthUserId } from "@/lib/session";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AuthCard from "../AuthCard";
import SignInForm from "./SignInForm";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function Page() {
  if (await getAuthUserId()) {
    redirect("/resumes");
  }

  return (
    <AuthCard
      title="Sign in"
      description="Welcome back. Enter your email and password."
      footer={
        <>
          New here?{" "}
          <Link href="/sign-up" className="font-medium text-foreground underline">
            Create an account
          </Link>
        </>
      }
    >
      <SignInForm />
    </AuthCard>
  );
}
