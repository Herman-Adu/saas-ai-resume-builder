"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import usePremiumModal from "@/hooks/usePremiumModal";
import { canUseCustomizations } from "@/lib/permissions";
import {
  effectiveSkillStyle,
  parseSkillStyle,
  skillStyles,
  templateShowsSkillCharts,
} from "@/lib/skill-options";
import { defaultTemplate } from "@/lib/templates";
import type { ResumeValues } from "@/lib/validation";
import { ChartBarBig } from "lucide-react";
import { useSubscriptionLevel } from "../SubscriptionLevelProvider";

interface SkillStyleButtonProps {
  resumeData: ResumeValues;
  onChange: (changes: Partial<ResumeValues>) => void;
}

const label = (value: string) => value[0].toUpperCase() + value.slice(1);

export default function SkillStyleButton({
  resumeData,
  onChange,
}: SkillStyleButtonProps) {
  const subscriptionLevel = useSubscriptionLevel();
  const premiumModal = usePremiumModal();

  const chosen = parseSkillStyle(resumeData.skillsStyle);
  const template = resumeData.template ?? defaultTemplate;
  const shown = effectiveSkillStyle(chosen, template);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          title="Skills style"
          onClick={(event) => {
            if (!canUseCustomizations(subscriptionLevel)) {
              event.preventDefault();
              premiumModal.setOpen(true);
            }
          }}
        >
          <ChartBarBig className="size-5" />
          <span className="sr-only">Skills style</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 space-y-3" align="start">
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Skills style</p>
          <div
            role="group"
            aria-label="Skills style"
            className="flex flex-wrap gap-1.5"
          >
            {skillStyles.map((style) => (
              <Button
                key={style}
                type="button"
                size="sm"
                variant={style === chosen ? "default" : "outline"}
                aria-pressed={style === chosen}
                onClick={() => onChange({ skillsStyle: style })}
              >
                {label(style)}
              </Button>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Bars, dots and ring need a level on the skill (set in the Skills
          step) and appear in the Modern, Creative, Tech and Elegant
          templates.
          {!templateShowsSkillCharts(template) && chosen !== shown
            ? " This template shows chips instead."
            : ""}
        </p>
      </PopoverContent>
    </Popover>
  );
}
