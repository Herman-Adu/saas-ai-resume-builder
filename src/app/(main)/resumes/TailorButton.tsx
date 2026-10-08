"use client";

import LoadingButton from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import usePremiumModal from "@/hooks/usePremiumModal";
import { Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { tailorResume } from "./actions";

interface TailorButtonProps {
  canTailor: boolean;
  hasMaster: boolean;
}

export default function TailorButton({
  canTailor,
  hasMaster,
}: TailorButtonProps) {
  const premiumModal = usePremiumModal();
  const { toast } = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!canTailor) {
      premiumModal.setOpen(true);
      return;
    }

    if (!hasMaster) {
      toast({
        variant: "destructive",
        description:
          "Mark one of your resumes as the master first, using its menu.",
      });
      return;
    }

    setOpen(true);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      try {
        const { id } = await tailorResume(label);
        setOpen(false);
        setLabel("");
        router.push(`/editor?resumeId=${id}`);
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          description: "Could not tailor your resume. Please try again.",
        });
      }
    });
  }

  return (
    <>
      <Button variant="outline" onClick={handleClick} className="gap-2">
        <Wand2 className="size-5" aria-hidden />
        Tailor master resume
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Tailor your master resume</DialogTitle>
              <DialogDescription>
                This copies your master into a new resume you can trim for one
                job. Your master stays exactly as it is.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="tailor-label">Tailored for</Label>
              <Input
                id="tailor-label"
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                placeholder="Acme, Product Designer"
                maxLength={100}
                required
              />
            </div>
            <DialogFooter>
              <LoadingButton
                type="submit"
                loading={isPending}
                disabled={label.trim().length === 0}
              >
                Create tailored resume
              </LoadingButton>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
