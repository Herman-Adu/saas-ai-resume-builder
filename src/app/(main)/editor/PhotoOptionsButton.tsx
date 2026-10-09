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
  parsePhotoPosition,
  parsePhotoShape,
  parsePhotoSize,
  photoPositions,
  photoShapes,
  photoSizes,
} from "@/lib/photo-options";
import type { ResumeValues } from "@/lib/validation";
import { UserRound } from "lucide-react";
import { useSubscriptionLevel } from "../SubscriptionLevelProvider";

interface PhotoOptionsButtonProps {
  resumeData: ResumeValues;
  onChange: (changes: Partial<ResumeValues>) => void;
}

const label = (value: string) => value[0].toUpperCase() + value.slice(1);

export default function PhotoOptionsButton({
  resumeData,
  onChange,
}: PhotoOptionsButtonProps) {
  const subscriptionLevel = useSubscriptionLevel();
  const premiumModal = usePremiumModal();

  const shape = parsePhotoShape(resumeData.photoShape, resumeData.borderStyle);
  const position = parsePhotoPosition(resumeData.photoPosition);
  const size = parsePhotoSize(resumeData.photoSize);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          title="Photo options"
          onClick={(event) => {
            if (!canUseCustomizations(subscriptionLevel)) {
              event.preventDefault();
              premiumModal.setOpen(true);
            }
          }}
        >
          <UserRound className="size-5" />
          <span className="sr-only">Photo options</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 space-y-4" align="start">
        <OptionGroup
          name="Shape"
          values={photoShapes}
          current={shape}
          onSelect={(photoShape) => onChange({ photoShape })}
        />
        <OptionGroup
          name="Side"
          values={photoPositions}
          current={position}
          onSelect={(photoPosition) => onChange({ photoPosition })}
        />
        <OptionGroup
          name="Size"
          values={photoSizes}
          current={size}
          onSelect={(photoSize) => onChange({ photoSize })}
        />
        <p className="text-xs text-muted-foreground">
          Templates without a photo area ignore these.
        </p>
      </PopoverContent>
    </Popover>
  );
}

interface OptionGroupProps<T extends string> {
  name: string;
  values: readonly T[];
  current: T;
  onSelect: (value: T) => void;
}

function OptionGroup<T extends string>({
  name,
  values,
  current,
  onSelect,
}: OptionGroupProps<T>) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium">{name}</p>
      <div role="group" aria-label={`Photo ${name.toLowerCase()}`} className="flex gap-1.5">
        {values.map((value) => (
          <Button
            key={value}
            type="button"
            size="sm"
            variant={value === current ? "default" : "outline"}
            aria-pressed={value === current}
            className="flex-1"
            onClick={() => onSelect(value)}
          >
            {label(value)}
          </Button>
        ))}
      </div>
    </div>
  );
}
