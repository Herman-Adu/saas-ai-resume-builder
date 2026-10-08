import { cn } from "@/lib/utils";

interface OrbitLogoProps {
  className?: string;
}

export function OrbitMark({ className }: OrbitLogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn("size-8 shrink-0", className)}
    >
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <ellipse
        cx="16"
        cy="16"
        rx="11"
        ry="4.5"
        transform="rotate(-30 16 16)"
        fill="none"
        strokeWidth="1.75"
        className="stroke-primary-foreground"
      />
      <circle cx="16" cy="16" r="3.5" className="fill-primary-foreground" />
    </svg>
  );
}

export default function OrbitLogo({ className }: OrbitLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <OrbitMark />
      <span className="font-display text-xl font-bold tracking-tight">
        Orbit CV
      </span>
    </span>
  );
}
