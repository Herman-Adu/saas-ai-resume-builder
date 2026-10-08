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
import {
  MAX_CV_PDF_BYTES,
  cvImportMessages,
  type CvImportFailure,
} from "@/lib/cv-import";
import { FileUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { importCv } from "./importCvAction";

interface ImportCvButtonProps {
  canImport: boolean;
}

export default function ImportCvButton({ canImport }: ImportCvButtonProps) {
  const premiumModal = usePremiumModal();
  const { toast } = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();

  function showProblem(code: CvImportFailure) {
    toast({ variant: "destructive", description: cvImportMessages[code] });
  }

  function handleClick() {
    if (!canImport) {
      premiumModal.setOpen(true);
      return;
    }
    setOpen(true);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const chosen = event.target.files?.[0] ?? null;
    if (chosen && chosen.size > MAX_CV_PDF_BYTES) {
      event.target.value = "";
      setFile(null);
      showProblem("too_large");
      return;
    }
    setFile(chosen);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      showProblem("empty");
      return;
    }

    const formData = new FormData();
    formData.set("file", file);

    startTransition(async () => {
      try {
        const result = await importCv(formData);
        if (!result.ok) {
          showProblem(result.code);
          return;
        }
        setOpen(false);
        setFile(null);
        router.push(`/editor?resumeId=${result.id}`);
      } catch {
        showProblem("ai_failed");
      }
    });
  }

  return (
    <>
      <Button variant="outline" onClick={handleClick} className="gap-2">
        <FileUp className="size-5" aria-hidden />
        Import CV from PDF
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Import your CV</DialogTitle>
              <DialogDescription>
                Upload a text-based PDF, such as LinkedIn&apos;s Save to PDF.
                We turn it into a new resume you can review and edit.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="cv-file">CV file (PDF, up to 4 MB)</Label>
              <Input
                id="cv-file"
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileChange}
                required
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Your file is read in memory and never saved. Its text is sent to
              our AI provider to build the resume. The provider does not train
              on it and keeps it for up to 30 days to detect abuse.
            </p>
            <DialogFooter>
              <LoadingButton type="submit" loading={isPending} disabled={!file}>
                Import CV
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
