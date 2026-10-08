import { cn } from "@/lib/utils";
import {
  Download,
  Eye,
  Palette,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

interface Feature {
  title: string;
  body: string;
  icon: LucideIcon;
  className?: string;
}

const features: readonly Feature[] = [
  {
    title: "AI writing that starts from your facts",
    body: "Give it a role and a few details. It returns clear, specific bullet points and a profile summary you can edit freely. Included with Pro and Pro Plus.",
    icon: Sparkles,
    className: "md:col-span-2",
  },
  {
    title: "Live preview",
    body: "See exactly what the recipient will see, updated as you type, with your changes saved automatically.",
    icon: Eye,
  },
  {
    title: "Print-ready PDF",
    body: "Export a clean A4 PDF with sensible margins, ready to attach or upload.",
    icon: Download,
  },
  {
    title: "Your colours, your borders",
    body: "Pick an accent colour and a border style that suits the job you are applying for. Included with Pro Plus.",
    icon: Palette,
    className: "md:col-span-2",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      aria-labelledby="features-title"
      className="mx-auto max-w-6xl px-4 py-20 sm:px-6"
    >
      <h2
        id="features-title"
        className="max-w-2xl text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl"
      >
        Everything a good resume needs, nothing it does not
      </h2>
      <ul className="mt-12 grid gap-4 md:grid-cols-3">
        {features.map(({ title, body, icon: Icon, className }) => (
          <li
            key={title}
            className={cn(
              "flex flex-col gap-3 rounded-lg border bg-card p-6",
              className,
            )}
          >
            <Icon className="size-6 text-brand" aria-hidden="true" />
            <h3 className="font-display text-xl font-semibold">{title}</h3>
            <p className="leading-relaxed text-muted-foreground">{body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
