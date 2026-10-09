"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import usePremiumModal from "@/hooks/usePremiumModal";
import {
  effectivePageBackground,
  fontPairs,
  pageBackgrounds,
  parseFontPair,
  parsePageBackground,
} from "@/lib/page-style";
import { canUseCustomizations } from "@/lib/permissions";
import { defaultTemplate } from "@/lib/templates";
import type { ResumeValues } from "@/lib/validation";
import { Paintbrush } from "lucide-react";
import { useSubscriptionLevel } from "../SubscriptionLevelProvider";

interface PageStyleButtonProps {
  resumeData: ResumeValues;
  onChange: (changes: Partial<ResumeValues>) => void;
}

const label = (value: string) => value[0].toUpperCase() + value.slice(1);

export default function PageStyleButton({
  resumeData,
  onChange,
}: PageStyleButtonProps) {
  const subscriptionLevel = useSubscriptionLevel();
  const premiumModal = usePremiumModal();

  const chosenBackground = parsePageBackground(resumeData.pageBackground);
  const chosenFont = parseFontPair(resumeData.fontPair);
  const template = resumeData.template ?? defaultTemplate;
  const shownBackground = effectivePageBackground(chosenBackground, template);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          title="Page style"
          onClick={(event) => {
            if (!canUseCustomizations(subscriptionLevel)) {
              event.preventDefault();
              premiumModal.setOpen(true);
            }
          }}
        >
          <Paintbrush className="size-5" />
          <span className="sr-only">Page style</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 space-y-3" align="start">
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Background</p>
          <div
            role="group"
            aria-label="Page background"
            className="flex flex-wrap gap-1.5"
          >
            {pageBackgrounds.map((background) => (
              <Button
                key={background}
                type="button"
                size="sm"
                variant={background === chosenBackground ? "default" : "outline"}
                aria-pressed={background === chosenBackground}
                onClick={() => onChange({ pageBackground: background })}
              >
                {label(background)}
              </Button>
            ))}
          </div>
          {chosenBackground !== shownBackground && (
            <p className="text-xs text-muted-foreground">
              This template stays plain, so the page prints without a
              background.
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Fonts</p>
          <div
            role="group"
            aria-label="Font pairing"
            className="flex flex-wrap gap-1.5"
          >
            {fontPairs.map((pair) => (
              <Button
                key={pair}
                type="button"
                size="sm"
                variant={pair === chosenFont ? "default" : "outline"}
                aria-pressed={pair === chosenFont}
                onClick={() => onChange({ fontPair: pair })}
              >
                {label(pair)}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
