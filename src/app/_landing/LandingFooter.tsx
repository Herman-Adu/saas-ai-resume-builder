import OrbitLogo from "@/components/OrbitLogo";
import Link from "next/link";

export default function LandingFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center">
        <div className="flex flex-col gap-2">
          <OrbitLogo />
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Orbit CV. All rights reserved.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          <Link
            href="/templates"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Templates
          </Link>
          <Link
            href="/tos"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Terms of service
          </Link>
          <Link
            href="/sign-in"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Create account
          </Link>
        </nav>
      </div>
    </footer>
  );
}
