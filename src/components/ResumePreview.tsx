"use client";

import useDimensions from "@/hooks/useDimensions";
import {
  effectivePageBackground,
  fontFamilyFor,
  pageBackgroundStyle,
  parseFontPair,
  parsePageBackground,
} from "@/lib/page-style";
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
  const background = effectivePageBackground(
    parsePageBackground(resumeData.pageBackground),
    template,
  );
  const fontPair = parseFontPair(resumeData.fontPair);

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
        className={cn(
          layoutClassName,
          !width && "invisible",
          background !== "plain" && "min-h-[1123px] print:min-h-0",
        )}
        style={{
          zoom: (1 / 794) * width,
          ...pageBackgroundStyle(background, resumeData.colorHex),
          fontFamily: fontFamilyFor(fontPair),
        }}
        data-page-background={background}
        data-font-pair={fontPair}
        ref={contentRef}
        id="resumePreviewContent"
      >
        <Body resumeData={resumeData} />
      </div>
    </div>
  );
}
