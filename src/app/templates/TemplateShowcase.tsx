"use client";

import ResumePreview from "@/components/ResumePreview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { samplePeople, sampleResume } from "@/lib/template-samples";
import { defaultTemplate, templateOptions } from "@/lib/templates";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";

export default function TemplateShowcase() {
  const [personId, setPersonId] = useState(samplePeople[0].id);

  return (
    <div className="space-y-8">
      <div
        role="tablist"
        aria-label="Sample CV"
        className="flex flex-wrap gap-2"
      >
        {samplePeople.map((person) => {
          const selected = person.id === personId;
          return (
            <button
              key={person.id}
              type="button"
              role="tab"
              id={`tab-${person.id}`}
              aria-selected={selected}
              aria-controls="template-panel"
              onClick={() => setPersonId(person.id)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {person.label}
            </button>
          );
        })}
      </div>

      <div
        id="template-panel"
        role="tabpanel"
        aria-labelledby={`tab-${personId}`}
        className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4"
      >
        {templateOptions.map((option) => (
          <article key={option.id} className="flex flex-col gap-4">
            <div className="overflow-hidden rounded-lg border shadow-sm">
              <ResumePreview resumeData={sampleResume(personId, option.id)} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{option.label}</h2>
                <Badge variant="secondary">
                  {option.id === defaultTemplate ? "Free" : "Pro"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {option.description}
              </p>
            </div>
            <Button asChild className="mt-auto">
              <Link href={`/sign-up?template=${option.id}`}>
                Use the {option.label} template
              </Link>
            </Button>
          </article>
        ))}
      </div>
    </div>
  );
}
