import OrbitLogo from "@/components/OrbitLogo";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const sections = [
  { id: "how-it-works", label: "How it works" },
  { id: "features", label: "Features" },
  { id: "pricing", label: "Pricing" },
  { id: "faq", label: "FAQ" },
] as const;

interface LandingHeaderProps {
  signedIn: boolean;
}

export default function LandingHeader({ signedIn }: LandingHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-sm supports-backdrop-filter:bg-background/70">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/" aria-label="Orbit CV, home">
          <OrbitLogo />
        </Link>

        <nav
          aria-label="Sections"
          className="order-last -mx-1 flex w-full items-center gap-1 overflow-x-auto md:order-0 md:mx-0 md:w-auto"
        >
          {sections.map((section) => (
            <Link
              key={section.id}
              href={`/#${section.id}`}
              className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
            >
              {section.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {signedIn ? (
            <Button asChild>
              <Link href="/resumes">My resumes</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-up">Start free</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
