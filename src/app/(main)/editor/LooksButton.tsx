"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import usePremiumModal from "@/hooks/usePremiumModal";
import { activeLookId, lookChanges, looks } from "@/lib/looks";
import { canUseCustomizations } from "@/lib/permissions";
import type { ResumeValues } from "@/lib/validation";
import { Sparkles } from "lucide-react";
import { useSubscriptionLevel } from "../SubscriptionLevelProvider";

interface LooksButtonProps {
  resumeData: ResumeValues;
  onChange: (changes: Partial<ResumeValues>) => void;
}

export default function LooksButton({ resumeData, onChange }: LooksButtonProps) {
  const subscriptionLevel = useSubscriptionLevel();
  const premiumModal = usePremiumModal();
  const activeId = activeLookId(resumeData);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          title="Looks"
          onClick={(event) => {
            if (!canUseCustomizations(subscriptionLevel)) {
              event.preventDefault();
              premiumModal.setOpen(true);
            }
          }}
        >
          <Sparkles className="size-5" />
          <span className="sr-only">Looks</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 space-y-2" align="start">
        <p className="text-sm font-medium">Looks</p>
        <div role="group" aria-label="Looks" className="space-y-1.5">
          {looks.map((look) => (
            <Button
              key={look.id}
              type="button"
              variant={look.id === activeId ? "default" : "outline"}
              aria-pressed={look.id === activeId}
              className="h-auto w-full flex-col items-start gap-0.5 whitespace-normal py-2 text-left"
              onClick={() => {
                const changes = lookChanges(look.id);
                if (changes) onChange(changes);
              }}
            >
              <span className="text-sm font-medium">{look.label}</span>
              <span className="text-xs font-normal opacity-80">
                {look.description}
              </span>
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Sets the photo, skills style, page background and fonts. You can
          still change each one afterwards.
        </p>
      </PopoverContent>
    </Popover>
  );
}
