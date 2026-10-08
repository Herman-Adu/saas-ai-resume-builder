import { visibleBullets, type Bullet } from "@/lib/bullets";
import type { ResumeValues } from "@/lib/validation";
import { formatDate } from "date-fns";

interface SectionProps {
  resumeData: ResumeValues;
}

function SectionFrame({
  title,
  colorHex,
  children,
}: {
  title: string;
  colorHex: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <>
      <hr className="border-2" style={{ borderColor: colorHex }} />
      <div className="space-y-3">
        <p className="text-lg font-semibold" style={{ color: colorHex }}>
          {title}
        </p>
        {children}
      </div>
    </>
  );
}

function monthYear(value: string | undefined) {
  return value ? formatDate(value, "MM/yyyy") : "";
}

function dateRange(start: string | undefined, end: string | undefined) {
  if (!start) return "";
  return `${monthYear(start)} - ${end ? monthYear(end) : "Present"}`;
}

function Address({ url }: { url: string | undefined }) {
  if (!url) return null;
  return (
    <a href={url} className="break-all text-xs text-gray-600 underline">
      {url}
    </a>
  );
}

function BulletList({ bullets }: { bullets: Bullet[] | undefined }) {
  const shown = visibleBullets(bullets);
  if (!shown.length) return null;

  return (
    <ul className="list-disc space-y-0.5 pl-4 text-xs">
      {shown.map((bullet, index) => (
        <li key={index}>{bullet.text}</li>
      ))}
    </ul>
  );
}

export function LinksSection({ resumeData }: SectionProps) {
  const { links, colorHex } = resumeData;
  const entries = links?.filter((link) => !link.hidden && (link.label || link.url));

  if (!entries?.length) return null;

  return (
    <SectionFrame title="Links" colorHex={colorHex}>
      <ul className="space-y-1">
        {entries.map((link, index) => (
          <li
            key={index}
            className="break-inside-avoid flex flex-wrap items-baseline gap-x-2 text-sm"
          >
            {link.label && <span className="font-semibold">{link.label}</span>}
            <Address url={link.url} />
          </li>
        ))}
      </ul>
    </SectionFrame>
  );
}

export function CertificationsSection({ resumeData }: SectionProps) {
  const { certifications, colorHex } = resumeData;
  const entries = certifications?.filter(
    (cert) =>
      !cert.hidden && (cert.name || cert.issuer || cert.issuedDate || cert.url),
  );

  if (!entries?.length) return null;

  return (
    <SectionFrame title="Certifications" colorHex={colorHex}>
      {entries.map((cert, index) => (
        <div key={index} className="break-inside-avoid space-y-1">
          <div
            className="flex items-center justify-between text-sm font-semibold"
            style={{ color: colorHex }}
          >
            <span>{cert.name}</span>
            {cert.issuedDate && <span>{monthYear(cert.issuedDate)}</span>}
          </div>
          {cert.issuer && <p className="text-xs font-semibold">{cert.issuer}</p>}
          <Address url={cert.url} />
        </div>
      ))}
    </SectionFrame>
  );
}

export function LanguagesSection({ resumeData }: SectionProps) {
  const { languages, colorHex } = resumeData;
  const entries = languages?.filter(
    (language) => !language.hidden && (language.name || language.level),
  );

  if (!entries?.length) return null;

  return (
    <SectionFrame title="Languages" colorHex={colorHex}>
      <ul className="space-y-1 text-sm">
        {entries.map((language, index) => (
          <li key={index} className="break-inside-avoid">
            <span className="font-semibold">{language.name}</span>
            {language.name && language.level ? " - " : ""}
            {language.level}
          </li>
        ))}
      </ul>
    </SectionFrame>
  );
}

export function ProjectsSection({ resumeData }: SectionProps) {
  const { projects, colorHex } = resumeData;
  const entries = projects?.filter(
    (project) =>
      !project.hidden &&
      Boolean(
        project.name ||
          project.url ||
          project.startDate ||
          project.endDate ||
          visibleBullets(project.bullets).length,
      ),
  );

  if (!entries?.length) return null;

  return (
    <SectionFrame title="Projects" colorHex={colorHex}>
      {entries.map((project, index) => (
        <div key={index} className="break-inside-avoid space-y-1">
          <div
            className="flex items-center justify-between text-sm font-semibold"
            style={{ color: colorHex }}
          >
            <span>{project.name}</span>
            <span>{dateRange(project.startDate, project.endDate)}</span>
          </div>
          <Address url={project.url} />
          <BulletList bullets={project.bullets} />
        </div>
      ))}
    </SectionFrame>
  );
}
