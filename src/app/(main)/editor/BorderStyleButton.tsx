import { Button } from "@/components/ui/button";
import { Circle, Square, Squircle } from "lucide-react";
import { useSubscriptionLevel } from "../SubscriptionLevelProvider";
import usePremiumModal from "@/hooks/usePremiumModal";
import { canUseCustomizations } from "@/lib/permissions";

export const BorderStyles = {
  SQUARE: "square",
  CIRCLE: "circle",
  SQUIRCLE: "squircle",
};

const borderStyles = Object.values(BorderStyles);

interface BorderStyleButtonProps {
  borderStyle: string | undefined;
  onChange: (borderStyle: string) => void;
}

export default function BorderStyleButton({
  borderStyle,
  onChange,
}: BorderStyleButtonProps) {
  // get user subscription level from the useSubscriptionLevel hook
  const subscriptionLevel = useSubscriptionLevel();

  // get preium model from the usePremiumModal hook
  const premiumModal = usePremiumModal();

  function handleClick() {
    // check the user can use customizations, if not open premium modal
    if (!canUseCustomizations(subscriptionLevel)) {
      premiumModal.setOpen(true);
      return;
    }

    const currentIndex = borderStyle ? borderStyles.indexOf(borderStyle) : 0;

    // find next element we want to select
    const nextIndex = (currentIndex + 1) % borderStyles.length;

    onChange(borderStyles[nextIndex]);
  }

  const Icon =
    borderStyle === "square"
      ? Square
      : borderStyle === "circle"
        ? Circle
        : Squircle;

  return (
    <Button
      variant="outline"
      size="icon"
      title="Change border style"
      onClick={handleClick}
    >
      <Icon className="size-5" />
    </Button>
  );
}
