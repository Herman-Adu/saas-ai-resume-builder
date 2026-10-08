"use client";

import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Trash2 } from "lucide-react";

interface BulletRowShellProps {
  bulletIndex: number;
  hidden: boolean;
  onToggleHidden: () => void;
  onRemove: () => void;
  children: React.ReactNode;
}

// The text field is passed in as children because its form path is typed per
// form; the hide and remove buttons are the same everywhere.
export default function BulletRowShell({
  bulletIndex,
  hidden,
  onToggleHidden,
  onRemove,
  children,
}: BulletRowShellProps) {
  return (
    <div className="flex items-start gap-1">
      {children}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-pressed={hidden}
        aria-label={
          hidden
            ? `Show bullet ${bulletIndex + 1}`
            : `Hide bullet ${bulletIndex + 1}`
        }
        onClick={onToggleHidden}
      >
        {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Remove bullet ${bulletIndex + 1}`}
        onClick={onRemove}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
