import ResumePreview from "@/components/ResumePreview";
import { ResumeValues } from "@/lib/validation";
import BorderStyleButton from "./BorderStyleButton";
import ColorPicker from "./ColorPicker";
import PageStyleButton from "./PageStyleButton";
import PhotoOptionsButton from "./PhotoOptionsButton";
import SkillStyleButton from "./SkillStyleButton";
import TemplatePicker from "./TemplatePicker";
import { cn } from "@/lib/utils";

interface ResumePreviewSectionProps {
  resumeData: ResumeValues;
  setResumeData: (data: ResumeValues) => void;
  className?: string;
}

export default function ResumePreviewSection({
  resumeData,
  setResumeData,
  className,
}: ResumePreviewSectionProps) {
  return (
    <div
      className={cn("group relative hidden w-full md:flex md:w-1/2", className)}
    >
      <div className="absolute left-1 top-1 flex flex-none flex-col gap-3 opacity-50 transition-opacity group-hover:opacity-100 lg:left-3 lg:top-3 xl:opacity-100">
        <TemplatePicker
          template={resumeData.template}
          onChange={(template) => setResumeData({ ...resumeData, template })}
        />
        <ColorPicker
          color={resumeData.colorHex}
          onChange={(color) =>
            setResumeData({ ...resumeData, colorHex: color.hex })
          }
        />
        <BorderStyleButton
          borderStyle={resumeData.borderStyle}
          onChange={(borderStyle) =>
            setResumeData({ ...resumeData, borderStyle })
          }
        />
        <PhotoOptionsButton
          resumeData={resumeData}
          onChange={(changes) => setResumeData({ ...resumeData, ...changes })}
        />
        <SkillStyleButton
          resumeData={resumeData}
          onChange={(changes) => setResumeData({ ...resumeData, ...changes })}
        />
        <PageStyleButton
          resumeData={resumeData}
          onChange={(changes) => setResumeData({ ...resumeData, ...changes })}
        />
      </div>
      <div className="flex w-full justify-center overflow-y-auto bg-secondary p-3">
        <ResumePreview
          resumeData={resumeData}
          className="max-w-2xl shadow-md"
        />
      </div>
      {/* <pre>{JSON.stringify(resumeData, null, 2)}</pre> */}
    </div>
  );
}
