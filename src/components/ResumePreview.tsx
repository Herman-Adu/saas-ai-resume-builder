"use client";

import useDimensions from "@/hooks/useDimensions";
import { forOutput } from "@/lib/tailoring";
import { parseTemplate } from "@/lib/templates";
import { cn } from "@/lib/utils";
import { ResumeValues } from "@/lib/validation";
import { useMemo, useRef } from "react";
import { templateLayouts } from "./resume-templates";

interface ResumePreviewProps {
  resumeData: ResumeValues;
  contentRef?: React.Ref<HTMLDivElement>;
  className?: string;
}

export default function ResumePreview({
  resumeData: fullResumeData,
  contentRef,
  className,
}: ResumePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const resumeData = useMemo(() => forOutput(fullResumeData), [fullResumeData]);

  const { width } = useDimensions(containerRef);

  const template = parseTemplate(resumeData.template);
  const { className: layoutClassName, Body } = templateLayouts[template];

  return (
    <div
      data-testid="resume-preview"
      data-template={template}
      className={cn(
        "aspect-210/297 h-fit w-full bg-white text-black",
        className,
      )}
      ref={containerRef}
    >
      <div
        className={cn(layoutClassName, !width && "invisible")}
        style={{
          zoom: (1 / 794) * width,
        }}
        ref={contentRef}
        id="resumePreviewContent"
      >
        <Body resumeData={resumeData} />
      </div>
    </div>
  );
}
