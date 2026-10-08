"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import usePremiumModal from "@/hooks/usePremiumModal";
import { canUseTemplate } from "@/lib/permissions";
import {
  parseTemplate,
  templateOptions,
  type ResumeTemplate,
} from "@/lib/templates";
import { Check, LayoutTemplate, Lock } from "lucide-react";
import { useSubscriptionLevel } from "../SubscriptionLevelProvider";

interface TemplatePickerProps {
  template: string | undefined;
  onChange: (template: ResumeTemplate) => void;
}

export default function TemplatePicker({
  template,
  onChange,
}: TemplatePickerProps) {
  const subscriptionLevel = useSubscriptionLevel();
  const premiumModal = usePremiumModal();
  const selected = parseTemplate(template);

  function handleSelect(option: ResumeTemplate) {
    if (!canUseTemplate(subscriptionLevel, option)) {
      premiumModal.setOpen(true);
      return;
    }
    onChange(option);
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          title="Change template"
          aria-label="Change template"
        >
          <LayoutTemplate className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {templateOptions.map((option) => {
          const locked = !canUseTemplate(subscriptionLevel, option.id);

          return (
            <DropdownMenuItem
              key={option.id}
              data-testid={`template-option-${option.id}`}
              data-locked={locked}
              onSelect={() => handleSelect(option.id)}
              className="flex items-start gap-3"
            >
              <div className="flex-1 space-y-0.5">
                <p className="text-sm font-medium">{option.label}</p>
                <p className="text-xs text-muted-foreground">
                  {option.description}
                </p>
              </div>
              {locked ? (
                <>
                  <Lock className="mt-0.5 size-4 text-muted-foreground" />
                  <span className="sr-only">Requires a paid plan</span>
                </>
              ) : (
                selected === option.id && (
                  <>
                    <Check className="mt-0.5 size-4" />
                    <span className="sr-only">Selected</span>
                  </>
                )
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
