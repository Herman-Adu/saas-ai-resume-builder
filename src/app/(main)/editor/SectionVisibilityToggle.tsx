"use client";

import { Button } from "@/components/ui/button";
import type { EditorFormProps } from "@/lib/types";
import type { HideableSection } from "@/lib/validation";
import { Eye, EyeOff } from "lucide-react";

interface SectionVisibilityToggleProps
  extends Pick<EditorFormProps, "resumeData" | "setResumeData"> {
  section: HideableSection;
  label: string;
}

export default function SectionVisibilityToggle({
  section,
  label,
  resumeData,
  setResumeData,
}: SectionVisibilityToggleProps) {
  const hiddenSections = resumeData.hiddenSections ?? [];
  const isHidden = hiddenSections.includes(section);

  function toggle() {
    setResumeData({
      ...resumeData,
      hiddenSections: isHidden
        ? hiddenSections.filter((hidden) => hidden !== section)
        : [...hiddenSections, section],
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      aria-pressed={isHidden}
      onClick={toggle}
      className="gap-2"
    >
      {isHidden ? (
        <EyeOff className="size-4" aria-hidden />
      ) : (
        <Eye className="size-4" aria-hidden />
      )}
      {isHidden ? `Show ${label}` : `Hide ${label}`}
    </Button>
  );
}
