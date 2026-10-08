import OrbitLogo from "@/components/OrbitLogo";
import ThemeToggle from "@/components/ThemeToggle";
import Link from "next/link";
import UserMenu from "./UserMenu";

interface NavbarProps {
  user: { name: string; email: string };
}

export default function Navbar({ user }: NavbarProps) {
  return (
    <header className="shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 p-3">
        <Link href="/resumes" aria-label="Orbit CV, my resumes">
          <OrbitLogo />
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
