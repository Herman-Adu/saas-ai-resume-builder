import { getSession } from "@/lib/session";
import type { Metadata } from "next";
import LandingFooter from "../_landing/LandingFooter";
import LandingHeader from "../_landing/LandingHeader";
import TemplateShowcase from "./TemplateShowcase";

export const metadata: Metadata = {
  title: "Resume templates",
  description:
    "Browse ten professional CV templates filled with example content, from executive to graduate to ATS-friendly. Pick one and start your own in minutes.",
  alternates: { canonical: "/templates" },
};

export default async function TemplatesPage() {
  const signedIn = Boolean(await getSession());

  return (
    <>
      <LandingHeader signedIn={signedIn} />
      <main className="mx-auto max-w-6xl space-y-10 px-4 py-12 sm:px-6">
        <div className="max-w-2xl space-y-3">
          <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Resume templates that read well and get past the filters
          </h1>
          <p className="text-pretty text-muted-foreground">
            Every template below is shown with example content for a made-up
            candidate. Switch the example to see how different careers look,
            then start your own with the layout you like.
          </p>
        </div>
        <TemplateShowcase />
      </main>
      <LandingFooter />
    </>
  );
}
