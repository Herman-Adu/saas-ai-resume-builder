"use client";

import LoadingButton from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  MAX_LETTER_CHARS,
  coverLetterMessages,
  type CoverLetterFailure,
} from "@/lib/cover-letter";
import { Printer, Sparkles } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { useReactToPrint } from "react-to-print";
import { generateCoverLetter, saveCoverLetter } from "../../coverLetterActions";

interface CoverLetterEditorProps {
  resumeId: string;
  documentTitle: string;
  initialBody: string;
  canWrite: boolean;
}

export default function CoverLetterEditor({
  resumeId,
  documentTitle,
  initialBody,
  canWrite,
}: CoverLetterEditorProps) {
  const { toast } = useToast();
  const [body, setBody] = useState(initialBody);
  const [savedBody, setSavedBody] = useState(initialBody);
  const [isGenerating, startGenerating] = useTransition();
  const [isSaving, startSaving] = useTransition();
  const sheetRef = useRef<HTMLDivElement>(null);

  const print = useReactToPrint({ contentRef: sheetRef, documentTitle });
  const hasUnsavedChanges = body.trim() !== savedBody.trim();

  function showFailure(code: CoverLetterFailure) {
    toast({ variant: "destructive", description: coverLetterMessages[code] });
  }

  function handleGenerate() {
    startGenerating(async () => {
      const result = await generateCoverLetter(resumeId);
      if (!result.ok) return showFailure(result.code);
      setBody(result.text);
    });
  }

  function handleSave() {
    startSaving(async () => {
      const result = await saveCoverLetter(resumeId, body);
      if (!result.ok) return showFailure(result.code);
      setSavedBody(body);
      toast({ description: "Cover letter saved." });
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2 print:block">
      <section className="space-y-4 print:hidden">
        {!canWrite && (
          <p
            role="status"
            className="rounded-md border p-3 text-sm text-muted-foreground"
          >
            {coverLetterMessages.upgrade_required}
          </p>
        )}
        <div className="space-y-2">
          <Label htmlFor="cover-letter-body">Your letter</Label>
          <Textarea
            id="cover-letter-body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            maxLength={MAX_LETTER_CHARS}
            rows={18}
            placeholder="Write the letter yourself, or let AI draft it from your resume and the job post."
          />
          <p className="text-xs text-muted-foreground">
            {body.length.toLocaleString("en-GB")} /{" "}
            {MAX_LETTER_CHARS.toLocaleString("en-GB")} characters. AI drafts
            only use facts from your resume. Read and edit before you send.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <LoadingButton
            type="button"
            variant="secondary"
            loading={isGenerating}
            disabled={!canWrite || isSaving}
            onClick={handleGenerate}
          >
            <Sparkles className="mr-2 size-4" />
            {body.trim() ? "Redraft with AI" : "Draft with AI"}
          </LoadingButton>
          <LoadingButton
            type="button"
            loading={isSaving}
            disabled={
              !canWrite || isGenerating || !body.trim() || !hasUnsavedChanges
            }
            onClick={handleSave}
          >
            Save letter
          </LoadingButton>
          <Button
            type="button"
            variant="outline"
            disabled={!body.trim()}
            onClick={() => print()}
          >
            <Printer className="mr-2 size-4" />
            Print or save as PDF
          </Button>
        </div>
      </section>
      <section aria-label="Letter preview">
        <div
          ref={sheetRef}
          className="min-h-[24rem] whitespace-pre-wrap break-words bg-white p-8 text-sm leading-relaxed text-black shadow-md print:p-0 print:shadow-none"
        >
          {body}
        </div>
      </section>
    </div>
  );
}
