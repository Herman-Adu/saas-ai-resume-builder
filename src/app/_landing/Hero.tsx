import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import ResumeSheet from "./ResumeSheet";

interface HeroProps {
  signedIn: boolean;
}

export default function Hero({ signedIn }: HeroProps) {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-12 sm:px-6 md:pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
      <div className="flex flex-col items-start gap-6 motion-safe:duration-700 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4">
        <p className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-muted-foreground">
          <Sparkles className="size-4 text-brand" aria-hidden="true" />
          AI-written, human-approved
        </p>
        <h1 className="text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
          Your resume, written in minutes and ready to send
        </h1>
        <p className="max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
          Fill in the facts. Orbit CV drafts your summary and work experience,
          shows the finished page as you type, and exports a print-ready PDF.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <Link href={signedIn ? "/resumes" : "/sign-up"}>
              {signedIn ? "Open my resumes" : "Start free"}
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/#how-it-works">See how it works</Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Free for your first resume. No card needed.
        </p>
      </div>

      <div className="mx-auto w-full max-w-md motion-safe:delay-150 motion-safe:duration-1000 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-8 lg:max-w-none">
        <div className="relative">
          <ResumeSheet />
          <p className="absolute -bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-lg sm:-left-4">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Profile drafted by AI
          </p>
        </div>
      </div>
    </section>
  );
}
