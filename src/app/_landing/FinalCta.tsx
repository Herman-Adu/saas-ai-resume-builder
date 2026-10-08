import { Button } from "@/components/ui/button";
import Link from "next/link";

interface FinalCtaProps {
  signedIn: boolean;
}

export default function FinalCta({ signedIn }: FinalCtaProps) {
  return (
    <section
      aria-labelledby="final-cta-title"
      className="mx-auto max-w-6xl px-4 pb-24 sm:px-6"
    >
      <div className="flex flex-col items-start justify-between gap-6 rounded-lg bg-primary p-8 text-primary-foreground md:flex-row md:items-center md:p-12">
        <div className="flex flex-col gap-2">
          <h2
            id="final-cta-title"
            className="text-balance font-display text-3xl font-bold tracking-tight"
          >
            Your next application starts here
          </h2>
          <p className="max-w-lg">
            Build your first resume for free. It takes a few minutes.
          </p>
        </div>
        <Button asChild size="lg" variant="secondary">
          <Link href={signedIn ? "/resumes" : "/sign-up"}>
            {signedIn ? "Open my resumes" : "Create my resume"}
          </Link>
        </Button>
      </div>
    </section>
  );
}
